import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donations } from '../../../entities/donation.entity';
import { PublicDonationsQueryDto } from './dto/public-donations-query.dto';

export type PublicDonationDto = {
  id: string;
  title: string;
  description: string | null;
  contextNote: string | null;
  buttonLabel: string;
  url: string;
  locale: string;
  isNavbarFeatured: boolean;
  sortOrder: number;
};

export type PublicDonationsPayloadDto = {
  navbarFeatured: PublicDonationDto | null;
  items: PublicDonationDto[];
};

const DEFAULT_LOCALE = 'fr';

@Injectable()
export class PublicDonationsService {
  constructor(
    @InjectRepository(Donations)
    private readonly donationsRepository: Repository<Donations>,
  ) {}

  async getDonations(query: PublicDonationsQueryDto): Promise<PublicDonationsPayloadDto> {
    const locale = query.locale?.trim() || DEFAULT_LOCALE;
    const surface = query.surface ?? 'web';

    let items = await this.fetchPublished(locale, surface);
    if (items.length === 0 && locale !== DEFAULT_LOCALE) {
      items = await this.fetchPublished(DEFAULT_LOCALE, surface);
    }

    const navbarFeatured = items.find((item) => item.isNavbarFeatured) ?? null;

    return { navbarFeatured, items };
  }

  private async fetchPublished(
    locale: string,
    surface: 'web' | 'gap',
  ): Promise<PublicDonationDto[]> {
    const qb = this.donationsRepository
      .createQueryBuilder('donation')
      .where('donation.deletedAt IS NULL')
      .andWhere('donation.status = :status', { status: 'published' })
      .andWhere('donation.locale = :locale', { locale });

    if (surface === 'web') {
      qb.andWhere('donation.showOnWeb = :visible', { visible: true });
    } else {
      qb.andWhere('donation.showOnGap = :visible', { visible: true });
    }

    const rows = await qb
      .orderBy('donation.sortOrder', 'ASC')
      .addOrderBy('donation.title', 'ASC')
      .getMany();

    return rows.map((row) => this.toDto(row));
  }

  private toDto(donation: Donations): PublicDonationDto {
    return {
      id: donation.id,
      title: donation.title,
      description: donation.description,
      contextNote: donation.contextNote,
      buttonLabel: donation.buttonLabel,
      url: donation.url,
      locale: donation.locale,
      isNavbarFeatured: donation.isNavbarFeatured,
      sortOrder: donation.sortOrder,
    };
  }
}
