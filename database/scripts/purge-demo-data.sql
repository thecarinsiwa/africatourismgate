-- =============================================================================
-- Africa Tourism Gate — purge des données démo / test (Partie A)
-- =============================================================================
-- Prérequis :
--   1. Backup mysqldump + checksum SHA-256
--   2. Exécuter d’abord sur STAGING (jamais en prod live sans validation écrite)
--   3. Lire la section CONTRÔLES ; n’exécuter les DELETE que si les contrôles
--      sont OK (0 réservation / paiement / avis liés aux UUID démo)
--
-- Conservé volontairement :
--   RBAC, org plateforme (…0001), organization_settings plateforme,
--   amenities, vehicle_categories, airlines / airports / cruise_lines / cruise_ports
--
-- Usage recommandé :
--   node database/scripts/prepare-production-db.mjs --mode=check
--   node database/scripts/prepare-production-db.mjs --mode=purge --confirm
--
-- Après purge : SEED_PROFILE=prod + DATABASE_AUTO_SEED=false
--   (sinon pnpm db:sync réinsère le catalogue démo via install.seed.sql)
-- =============================================================================

SET NAMES utf8mb4;

-- -----------------------------------------------------------------------------
-- A. CONTRÔLES (à inspecter avant DELETE)
-- -----------------------------------------------------------------------------

SELECT 'booking_items → demo refs' AS check_name, COUNT(*) AS hit_count
FROM `booking_items`
WHERE `deleted_at` IS NULL
  AND `reference_id` IN (
    '00000000-0000-4000-8000-000000002010', -- PROP_DEMO_HOTEL
    '00000000-0000-4000-8000-000000002011', -- ROOM_DEMO_STD
    '00000000-0000-4000-8000-000000003020', -- FLIGHT_DEMO_FIH_NBO
    '00000000-0000-4000-8000-000000003021', -- FLIGHT_DEMO_NBO_FIH
    '00000000-0000-4000-8000-000000003022',
    '00000000-0000-4000-8000-000000003023',
    '00000000-0000-4000-8000-000000003024',
    '00000000-0000-4000-8000-000000003025',
    '00000000-0000-4000-8000-000000004021', -- VEHICLE_DEMO_ECO
    '00000000-0000-4000-8000-000000004022', -- VEHICLE_DEMO_SUV
    '00000000-0000-4000-8000-000000003034', -- CABIN_DEMO_STD
    '00000000-0000-4000-8000-000000003035', -- CABIN_DEMO_SUITE
    '00000000-0000-4000-8000-000000004031', -- ACTIVITY_DEMO_GOMBE_TOUR
    '00000000-0000-4000-8000-000000004032', -- ACTIVITY_DEMO_RIVER_WALK
    '00000000-0000-4000-8000-000000004033',
    '00000000-0000-4000-8000-000000004034',
    '00000000-0000-4000-8000-000000004050', -- ACTIVITY_POS_EXCLUSIVE
    '00000000-0000-4000-8000-000000004051',
    '00000000-0000-4000-8000-000000005001'  -- package Kinshasa Duo
  );

SELECT 'reviews → demo refs' AS check_name, COUNT(*) AS hit_count
FROM `reviews`
WHERE `deleted_at` IS NULL
  AND `entity_id` IN (
    '00000000-0000-4000-8000-000000002010',
    '00000000-0000-4000-8000-000000002011',
    '00000000-0000-4000-8000-000000003020',
    '00000000-0000-4000-8000-000000003021',
    '00000000-0000-4000-8000-000000004021',
    '00000000-0000-4000-8000-000000004022',
    '00000000-0000-4000-8000-000000004031',
    '00000000-0000-4000-8000-000000004032',
    '00000000-0000-4000-8000-000000004050',
    '00000000-0000-4000-8000-000000005001',
    '00000000-0000-4000-8000-000000003030'
  );

SELECT 'promo redemptions POSWELCOME10' AS check_name, COUNT(*) AS hit_count
FROM `promo_codes`
WHERE `id` = '00000000-0000-4000-8000-000000005010'
  AND `redemption_count` > 0;

