/** Images de couverture par défaut — Wikimedia, alignées avec le carrousel destinations. */
const COVER_BY_SLUG: Record<string, string> = {
  'decouvrir-kenya-masai-mara':
    'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  'zanzibar-plages-stone-town':
    'https://upload.wikimedia.org/wikipedia/commons/6/6a/Zanzibar_beach.jpg',
  'voyager-rdc-kinshasa':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg',
};

const ARTISTIC_FALLBACKS = [
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Table_Mountain_DanieVDM.jpg/1280px-Table_Mountain_DanieVDM.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/Zanzibar_beach.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg/1280px-Koutoubia_Mosque%2C_Marrakech.jpg',
];

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function resolveBlogCoverUrl(post: {
  slug: string;
  coverImageUrl: string | null;
}): string {
  const fromApi = post.coverImageUrl?.trim();
  if (fromApi) return fromApi;
  if (COVER_BY_SLUG[post.slug]) return COVER_BY_SLUG[post.slug];
  return ARTISTIC_FALLBACKS[hashSlug(post.slug) % ARTISTIC_FALLBACKS.length];
}
