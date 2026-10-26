import { Module } from '@nestjs/common';
import { ExperienceResolver } from './experience.resolver';
import { ProfileLoadersFactory } from './loaders/profile.loaders';
import { ProfileRepository } from './profile.repository';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  providers: [ProfileRepository, ProfileService, ProfileLoadersFactory, ProfileResolver, ExperienceResolver],
  exports: [ProfileLoadersFactory],
})
export class ProfileModule {}
