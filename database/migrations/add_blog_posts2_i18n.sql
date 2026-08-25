-- Blog posts — English and Spanish locales (French seeded in add_blog_posts.sql)
-- Runs after add_blog_posts.sql (numeric suffix avoids localeCompare ordering: *_i18n before *.sql).

INSERT INTO `blog_posts` (
  `id`, `title`, `slug`, `excerpt`, `content`, `cover_image_url`,
  `status`, `published_at`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000b011',
  'Discover Kenya: Masai Mara and beyond',
  'discover-kenya-masai-mara',
  'Safaris, landscapes and practical tips to plan your first visit to Kenya.',
  '<p>Kenya remains one of East Africa''s flagship destinations. Between the Masai Mara reserve, Diani beaches and the capital Nairobi, every traveler finds their rhythm.</p><p>For a first safari, favor the dry season (June to October) to optimize wildlife sightings. Book lodges and domestic flights early.</p>',
  NULL,
  'published',
  '2026-05-15 10:00:00',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b012',
  'Zanzibar: beaches and Stone Town guide',
  'zanzibar-beaches-stone-town',
  'Between turquoise Indian Ocean waters and Swahili heritage, Zanzibar delights year-round.',
  '<p>Stone Town, a UNESCO World Heritage site, deserves two days of exploration. North beaches (Nungwi, Kendwa) are ideal for swimming; the south is quieter.</p><p>Combine your stay with a safari on mainland Tanzania for a complete experience.</p>',
  NULL,
  'published',
  '2026-05-20 09:30:00',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b013',
  'Traveling in the DRC: Kinshasa and natural treasures',
  'travel-drc-kinshasa',
  'Logistics tips and itinerary ideas to explore the Democratic Republic of the Congo.',
  '<p>Vibrant Kinshasa is the ideal gateway. Beyond the city, national parks offer exceptional biodiversity.</p><p>Plan visa formalities ahead of time and work with licensed local operators for provincial excursions.</p>',
  NULL,
  'published',
  '2026-06-01 14:00:00',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b021',
  'Descubrir Kenia: Masai Mara y más allá',
  'descubrir-kenia-masai-mara',
  'Safaris, paisajes y consejos prácticos para preparar su primera visita a Kenia.',
  '<p>Kenia sigue siendo uno de los destinos estrella de África Oriental. Entre la reserva del Masai Mara, las playas de Diani y la capital Nairobi, cada viajero encuentra su ritmo.</p><p>Para un primer safari, privilegie la temporada seca (junio a octubre) para optimizar los avistamientos. Reserve con antelación los lodges y los vuelos internos.</p>',
  NULL,
  'published',
  '2026-05-15 10:00:00',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b022',
  'Zanzíbar: guía de playas y Stone Town',
  'zanzibar-playas-stone-town',
  'Entre el océano Índico turquesa y la historia suajili, Zanzíbar seduce todo el año.',
  '<p>Stone Town, Patrimonio Mundial de la UNESCO, merece dos días de visita. Las playas del norte (Nungwi, Kendwa) son ideales para bañarse; el sur es más tranquilo.</p><p>Combine su estancia con un safari en Tanzania continental para una experiencia completa.</p>',
  NULL,
  'published',
  '2026-05-20 09:30:00',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b023',
  'Viajar en la RDC: Kinshasa y tesoros naturales',
  'viajar-rdc-kinshasa',
  'Consejos logísticos e ideas de itinerarios para explorar la República Democrática del Congo.',
  '<p>Kinshasa, capital vibrante, es la puerta de entrada ideal. Más allá de la ciudad, los parques nacionales ofrecen una biodiversidad excepcional.</p><p>Anticipe los trámites de visado y trabaje con operadores locales autorizados para las excursiones en provincia.</p>',
  NULL,
  'published',
  '2026-06-01 14:00:00',
  'es',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `excerpt` = VALUES(`excerpt`),
  `content` = VALUES(`content`),
  `status` = VALUES(`status`),
  `published_at` = VALUES(`published_at`),
  `locale` = VALUES(`locale`);