SELECT 'demo catalog row counts' AS check_name, t.entity, t.cnt
FROM (
  SELECT 'properties' AS entity, COUNT(*) AS cnt FROM `properties`
    WHERE `id` = '00000000-0000-4000-8000-000000002010'
  UNION ALL SELECT 'rooms', COUNT(*) FROM `rooms`
    WHERE `id` = '00000000-0000-4000-8000-000000002011'
  UNION ALL SELECT 'flights', COUNT(*) FROM `flights`
    WHERE `id` IN (
      '00000000-0000-4000-8000-000000003020',
      '00000000-0000-4000-8000-000000003021'
    )
  UNION ALL SELECT 'vehicles', COUNT(*) FROM `vehicles`
    WHERE `id` IN (
      '00000000-0000-4000-8000-000000004021',
      '00000000-0000-4000-8000-000000004022'
    )
  UNION ALL SELECT 'activities', COUNT(*) FROM `activities`
    WHERE `id` IN (
      '00000000-0000-4000-8000-000000004031',
      '00000000-0000-4000-8000-000000004032',
      '00000000-0000-4000-8000-000000004050'
    )
  UNION ALL SELECT 'packages', COUNT(*) FROM `packages`
    WHERE `id` = '00000000-0000-4000-8000-000000005001'
  UNION ALL SELECT 'tour_guides', COUNT(*) FROM `tour_guides`
    WHERE `id` IN (
      '00000000-0000-4000-8000-000000000701',
      '00000000-0000-4000-8000-000000000702'
    )
  UNION ALL SELECT 'org_guichet_est', COUNT(*) FROM `organizations`
    WHERE `id` = '00000000-0000-4000-8000-000000000002'
) AS t;

-- -----------------------------------------------------------------------------
-- B. DELETE (enfants → parents) — UUID seed uniquement
-- -----------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- B.1 Disponibilités & médias enfants
DELETE FROM `room_availability` WHERE `id` IN (
  '00000000-0000-4000-8000-000000002012',
  '00000000-0000-4000-8000-000000002013'
);
DELETE FROM `room_images` WHERE `room_id` = '00000000-0000-4000-8000-000000002011';
DELETE FROM `property_images` WHERE `property_id` = '00000000-0000-4000-8000-000000002010';

DELETE FROM `flight_class_availability` WHERE `flight_class_id` IN (
  '00000000-0000-4000-8000-000000003022',
  '00000000-0000-4000-8000-000000003023',
  '00000000-0000-4000-8000-000000003024',
  '00000000-0000-4000-8000-000000003025'
);
DELETE FROM `flight_images` WHERE `flight_id` IN (
  '00000000-0000-4000-8000-000000003020',
  '00000000-0000-4000-8000-000000003021'
);

DELETE FROM `vehicle_availability` WHERE `id` IN (
  '00000000-0000-4000-8000-000000004023',
  '00000000-0000-4000-8000-000000004024'
);
DELETE FROM `vehicle_images` WHERE `vehicle_id` IN (
  '00000000-0000-4000-8000-000000004021',
  '00000000-0000-4000-8000-000000004022'
);

DELETE FROM `cabin_availability` WHERE `id` IN (
  '00000000-0000-4000-8000-000000003037',
  '00000000-0000-4000-8000-000000003038'
);
DELETE FROM `ship_images` WHERE `ship_id` = '00000000-0000-4000-8000-000000003030';

DELETE FROM `activity_schedules` WHERE `id` IN (
  '00000000-0000-4000-8000-000000004033',
  '00000000-0000-4000-8000-000000004034',
  '00000000-0000-4000-8000-000000004051'
);
DELETE FROM `activity_images` WHERE `activity_id` IN (
  '00000000-0000-4000-8000-000000004031',
  '00000000-0000-4000-8000-000000004032',
  '00000000-0000-4000-8000-000000004050'
);
DELETE FROM `activity_itinerary_stops` WHERE `activity_id` IN (
  '00000000-0000-4000-8000-000000004031',
  '00000000-0000-4000-8000-000000004032',
  '00000000-0000-4000-8000-000000004050'
);
DELETE FROM `activity_description_assets` WHERE `activity_id` IN (
  '00000000-0000-4000-8000-000000004031',
  '00000000-0000-4000-8000-000000004032',
  '00000000-0000-4000-8000-000000004050'
);

DELETE FROM `package_items` WHERE `package_id` = '00000000-0000-4000-8000-000000005001';
DELETE FROM `package_images` WHERE `package_id` = '00000000-0000-4000-8000-000000005001';
DELETE FROM `package_description_assets` WHERE `package_id` = '00000000-0000-4000-8000-000000005001';

