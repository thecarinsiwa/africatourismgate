/**
 * Stable Wikimedia Commons stock images used as public placeholders / hero fallbacks.
 * Prefer these over one-off Commons URLs that get renamed or deleted (404).
 */
export const STOCK_IMAGES = {
  gorilla:
    'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  serengetiSunset:
    'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  tableMountain:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Table_Mountain_DanieVDM.jpg/1280px-Table_Mountain_DanieVDM.jpg',
  tableMountainFull:
    'https://upload.wikimedia.org/wikipedia/commons/1/13/Table_Mountain_DanieVDM.jpg',
  nairobiGiraffe:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg',
  kinshasaGombe:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kinshasa_Gombe_%28cropped%29.jpg/1280px-Kinshasa_Gombe_%28cropped%29.jpg',
  congoRiver:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Congo_River_near_Kisangani.jpg/1280px-Congo_River_near_Kisangani.jpg',
  clouds:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Clouds_from_above_%28Unsplash%29.jpg/1280px-Clouds_from_above_%28Unsplash%29.jpg',
  carKeys:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Car_keys.jpg/1280px-Car_keys.jpg',
} as const;

/** Hero / promo fallbacks (Africa travel mood board). */
export const HERO_FALLBACK_IMAGES = [
  STOCK_IMAGES.gorilla,
  STOCK_IMAGES.serengetiSunset,
  STOCK_IMAGES.tableMountainFull,
  STOCK_IMAGES.nairobiGiraffe,
] as const;

/** Generic listing / placeholder cover when product has no image. */
export const PLACEHOLDER_COVER_IMAGE = STOCK_IMAGES.nairobiGiraffe;
