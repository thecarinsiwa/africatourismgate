import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import * as entities from '../entities/generated';
import { BookingIdentityDocuments } from '../entities/booking-identity-document.entity';
import { BookingManifestEntries } from '../entities/booking-manifest-entry.entity';
import { AboutPages } from '../entities/about-page.entity';
import { AboutResources } from '../entities/about-resource.entity';
import { BlogPosts } from '../entities/blog-post.entity';
import { AboutTimelineMilestones } from '../entities/about-timeline-milestone.entity';
import { TeamMembers } from '../entities/team-member.entity';
import { WhyUsItems } from '../entities/why-us-item.entity';
import { WhyUsSections } from '../entities/why-us-section.entity';
import { HappyCustomersSections } from '../entities/happy-customers-section.entity';
import { HappyCustomersStats } from '../entities/happy-customers-stat.entity';
import { GapActivities } from '../entities/gap-activity.entity';
import { GapImpactStats } from '../entities/gap-impact-stat.entity';
import { GapMediaItems } from '../entities/gap-media-item.entity';
import { GapPages } from '../entities/gap-page.entity';
import { GapSiteSettings } from '../entities/gap-site-settings.entity';
import { Donations } from '../entities/donation.entity';
import { HeroSlides } from '../entities/hero-slide.entity';
import { EmailOperationVerifications } from '../entities/email-operation-verification.entity';
import { ensureMigrations } from './ensure-migrations';
import { ensureRbacPermissions } from './ensure-rbac-permissions';
import { ensureSchema } from './ensure-schema';
import { ensureSeeds } from './ensure-seeds';

const entityList = [
  ...Object.values(entities).filter((v) => typeof v === 'function'),
  EmailOperationVerifications,
  BlogPosts,
  AboutPages,
  TeamMembers,
  AboutTimelineMilestones,
  AboutResources,
  WhyUsSections,
  WhyUsItems,
  HappyCustomersSections,
  HappyCustomersStats,
  GapSiteSettings,
  GapPages,
  GapActivities,
  GapImpactStats,
  GapMediaItems,
  Donations,
  HeroSlides,
  BookingIdentityDocuments,
  BookingManifestEntries,
] as (new () => unknown)[];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Later files override earlier ones — .env.local must stay last (SMTP, secrets).
      envFilePath: [
        join(__dirname, '../../../../.env'),
        join(__dirname, '../../../../.env.local'),
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        await ensureSchema(config);
        await ensureMigrations(config);
        await ensureSeeds(config);
        await ensureRbacPermissions(config);
        return {
          type: 'mysql' as const,
          host: config.get<string>('DATABASE_HOST', 'localhost'),
          port: Number(config.get<string>('DATABASE_PORT', '3306')),
          username: config.get<string>('DATABASE_USER', 'root'),
          password: config.get<string>('DATABASE_PASSWORD', ''),
          database: config.get<string>('DATABASE_NAME', 'africatourismgate'),
          entities: entityList,
          synchronize: false,
          logging: config.get<string>('DATABASE_LOGGING') === 'true',
          charset: 'utf8mb4',
        };
      },
    }),
    TypeOrmModule.forFeature(entityList),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
