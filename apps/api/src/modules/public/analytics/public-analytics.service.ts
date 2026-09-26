import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import { SitePageViews } from '../../../entities/site-page-view.entity';
import { TrackPageViewDto } from './dto/track-page-view.dto';

@Injectable()
export class PublicAnalyticsService {
  constructor(
    @InjectRepository(SitePageViews)
    private readonly repository: Repository<SitePageViews>,
  ) {}

  async trackPageView(dto: TrackPageViewDto): Promise<void> {
    await this.repository.insert({
      id: newId(),
      visitorId: dto.visitorId,
      path: dto.path.slice(0, 512),
      locale: dto.locale?.trim() ? dto.locale.trim().slice(0, 10) : null,
    });
  }
}
