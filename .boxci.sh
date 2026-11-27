#!/bin/bash
# Тесты на боксе (boxtest → /usr/local/bin/boxci-run) — ОСНОВНОЙ прогон проекта.
# Запускается от root в каталоге с кодом коммита (без .git). Повторяет оба
# задания .github/workflows/ci.yml (там теперь только ручной запасной запуск):
#   build  — Postgres + npm ci, миграции и сид, typecheck, build, unit, e2e;
#   docker — docker compose up --build --wait, запрос к /graphql, down -v.
# Шаги менять в обоих файлах.
#
# На боксе живут чужие службы и базы: всё своё — с уникальными именами
# (контейнер Postgres, проект compose), порты — свободные из высокого
# диапазона, только на 127.0.0.1. trap убирает своё при любом исходе;
# чужое не трогаем. Node — как в CI (22) в одноразовом контейнере: на хосте
# бокса другой Node.
set -euo pipefail

RUN="rgql-ci-$$-$RANDOM"
PG="$RUN-pg"
NODE="$RUN-node"
PROJECT="$RUN"
TMP=$(mktemp -d)

# app:app — только для одноразового контейнера Postgres в прогоне, как в CI.
PGUSER_=app PGPASS_=app PGDB_=resume

free_port() {  # свободный TCP-порт 40000–59999, не занятый на хосте
  local p
  for _ in $(seq 1 50); do
    p=$((40000 + RANDOM % 20000))
    if ! ss -ltnH "sport = :$p" | grep . >/dev/null; then echo "$p"; return 0; fi
  done
  echo "boxci: не нашёл свободный порт" >&2; return 1
}

compose() { docker compose -p "$PROJECT" -f docker-compose.yml -f "$TMP/override.yml" "$@"; }

cleanup() {
  local rc=$?
  set +e
  if [ -f "$TMP/override.yml" ]; then
    [ "$rc" -ne 0 ] && compose logs api 2>/dev/null | tail -100
    compose down -v --rmi local --remove-orphans >/dev/null 2>&1
  fi
  docker rm -f "$NODE" "$PG" >/dev/null 2>&1
  rm -rf "$TMP"
  exit "$rc"
}
trap cleanup EXIT INT TERM

# ---------- задание build ----------
PGPORT=$(free_port)
echo "boxci: Postgres $PG на 127.0.0.1:$PGPORT"
docker run -d --name "$PG" \
  -e POSTGRES_USER=$PGUSER_ -e POSTGRES_PASSWORD=$PGPASS_ -e POSTGRES_DB=$PGDB_ \
  -p "127.0.0.1:$PGPORT:5432" \
  --health-cmd "pg_isready -U $PGUSER_" --health-interval 3s --health-retries 20 \
  postgres:16-alpine >/dev/null
for i in $(seq 1 60); do
  st=$(docker inspect -f '{{.State.Health.Status}}' "$PG")
  [ "$st" = healthy ] && break
  [ "$i" -eq 60 ] && { echo "boxci: Postgres не поднялся ($st)"; exit 1; }
  sleep 2
done

docker run --rm --name "$NODE" --network host \
  -v "$PWD":/src -w /src \
  -e CI=true \
  -e DATABASE_URL="postgresql://$PGUSER_:$PGPASS_@127.0.0.1:$PGPORT/$PGDB_?schema=public" \
  node:22 bash -euo pipefail -c '
    node -v
    npm ci
    npx prisma migrate deploy && npx prisma db seed
    npm run typecheck
    npm run build
    npm test
    npm run test:e2e
  '
docker rm -f "$PG" >/dev/null

# ---------- задание docker ----------
# В docker-compose.yml api жёстко публикует 3000:3000 (порт на боксе занят).
# Для пользователей репозитория ничего не меняем: в прогоне override-файл
# заменяет список портов (!override, compose ≥ 2.24) на свободный порт.
APIPORT=$(free_port)
cat > "$TMP/override.yml" <<EOF
services:
  api:
    ports: !override
      - "127.0.0.1:$APIPORT:3000"
EOF
echo "boxci: compose-проект $PROJECT, api на 127.0.0.1:$APIPORT"
compose up -d --build --wait
# без grep -q в конвейере: с pipefail ранний выход grep валит curl (SIGPIPE)
OUT=$(curl -fsS "http://127.0.0.1:$APIPORT/graphql" -H 'content-type: application/json' \
  -d '{"query":"{ profile { name } }"}')
echo "$OUT"
[[ "$OUT" == *'Михаил'* ]] || { echo "boxci: в ответе /graphql нет ожидаемого имени"; exit 1; }
echo "boxci: оба задания прошли"
