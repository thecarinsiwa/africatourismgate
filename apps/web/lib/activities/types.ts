import type { ActivityDifficultyLevel } from '@africatourismgate/types';
import type { ProductGalleryImage } from '../shared/product-images';

export interface ActivitySearchQuery {
  destination?: string;
  date: string;
  participants?: number;
  page?: number;
  limit?: number;
}

export interface ActivityBrowseQuery {
  destination?: string;
  participants?: number;
  page?: number;
  limit?: number;
}

export interface ActivitySearchResult {
  id: string;
  title: string;
  durationMinutes: number | null;
  priceCents: number;
  currency: string;
  destination: string;
  providerName: string;
  availableSchedulesCount: number;
  nextStartDatetime?: string;
  imageUrl?: string | null;
  difficultyLevel?: ActivityDifficultyLevel | null;
  averageRating?: number | null;
  reviewCount?: number;
}

export interface ActivityDetailQuery {
  date: string;
  participants?: number;
}

export interface ActivityScheduleOffer {
  scheduleId: string;
  startDatetime: string;
  capacity: number;
  bookedCount: number;
  remainingPlaces: number;
  priceCents: number;
  currency: string;
}

export interface ActivityDetail {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  priceCents: number;
  currency: string;
  destination: string;
  providerName: string;
  date: string;
  participants: number;
  schedules: ActivityScheduleOffer[];
  images?: ProductGalleryImage[];
  difficultyLevel?: ActivityDifficultyLevel | null;
  averageRating?: number | null;
  reviewCount?: number;
}
