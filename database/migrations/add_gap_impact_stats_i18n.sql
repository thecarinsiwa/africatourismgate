-- GAP impact stats — English and Spanish locales (French seeded in add_gap_content.sql)

INSERT INTO `gap_impact_stats` (
  `id`, `label`, `value_display`, `description`, `color_key`, `sort_order`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000d311',
  'Participants reached',
  '2,500+',
  'Young people and local residents have taken part in program activities since its launch.',
  'primary',
  1,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d312',
  'Gorilla population growth',
  '4.7%',
  'Annual growth rate of the mountain gorilla population (vs. an estimated natural rate of 3%).',
  'secondary',
  2,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d313',
  'Poaching',
  'Declining',
  'Poaching rates have fallen significantly thanks to local community involvement.',
  'primary',
  3,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d314',
  'Engaged communities',
  'Involved',
  'Local communities actively help protect the site and have abandoned destructive practices such as bushmeat consumption.',
  'secondary',
  4,
  'published',
  'en',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d321',
  'Participantes sensibilizados',
  '2 500+',
  'Jóvenes y residentes locales han participado en las actividades del programa desde su creación.',
  'primary',
  1,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d322',
  'Crecimiento de gorilas',
  '4,7 %',
  'Tasa de crecimiento anual de la población de gorilas de montaña (frente al 3 % estimado de forma natural).',
  'secondary',
  2,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d323',
  'Caza furtiva',
  'En descenso',
  'La tasa de caza furtiva ha disminuido significativamente gracias a la implicación de las comunidades locales.',
  'primary',
  3,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d324',
  'Comunidades comprometidas',
  'Implicadas',
  'Las poblaciones ribereñas participan activamente en la protección del sitio y han abandonado ciertas prácticas destructivas, como el consumo de carne de animales silvestres.',
  'secondary',
  4,
  'published',
  'es',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `value_display` = VALUES(`value_display`),
  `description` = VALUES(`description`),
  `color_key` = VALUES(`color_key`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`),
  `locale` = VALUES(`locale`);
