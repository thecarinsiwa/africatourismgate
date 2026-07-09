-- Hero slides — English and Spanish locales (French seeded in add_hero_slides.sql)

INSERT INTO `hero_slides` (
  `id`, `subtitle`, `title`, `description`, `image_url`, `image_alt`,
  `href`, `sort_order`, `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000c011',
  'Welcome to',
  'AFRICA TOURISM GATE',
  'Your gateway to the finest African destinations. Explore, book and enjoy unforgettable experiences.',
  'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  'Mountain gorilla in Rwanda',
  NULL,
  1,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c012',
  '7-day safari',
  'MAGICAL MASAI MARA',
  'Witness the wildebeest migration and the Big Five in Africa''s most famous reserve.',
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  'Sunset over the Serengeti savanna',
  '/hotels?destination=Masai%20Mara',
  2,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c013',
  '5 days in',
  'MARRAKECH (Pearl of the South)',
  'Immerse yourself in souks, riads and the spiced flavors of Morocco''s ochre city.',
  'https://upload.wikimedia.org/wikipedia/commons/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg',
  'Koutoubia Mosque in Marrakech',
  '/hotels?destination=Marrakech',
  3,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c014',
  '12-day cruise',
  'ZANZIBAR TO MADAGASCAR',
  'Coastal sailing along the Indian Ocean — dream beaches and unique wildlife.',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/Zanzibar_beach.jpg',
  'Zanzibar beach',
  '/cruises',
  4,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c021',
  'Bienvenido a',
  'AFRICA TOURISM GATE',
  'Su puerta de entrada a los mejores destinos africanos. Explore, reserve y disfrute de experiencias inolvidables.',
  'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  'Gorila de montaña en Ruanda',
  NULL,
  1,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c022',
  'Safari de 7 días',
  'MAGICAL MASAI MARA',
  'Contemple la migración de ñus y los Cinco Grandes en la reserva más famosa de África.',
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  'Atardecer en la sabana del Serengeti',
  '/hotels?destination=Masai%20Mara',
  2,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c023',
  '5 días en',
  'MARRAKECH (Pearl of the South)',
  'Sumérjase en los zocos, riads y los sabores especiados de la ciudad ocre de Marruecos.',
  'https://upload.wikimedia.org/wikipedia/commons/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg',
  'Mezquita Koutoubia en Marrakech',
  '/hotels?destination=Marrakech',
  3,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c024',
  'Crucero de 12 días',
  'ZANZIBAR TO MADAGASCAR',
  'Navegación costera por el océano Índico: playas de ensueño y fauna única.',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/Zanzibar_beach.jpg',
  'Playa de Zanzíbar',
  '/cruises',
  4,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `subtitle` = VALUES(`subtitle`),
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `image_url` = VALUES(`image_url`),
  `image_alt` = VALUES(`image_alt`),
  `href` = VALUES(`href`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`),
  `locale` = VALUES(`locale`);
