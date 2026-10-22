import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  FetchTerraLocationReviewsParams,
  TerraLocationReviewsResponse,
} from './tripadvisor-terra.types';

const TERRA_BASE_URL = 'https://terra.tripadvisor.com/api';
const DEFAULT_TIMEOUT_MS = 30_000;

@Injectable()
export class TripadvisorTerraClient {
  async fetchLocationReviews(
    params: FetchTerraLocationReviewsParams,
  ): Promise<TerraLocationReviewsResponse> {
    const url = new URL(
      `${TERRA_BASE_URL}/locations/${encodeURIComponent(params.locationId)}/reviews`,
    );
    url.searchParams.set('page', String(params.page));
    url.searchParams.set('size', String(params.size));
    if (params.language.trim()) {
      url.searchParams.set('language', params.language.trim());
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-API-Key': params.apiKey,
        },
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'erreur réseau inconnue';
      throw new ServiceUnavailableException(
        `Impossible de joindre l’API Tripadvisor Terra (${message}).`,
      );
    }

    if (!response.ok) {
      throw await this.mapError(response);
    }

    const body = (await response.json()) as unknown;
    return normalizeReviewsResponse(body);
  }

  private async mapError(response: Response): Promise<never> {
    const detail = await readErrorDetail(response);
    const status = response.status;

    if (status === 401) {
      throw new BadRequestException(
        detail ||
          'Clé API Tripadvisor invalide ou manquante. Vérifiez la clé dans Contenu › Avis.',
      );
    }
    if (status === 403) {
      throw new BadRequestException(
        detail ||
          'Cette clé API n’a pas accès à l’endpoint avis Tripadvisor (abonnement Terra).',
      );
    }
    if (status === 404) {
      throw new NotFoundException(
        detail ||
          'Location Tripadvisor introuvable. Vérifiez le Location ID.',
      );
    }
    if (status === 429) {
      throw new BadRequestException(
        detail ||
          'Quota ou débit Tripadvisor dépassé. Réessayez plus tard.',
      );
    }
    if (status === 400) {
      throw new BadRequestException(
        detail || 'Requête Tripadvisor invalide (paramètres).',
      );
    }

    throw new ServiceUnavailableException(
      detail ||
        `Erreur Tripadvisor Terra (HTTP ${status}). Réessayez plus tard.`,
    );
  }
}

function normalizeReviewsResponse(body: unknown): TerraLocationReviewsResponse {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data: [], pagination: null };
  }
  const raw = body as Record<string, unknown>;
  const data = Array.isArray(raw.data) ? raw.data : [];
  const pagination =
    raw.pagination &&
    typeof raw.pagination === 'object' &&
    !Array.isArray(raw.pagination)
      ? (raw.pagination as TerraLocationReviewsResponse['pagination'])
      : null;
  return {
    data: data as TerraLocationReviewsResponse['data'],
    pagination,
  };
}

async function readErrorDetail(response: Response): Promise<string | null> {
  try {
    const text = await response.text();
    if (!text.trim()) return null;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      for (const key of ['detail', 'message', 'title', 'Message']) {
        const value = json[key];
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }
      }
    } catch {
      return text.trim().slice(0, 280);
    }
    return text.trim().slice(0, 280);
  } catch {
    return null;
  }
}