-- B.2 Entités catalogue
DELETE FROM `rooms` WHERE `id` = '00000000-0000-4000-8000-000000002011';
DELETE FROM `property_amenities` WHERE `property_id` = '00000000-0000-4000-8000-000000002010';
DELETE FROM `properties` WHERE `id` = '00000000-0000-4000-8000-000000002010';

DELETE FROM `flight_classes` WHERE `id` IN (
  '00000000-0000-4000-8000-000000003022',
  '00000000-0000-4000-8000-000000003023',
  '00000000-0000-4000-8000-000000003024',
  '00000000-0000-4000-8000-000000003025'
);
DELETE FROM `flights` WHERE `id` IN (
  '00000000-0000-4000-8000-000000003020',
  '00000000-0000-4000-8000-000000003021'
);

DELETE FROM `vehicles` WHERE `id` IN (
  '00000000-0000-4000-8000-000000004021',
  '00000000-0000-4000-8000-000000004022'
);
DELETE FROM `rental_agencies` WHERE `id` = '00000000-0000-4000-8000-000000004020';

DELETE FROM `cabins` WHERE `id` IN (
  '00000000-0000-4000-8000-000000003034',
  '00000000-0000-4000-8000-000000003035'
);
DELETE FROM `cruise_sailings` WHERE `id` = '00000000-0000-4000-8000-000000003036';
DELETE FROM `itinerary_ports` WHERE `id` IN (
  '00000000-0000-4000-8000-000000003032',
  '00000000-0000-4000-8000-000000003033'
);
DELETE FROM `itineraries` WHERE `id` = '00000000-0000-4000-8000-000000003031';
DELETE FROM `ships` WHERE `id` = '00000000-0000-4000-8000-000000003030';

DELETE FROM `activities` WHERE `id` IN (
  '00000000-0000-4000-8000-000000004031',
  '00000000-0000-4000-8000-000000004032',
  '00000000-0000-4000-8000-000000004050'
);
DELETE FROM `activity_providers` WHERE `id` = '00000000-0000-4000-8000-000000004030';

DELETE FROM `packages` WHERE `id` = '00000000-0000-4000-8000-000000005001';

DELETE FROM `points_of_interest` WHERE `id` = '00000000-0000-4000-8000-000000002002';
DELETE FROM `destinations` WHERE `id` = '00000000-0000-4000-8000-000000002001';

-- B.3 Opérations démo
DELETE FROM `tour_guides` WHERE `id` IN (
  '00000000-0000-4000-8000-000000000701',
  '00000000-0000-4000-8000-000000000702'
);
DELETE FROM `promo_codes` WHERE `id` = '00000000-0000-4000-8000-000000005010';

-- B.4 Finance sample
DELETE FROM `organization_bank_accounts`
WHERE `id` = '00000000-0000-4000-8000-000000000020';

-- B.5 Org POS test (Guichet Est)
DELETE FROM `organization_settings`
WHERE `organization_id` = '00000000-0000-4000-8000-000000000002';
DELETE FROM `organizations`
WHERE `id` = '00000000-0000-4000-8000-000000000002';

-- B.6 Sessions / tokens (comptes non prod — ici toutes les sessions seed admin
--     restent utiles pour le smoke test ; on ne purge que les tokens expirés
--     génériques si la table existe)
DELETE FROM `password_reset_tokens`
WHERE `expires_at` < UTC_TIMESTAMP();

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- C. Vérification post-purge
-- -----------------------------------------------------------------------------
SELECT 'post_purge_demo_properties' AS check_name, COUNT(*) AS remaining
FROM `properties` WHERE `id` = '00000000-0000-4000-8000-000000002010'
UNION ALL
SELECT 'post_purge_guichet_est', COUNT(*) FROM `organizations`
WHERE `id` = '00000000-0000-4000-8000-000000000002'
UNION ALL
SELECT 'post_purge_platform_org', COUNT(*) FROM `organizations`
WHERE `id` = '00000000-0000-4000-8000-000000000001' AND `deleted_at` IS NULL
UNION ALL
SELECT 'post_purge_admin_user', COUNT(*) FROM `users`
WHERE `id` = '00000000-0000-4000-8000-000000000010' AND `deleted_at` IS NULL;
