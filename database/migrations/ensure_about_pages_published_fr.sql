-- Ensure published FR about pages exist (prod-safe; does not overwrite existing rows).

INSERT INTO `about_pages` (
  `id`, `section_key`, `title`, `excerpt`, `content`, `cover_image_url`,
  `status`, `published_at`, `locale`, `created_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-00000000a001',
  'who-we-are',
  'Qui nous sommes',
  'Africa Tourism Gate connecte les voyageurs aux meilleures expériences du continent africain.',
  '<p>Africa Tourism Gate est une plateforme de réservation et d''accompagnement dédiée au tourisme en Afrique. Notre mission est de rendre les voyages plus accessibles, plus sûrs et plus authentiques, en reliant les voyageurs à des partenaires locaux vérifiés.</p><p>Fondée à Kinshasa, nous couvrons progressivement l''ensemble du continent grâce à un réseau d''hébergements, d''activités, de guides et de services de transport.</p>',
  NULL,
  'published',
  '2026-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM `about_pages`
  WHERE `section_key` = 'who-we-are'
    AND `locale` = 'fr'
    AND `deleted_at` IS NULL
);

INSERT INTO `about_pages` (
  `id`, `section_key`, `title`, `excerpt`, `content`, `cover_image_url`,
  `status`, `published_at`, `locale`, `created_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-00000000a002',
  'how-we-work',
  'Comment nous travaillons',
  'Une approche centrée sur la qualité, la transparence et le partenariat local.',
  '<p>Nous sélectionnons nos partenaires selon des critères stricts : qualité de service, sécurité, respect de l''environnement et impact positif sur les communautés locales.</p><p>Chaque réservation est suivie de bout en bout : confirmation, assistance voyage et support client disponible avant, pendant et après le séjour.</p><p>Notre équipe travaille en étroite collaboration avec les opérateurs sur le terrain pour garantir des expériences cohérentes et mémorables.</p>',
  NULL,
  'published',
  '2026-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM `about_pages`
  WHERE `section_key` = 'how-we-work'
    AND `locale` = 'fr'
    AND `deleted_at` IS NULL
);

INSERT INTO `about_pages` (
  `id`, `section_key`, `title`, `excerpt`, `content`, `cover_image_url`,
  `status`, `published_at`, `locale`, `created_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-00000000a003',
  'governance',
  'Notre gouvernance',
  'Une structure de gouvernance transparente au service de nos utilisateurs et partenaires.',
  '<p>Africa Tourism Gate est dirigée par un conseil d''administration et une direction opérationnelle responsables de la stratégie, de la conformité et de la qualité de service.</p><p>Les décisions majeures — politique tarifaire, partenariats stratégiques, standards de sécurité — sont prises de manière collégiale et documentées.</p><p>Nous publions régulièrement nos rapports d''activité et nos indicateurs clés pour assurer la transparence envers nos parties prenantes.</p>',
  NULL,
  'published',
  '2026-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM `about_pages`
  WHERE `section_key` = 'governance'
    AND `locale` = 'fr'
    AND `deleted_at` IS NULL
);

INSERT INTO `about_pages` (
  `id`, `section_key`, `title`, `excerpt`, `content`, `cover_image_url`,
  `status`, `published_at`, `locale`, `created_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-00000000a004',
  'responsibility',
  'Responsabilité',
  'Un engagement fort pour un tourisme durable et responsable.',
  '<p>Nous croyons que le tourisme peut être un levier de développement économique et de préservation culturelle lorsqu''il est pratiqué de manière responsable.</p><p>Nos engagements : favoriser l''économie locale, réduire l''empreinte environnementale de nos opérations, promouvoir le respect des communautés et des écosystèmes, et garantir des conditions de travail équitables pour nos partenaires.</p><p>Nous améliorons continuellement nos pratiques en concertation avec les acteurs du secteur et nos voyageurs.</p>',
  NULL,
  'published',
  '2026-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM `about_pages`
  WHERE `section_key` = 'responsibility'
    AND `locale` = 'fr'
    AND `deleted_at` IS NULL
);
