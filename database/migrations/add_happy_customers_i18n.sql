-- Happy customers section — English and Spanish locales (French seeded in add_happy_customers_content.sql)

INSERT INTO `happy_customers_sections` (
  `id`, `title`, `subtitle`, `paragraph1`, `paragraph2`,
  `image_url`, `image_alt`, `badge_value`, `badge_label`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000c011',
  'Happy Customers',
  'Our travelers'' satisfaction is our top priority.',
  'Since launch, we have helped thousands of travelers discover Africa. Our commitment to excellence and authentic experiences has earned the trust of our growing community.',
  'Every positive review motivates us to keep improving our services and offering ever more memorable journeys across the continent.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg',
  'Happy travelers in Africa',
  '10K+',
  'Clients',
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c021',
  'Clientes Satisfechos',
  'La satisfacción de nuestros viajeros es nuestra prioridad absoluta.',
  'Desde nuestro lanzamiento, hemos acompañado a miles de viajeros en el descubrimiento de África. Nuestro compromiso con la excelencia y las experiencias auténticas nos ha valido la confianza de una comunidad en crecimiento.',
  'Cada reseña positiva nos motiva a seguir mejorando nuestros servicios y ofrecer viajes cada vez más memorables por el continente.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg',
  'Viajeros felices en África',
  '10K+',
  'Clientes',
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `subtitle` = VALUES(`subtitle`),
  `paragraph1` = VALUES(`paragraph1`),
  `paragraph2` = VALUES(`paragraph2`),
  `image_url` = VALUES(`image_url`),
  `image_alt` = VALUES(`image_alt`),
  `badge_value` = VALUES(`badge_value`),
  `badge_label` = VALUES(`badge_label`),
  `status` = VALUES(`status`);

INSERT INTO `happy_customers_stats` (
  `id`, `label`, `percent_value`, `color_key`, `sort_order`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000c111',
  'Flights',
  94,
  'primary',
  1,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c112',
  'Hotels',
  87,
  'secondary',
  2,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c113',
  'Cars',
  48,
  'primary',
  3,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c114',
  'Cruises',
  51,
  'secondary',
  4,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c121',
  'Vuelos',
  94,
  'primary',
  1,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c122',
  'Hoteles',
  87,
  'secondary',
  2,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c123',
  'Coches',
  48,
  'primary',
  3,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c124',
  'Cruceros',
  51,
  'secondary',
  4,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `percent_value` = VALUES(`percent_value`),
  `color_key` = VALUES(`color_key`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);
