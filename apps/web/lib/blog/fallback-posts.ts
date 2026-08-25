import type { PublicBlogPostDetail, PublicBlogPostListItem } from '@africatourismgate/types';

type BlogFallbackLocale = 'fr' | 'en' | 'es';

type BlogFallbackEntry = Pick<
  PublicBlogPostDetail,
  'title' | 'slug' | 'excerpt' | 'content' | 'locale'
>;

/** Seed translations when the API has only the FR row (production DB). Key = publishedAt ISO. */
export const BLOG_FALLBACK_BY_PUBLISHED_AT: Record<string, Partial<Record<BlogFallbackLocale, BlogFallbackEntry>>> = {
  '2026-05-15T10:00:00.000Z': {
    fr: {
      title: 'Découvrir le Kenya : Masai Mara et au-delà',
      slug: 'decouvrir-kenya-masai-mara',
      excerpt:
        'Safaris, paysages et conseils pratiques pour préparer votre première visite au Kenya.',
      content:
        '<p>Le Kenya reste l\'une des destinations phares d\'Afrique de l\'Est. Entre la réserve du Masai Mara, les plages de Diani et la capitale Nairobi, chaque voyageur y trouve son rythme.</p><p>Pour un premier safari, privilégiez la saison sèche (juin à octobre) afin d\'optimiser les observations. Réservez tôt les lodges et les transferts aériens internes.</p>',
      locale: 'fr',
    },
    en: {
      title: 'Discover Kenya: Masai Mara and beyond',
      slug: 'discover-kenya-masai-mara',
      excerpt: 'Safaris, landscapes and practical tips to plan your first visit to Kenya.',
      content:
        '<p>Kenya remains one of East Africa\'s flagship destinations. Between the Masai Mara reserve, Diani beaches and the capital Nairobi, every traveler finds their rhythm.</p><p>For a first safari, favor the dry season (June to October) to optimize wildlife sightings. Book lodges and domestic flights early.</p>',
      locale: 'en',
    },
    es: {
      title: 'Descubrir Kenia: Masai Mara y más allá',
      slug: 'descubrir-kenia-masai-mara',
      excerpt: 'Safaris, paisajes y consejos prácticos para preparar su primera visita a Kenia.',
      content:
        '<p>Kenia sigue siendo uno de los destinos estrella de África Oriental. Entre la reserva del Masai Mara, las playas de Diani y la capital Nairobi, cada viajero encuentra su ritmo.</p><p>Para un primer safari, privilegie la temporada seca (junio a octubre) para optimizar los avistamientos. Reserve con antelación los lodges y los vuelos internos.</p>',
      locale: 'es',
    },
  },
  '2026-05-20T09:30:00.000Z': {
    fr: {
      title: 'Zanzibar : guide des plages et de Stone Town',
      slug: 'zanzibar-plages-stone-town',
      excerpt:
        'Entre l\'océan Indien turquoise et l\'histoire swahilie, Zanzibar séduit toute l\'année.',
      content:
        '<p>Stone Town, classée au patrimoine mondial, mérite deux jours de visite. Les plages du nord (Nungwi, Kendwa) conviennent à la baignade ; le sud est plus calme.</p><p>Combinez votre séjour avec un safari en Tanzanie continentale pour une expérience complète.</p>',
      locale: 'fr',
    },
    en: {
      title: 'Zanzibar: beaches and Stone Town guide',
      slug: 'zanzibar-beaches-stone-town',
      excerpt: 'Between turquoise Indian Ocean waters and Swahili heritage, Zanzibar delights year-round.',
      content:
        '<p>Stone Town, a UNESCO World Heritage site, deserves two days of exploration. North beaches (Nungwi, Kendwa) are ideal for swimming; the south is quieter.</p><p>Combine your stay with a safari on mainland Tanzania for a complete experience.</p>',
      locale: 'en',
    },
    es: {
      title: 'Zanzíbar: guía de playas y Stone Town',
      slug: 'zanzibar-playas-stone-town',
      excerpt: 'Entre el océano Índico turquesa y la historia suajili, Zanzíbar seduce todo el año.',
      content:
        '<p>Stone Town, Patrimonio Mundial de la UNESCO, merece dos días de visita. Las playas del norte (Nungwi, Kendwa) son ideales para bañarse; el sur es más tranquilo.</p><p>Combine su estancia con un safari en Tanzania continental para una experiencia completa.</p>',
      locale: 'es',
    },
  },
  '2026-06-01T14:00:00.000Z': {
    fr: {
      title: 'Voyager en RDC : Kinshasa et les trésors naturels',
      slug: 'voyager-rdc-kinshasa',
      excerpt:
        'Conseils logistiques et idées d\'itinéraires pour explorer la République démocratique du Congo.',
      content:
        '<p>Kinshasa, capitale vibrante, est la porte d\'entrée idéale. Au-delà de la ville, les parcs nationaux offrent une biodiversité exceptionnelle.</p><p>Anticipez les formalités de visa et travaillez avec des opérateurs locaux agréés pour les excursions en province.</p>',
      locale: 'fr',
    },
    en: {
      title: 'Traveling in the DRC: Kinshasa and natural treasures',
      slug: 'travel-drc-kinshasa',
      excerpt: 'Logistics tips and itinerary ideas to explore the Democratic Republic of the Congo.',
      content:
        '<p>Vibrant Kinshasa is the ideal gateway. Beyond the city, national parks offer exceptional biodiversity.</p><p>Plan visa formalities ahead of time and work with licensed local operators for provincial excursions.</p>',
      locale: 'en',
    },
    es: {
      title: 'Viajar en la RDC: Kinshasa y tesoros naturales',
      slug: 'viajar-rdc-kinshasa',
      excerpt:
        'Consejos logísticos e ideas de itinerarios para explorar la República Democrática del Congo.',
      content:
        '<p>Kinshasa, capital vibrante, es la puerta de entrada ideal. Más allá de la ciudad, los parques nacionales ofrecen una biodiversidad excepcional.</p><p>Anticipe los trámites de visado y trabaje con operadores locales autorizados para las excursiones en provincia.</p>',
      locale: 'es',
    },
  },
};

