-- Why us section — English and Spanish locales (French seeded in add_why_us_content.sql)
-- Runs after add_why_us_content.sql (numeric suffix avoids localeCompare ordering: *_i18n before *.sql).

INSERT INTO `why_us_sections` (
  `id`, `title`, `subtitle`, `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000b011',
  'Why choose us',
  'Africa Tourism Gate offers a unique travel experience with top services and personalized support to discover Africa.',
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b021',
  'Por qué elegirnos',
  'Africa Tourism Gate ofrece una experiencia de viaje única con servicios de primera y apoyo personalizado para descubrir África.',
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `subtitle` = VALUES(`subtitle`),
  `status` = VALUES(`status`),
  `locale` = VALUES(`locale`);

INSERT INTO `why_us_items` (
  `id`, `title`, `description`, `link_url`, `icon_key`, `sort_order`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000b111',
  'Amazing Trips',
  'Hand-picked unique destinations across the African continent for unforgettable experiences.',
  '/about/who-we-are',
  'globe',
  1,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b112',
  'Discoveries',
  'Explore rich cultures, breathtaking landscapes and Africa''s incredible wildlife.',
  '/about/how-we-work',
  'search',
  2,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b113',
  'Easy Booking',
  'Book accommodations, flights and activities in a few clicks with our intuitive platform.',
  '/about/how-we-work',
  'booking',
  3,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b114',
  '24/7 Support',
  'Our travel specialists are available day and night to assist you.',
  '/about/contact',
  'support',
  4,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b121',
  'Viajes increíbles',
  'Destinos únicos seleccionados en todo el continente africano para experiencias inolvidables.',
  '/about/who-we-are',
  'globe',
  1,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b122',
  'Descubrimientos',
  'Explore culturas ricas, paisajes impresionantes y la increíble fauna de África.',
  '/about/how-we-work',
  'search',
  2,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b123',
  'Reserva fácil',
  'Reserve alojamientos, vuelos y actividades en pocos clics con nuestra plataforma intuitiva.',
  '/about/how-we-work',
  'booking',
  3,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b124',
  'Soporte 24/7',
  'Nuestros especialistas en viajes están disponibles día y noche para ayudarle.',
  '/about/contact',
  'support',
  4,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `link_url` = VALUES(`link_url`),
  `icon_key` = VALUES(`icon_key`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`),
  `locale` = VALUES(`locale`);