/** Cover images for seed articles (shared across locales). */
export const BLOG_COVER_BY_PUBLISHED_AT: Record<string, string> = {
  '2026-05-15T10:00:00.000Z':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Masai_Mara_National_Reserve_2019.jpg/1280px-Masai_Mara_National_Reserve_2019.jpg',
  '2026-05-20T09:30:00.000Z':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Zanzibar_Nungwi_Beach.jpg/1280px-Zanzibar_Nungwi_Beach.jpg',
  '2026-06-01T14:00:00.000Z':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kinshasa_Gombe_%28cropped%29.jpg/1280px-Kinshasa_Gombe_%28cropped%29.jpg',
};

function resolveFallbackKey(post: Pick<PublicBlogPostListItem, 'publishedAt' | 'translationKey' | 'slug'>) {
  if (post.publishedAt && BLOG_FALLBACK_BY_PUBLISHED_AT[post.publishedAt]) {
    return post.publishedAt;
  }
  return null;
}

export function resolveBlogApiSlug(slug: string): string | null {
  for (const group of Object.values(BLOG_FALLBACK_BY_PUBLISHED_AT)) {
    for (const entry of Object.values(group)) {
      if (entry?.slug === slug) {
        return group.fr?.slug ?? null;
      }
    }
  }
  return null;
}

export function applyBlogListLocaleFallback<T extends PublicBlogPostListItem>(
  post: T,
  locale?: string,
): T {
  const key = resolveFallbackKey(post);
  const coverImageUrl =
    post.coverImageUrl?.trim() || (key ? BLOG_COVER_BY_PUBLISHED_AT[key] : undefined) || null;

  if (!locale || !key) {
    return coverImageUrl !== post.coverImageUrl ? { ...post, coverImageUrl } : post;
  }

  const fallback = BLOG_FALLBACK_BY_PUBLISHED_AT[key]?.[locale as BlogFallbackLocale];
  if (!fallback) {
    return coverImageUrl !== post.coverImageUrl ? { ...post, coverImageUrl } : post;
  }

  const { slug: _localizedSlug, ...localizedFields } = fallback;
  return { ...post, ...localizedFields, locale: fallback.locale, coverImageUrl };
}

export function applyBlogDetailLocaleFallback(
  post: PublicBlogPostDetail,
  locale?: string,
): PublicBlogPostDetail {
  if (!locale) return post;
  const key = resolveFallbackKey(post);
  if (!key) return post;
  const fallback = BLOG_FALLBACK_BY_PUBLISHED_AT[key]?.[locale as BlogFallbackLocale];
  const coverImageUrl =
    post.coverImageUrl?.trim() ||
    BLOG_COVER_BY_PUBLISHED_AT[key] ||
    null;
  if (!fallback) {
    return coverImageUrl !== post.coverImageUrl ? { ...post, coverImageUrl } : post;
  }
  const { slug: _localizedSlug, ...localizedFields } = fallback;
  return { ...post, ...localizedFields, locale: fallback.locale, coverImageUrl };
}

export function hasBlogLocaleFallback(locale?: string): boolean {
  return locale === 'fr' || locale === 'en' || locale === 'es';
}
