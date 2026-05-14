-- =============================================================================
-- Africa Tourism Gate — MySQL schema (utf8mb4)
-- Compatible: MySQL 8.0+ / MariaDB 10.3+ (uses CHECK constraints; relax if needed)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS `africatourismgate`;
CREATE DATABASE `africatourismgate`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `africatourismgate`;

-- -----------------------------------------------------------------------------
-- Users & auth
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `status` ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_sessions` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `refresh_token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_sessions_user` (`user_id`),
  CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_addresses` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `label` VARCHAR(80) DEFAULT NULL,
  `line1` VARCHAR(255) NOT NULL,
  `line2` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(120) NOT NULL,
  `region` VARCHAR(120) DEFAULT NULL,
  `postal_code` VARCHAR(32) DEFAULT NULL,
  `country_code` CHAR(2) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_addresses_user` (`user_id`),
  CONSTRAINT `fk_user_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_payment_methods` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `type` ENUM('card','paypal','other') NOT NULL DEFAULT 'card',
  `provider` VARCHAR(64) DEFAULT NULL,
  `last_four` CHAR(4) DEFAULT NULL,
  `external_token` VARCHAR(255) DEFAULT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_payment_methods_user` (`user_id`),
  CONSTRAINT `fk_user_payment_methods_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loyalty_accounts` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `program_code` VARCHAR(32) NOT NULL DEFAULT 'ONEKEY',
  `points_balance` INT NOT NULL DEFAULT 0,
  `tier` ENUM('member','silver','gold','platinum') NOT NULL DEFAULT 'member',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loyalty_user_program` (`user_id`,`program_code`),
  CONSTRAINT `fk_loyalty_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- RBAC (roles, permissions) & audit trail
-- -----------------------------------------------------------------------------
CREATE TABLE `permissions` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(128) NOT NULL,
  `resource` VARCHAR(64) NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_code` (`code`),
  UNIQUE KEY `uk_permissions_resource_action` (`resource`,`action`),
  KEY `idx_permissions_resource` (`resource`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `description` TEXT,
  `is_system` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` CHAR(36) NOT NULL,
  `permission_id` CHAR(36) NOT NULL,
  `granted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `granted_by_user_id` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `idx_role_permissions_permission` (`permission_id`),
  KEY `idx_role_permissions_granted_by` (`granted_by_user_id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_granted_by` FOREIGN KEY (`granted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_role_assignments` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `role_id` CHAR(36) NOT NULL,
  `scope_type` ENUM('global','property','agency','support_queue') NOT NULL DEFAULT 'global',
  `scope_id` CHAR(36) DEFAULT NULL,
  `assigned_by_user_id` CHAR(36) DEFAULT NULL,
  `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME DEFAULT NULL,
  `revoked_at` DATETIME DEFAULT NULL,
  `revoked_by_user_id` CHAR(36) DEFAULT NULL,
  `revoke_reason` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ura_user_active` (`user_id`,`revoked_at`),
  KEY `idx_ura_role` (`role_id`),
  KEY `idx_ura_scope` (`scope_type`,`scope_id`),
  KEY `idx_ura_assigned_by` (`assigned_by_user_id`),
  KEY `idx_ura_revoked_by` (`revoked_by_user_id`),
  CONSTRAINT `fk_ura_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ura_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ura_assigned_by` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ura_revoked_by` FOREIGN KEY (`revoked_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rbac_audit_logs` (
  `id` CHAR(36) NOT NULL,
  `event_type` ENUM(
    'role_created',
    'role_updated',
    'role_deleted',
    'permission_created',
    'permission_updated',
    'permission_deleted',
    'role_permission_granted',
    'role_permission_revoked',
    'user_role_granted',
    'user_role_revoked',
    'user_role_extended',
    'impersonation_started',
    'impersonation_ended'
  ) NOT NULL,
  `actor_user_id` CHAR(36) DEFAULT NULL,
  `target_user_id` CHAR(36) DEFAULT NULL,
  `role_id` CHAR(36) DEFAULT NULL,
  `permission_id` CHAR(36) DEFAULT NULL,
  `assignment_id` CHAR(36) DEFAULT NULL,
  `correlation_id` CHAR(36) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `payload` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rbac_audit_created` (`created_at`),
  KEY `idx_rbac_audit_actor` (`actor_user_id`),
  KEY `idx_rbac_audit_target` (`target_user_id`),
  KEY `idx_rbac_audit_event` (`event_type`,`created_at`),
  KEY `idx_rbac_audit_role` (`role_id`),
  KEY `idx_rbac_audit_assignment` (`assignment_id`),
  CONSTRAINT `fk_rbac_audit_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rbac_audit_target` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rbac_audit_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rbac_audit_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rbac_audit_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `user_role_assignments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Geography & destinations
-- -----------------------------------------------------------------------------
CREATE TABLE `destinations` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `country_code` CHAR(2) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_destinations_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `points_of_interest` (
  `id` CHAR(36) NOT NULL,
  `destination_id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `latitude` DECIMAL(10,7) DEFAULT NULL,
  `longitude` DECIMAL(10,7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_poi_destination` (`destination_id`),
  CONSTRAINT `fk_poi_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Accommodations
-- -----------------------------------------------------------------------------
CREATE TABLE `amenities` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_amenities_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `properties` (
  `id` CHAR(36) NOT NULL,
  `destination_id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `property_type` ENUM('hotel','resort','apartment','villa','hostel','other') NOT NULL DEFAULT 'hotel',
  `star_rating` DECIMAL(2,1) DEFAULT NULL,
  `description` TEXT,
  `address_line` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_properties_slug` (`slug`),
  KEY `idx_properties_destination` (`destination_id`),
  CONSTRAINT `fk_properties_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `property_images` (
  `id` CHAR(36) NOT NULL,
  `property_id` CHAR(36) NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_property_images_property` (`property_id`),
  CONSTRAINT `fk_property_images_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `property_amenities` (
  `property_id` CHAR(36) NOT NULL,
  `amenity_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`property_id`,`amenity_id`),
  CONSTRAINT `fk_pa_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pa_amenity` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rooms` (
  `id` CHAR(36) NOT NULL,
  `property_id` CHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `room_type` VARCHAR(80) DEFAULT NULL,
  `max_guests` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `bed_config` VARCHAR(120) DEFAULT NULL,
  `base_price_cents` INT UNSIGNED NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (`id`),
  KEY `idx_rooms_property` (`property_id`),
  CONSTRAINT `fk_rooms_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `room_availability` (
  `id` CHAR(36) NOT NULL,
  `room_id` CHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `available_units` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `price_cents` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_room_availability_day` (`room_id`,`date`),
  CONSTRAINT `fk_room_availability_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Flights
-- -----------------------------------------------------------------------------
CREATE TABLE `airlines` (
  `id` CHAR(36) NOT NULL,
  `iata_code` CHAR(2) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_airlines_iata` (`iata_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `airports` (
  `id` CHAR(36) NOT NULL,
  `iata_code` CHAR(3) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `city` VARCHAR(120) NOT NULL,
  `country_code` CHAR(2) NOT NULL,
  `latitude` DECIMAL(10,7) DEFAULT NULL,
  `longitude` DECIMAL(10,7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_airports_iata` (`iata_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `flights` (
  `id` CHAR(36) NOT NULL,
  `airline_id` CHAR(36) NOT NULL,
  `flight_number` VARCHAR(20) NOT NULL,
  `departure_airport_id` CHAR(36) NOT NULL,
  `arrival_airport_id` CHAR(36) NOT NULL,
  `departure_time` DATETIME NOT NULL,
  `arrival_time` DATETIME NOT NULL,
  `duration_minutes` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flights_airline` (`airline_id`),
  KEY `idx_flights_dep` (`departure_airport_id`),
  KEY `idx_flights_arr` (`arrival_airport_id`),
  CONSTRAINT `fk_flights_airline` FOREIGN KEY (`airline_id`) REFERENCES `airlines` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_flights_dep_airport` FOREIGN KEY (`departure_airport_id`) REFERENCES `airports` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_flights_arr_airport` FOREIGN KEY (`arrival_airport_id`) REFERENCES `airports` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `flight_classes` (
  `id` CHAR(36) NOT NULL,
  `flight_id` CHAR(36) NOT NULL,
  `class_name` ENUM('economy','premium_economy','business','first') NOT NULL DEFAULT 'economy',
  `base_price_cents` INT UNSIGNED NOT NULL,
  `seats_total` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flight_classes_flight` (`flight_id`),
  CONSTRAINT `fk_flight_classes_flight` FOREIGN KEY (`flight_id`) REFERENCES `flights` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `flight_class_availability` (
  `id` CHAR(36) NOT NULL,
  `flight_class_id` CHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `available_seats` SMALLINT UNSIGNED NOT NULL,
  `price_cents` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fca_day` (`flight_class_id`,`date`),
  CONSTRAINT `fk_fca_class` FOREIGN KEY (`flight_class_id`) REFERENCES `flight_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Car rentals
-- -----------------------------------------------------------------------------
CREATE TABLE `rental_agencies` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `destination_id` CHAR(36) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rental_agencies_destination` (`destination_id`),
  CONSTRAINT `fk_rental_agencies_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vehicle_categories` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `example_model` VARCHAR(120) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vehicles` (
  `id` CHAR(36) NOT NULL,
  `agency_id` CHAR(36) NOT NULL,
  `category_id` CHAR(36) NOT NULL,
  `license_plate` VARCHAR(32) DEFAULT NULL,
  `daily_price_cents` INT UNSIGNED NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (`id`),
  KEY `idx_vehicles_agency` (`agency_id`),
  KEY `idx_vehicles_category` (`category_id`),
  CONSTRAINT `fk_vehicles_agency` FOREIGN KEY (`agency_id`) REFERENCES `rental_agencies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vehicles_category` FOREIGN KEY (`category_id`) REFERENCES `vehicle_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vehicle_availability` (
  `id` CHAR(36) NOT NULL,
  `vehicle_id` CHAR(36) NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,
  `status` ENUM('available','maintenance','rented') NOT NULL DEFAULT 'available',
  PRIMARY KEY (`id`),
  KEY `idx_vehicle_availability_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_vehicle_availability_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Cruises
-- -----------------------------------------------------------------------------
CREATE TABLE `cruise_lines` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cruise_ports` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(16) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `country_code` CHAR(2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cruise_ports_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ships` (
  `id` CHAR(36) NOT NULL,
  `cruise_line_id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `built_year` SMALLINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ships_line` (`cruise_line_id`),
  CONSTRAINT `fk_ships_line` FOREIGN KEY (`cruise_line_id`) REFERENCES `cruise_lines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `itineraries` (
  `id` CHAR(36) NOT NULL,
  `ship_id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `duration_nights` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_itineraries_ship` (`ship_id`),
  CONSTRAINT `fk_itineraries_ship` FOREIGN KEY (`ship_id`) REFERENCES `ships` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `itinerary_ports` (
  `id` CHAR(36) NOT NULL,
  `itinerary_id` CHAR(36) NOT NULL,
  `port_id` CHAR(36) NOT NULL,
  `day_number` SMALLINT UNSIGNED NOT NULL,
  `arrival_time` TIME DEFAULT NULL,
  `departure_time` TIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_itinerary_ports_it` (`itinerary_id`),
  CONSTRAINT `fk_itinerary_ports_it` FOREIGN KEY (`itinerary_id`) REFERENCES `itineraries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_itinerary_ports_port` FOREIGN KEY (`port_id`) REFERENCES `cruise_ports` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cabins` (
  `id` CHAR(36) NOT NULL,
  `ship_id` CHAR(36) NOT NULL,
  `category_name` VARCHAR(80) NOT NULL,
  `max_guests` SMALLINT UNSIGNED NOT NULL DEFAULT 2,
  `base_price_cents` INT UNSIGNED NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (`id`),
  KEY `idx_cabins_ship` (`ship_id`),
  CONSTRAINT `fk_cabins_ship` FOREIGN KEY (`ship_id`) REFERENCES `ships` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cruise_sailings` (
  `id` CHAR(36) NOT NULL,
  `itinerary_id` CHAR(36) NOT NULL,
  `departure_date` DATE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cruise_sailings_it` (`itinerary_id`),
  CONSTRAINT `fk_cruise_sailings_it` FOREIGN KEY (`itinerary_id`) REFERENCES `itineraries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cabin_availability` (
  `id` CHAR(36) NOT NULL,
  `cabin_id` CHAR(36) NOT NULL,
  `sailing_id` CHAR(36) NOT NULL,
  `available_count` SMALLINT UNSIGNED NOT NULL,
  `price_cents` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cabin_sailing` (`cabin_id`,`sailing_id`),
  CONSTRAINT `fk_cabin_availability_cabin` FOREIGN KEY (`cabin_id`) REFERENCES `cabins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cabin_availability_sailing` FOREIGN KEY (`sailing_id`) REFERENCES `cruise_sailings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Activities
-- -----------------------------------------------------------------------------
CREATE TABLE `activity_providers` (
  `id` CHAR(36) NOT NULL,
  `destination_id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_activity_providers_destination` (`destination_id`),
  CONSTRAINT `fk_activity_providers_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `activities` (
  `id` CHAR(36) NOT NULL,
  `provider_id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `duration_minutes` SMALLINT UNSIGNED DEFAULT NULL,
  `price_cents` INT UNSIGNED NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (`id`),
  KEY `idx_activities_provider` (`provider_id`),
  CONSTRAINT `fk_activities_provider` FOREIGN KEY (`provider_id`) REFERENCES `activity_providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `activity_schedules` (
  `id` CHAR(36) NOT NULL,
  `activity_id` CHAR(36) NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `capacity` SMALLINT UNSIGNED NOT NULL,
  `booked_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_activity_schedules_activity` (`activity_id`),
  CONSTRAINT `fk_activity_schedules_activity` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Packages (bundles)
-- -----------------------------------------------------------------------------
CREATE TABLE `packages` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `description` TEXT,
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `package_items` (
  `id` CHAR(36) NOT NULL,
  `package_id` CHAR(36) NOT NULL,
  `item_type` ENUM('property','flight','vehicle','cruise','activity') NOT NULL,
  `item_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_package_items_package` (`package_id`),
  CONSTRAINT `fk_package_items_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Bookings & payments
-- -----------------------------------------------------------------------------
CREATE TABLE `bookings` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `status` ENUM('draft','pending_payment','confirmed','cancelled','refunded') NOT NULL DEFAULT 'draft',
  `total_cents` INT UNSIGNED NOT NULL DEFAULT 0,
  `currency` CHAR(3) NOT NULL DEFAULT 'USD',
  `promo_code_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bookings_user` (`user_id`),
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `booking_items` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `item_type` ENUM('room','flight_class','vehicle','cabin','activity_schedule','package') NOT NULL,
  `reference_id` CHAR(36) NOT NULL,
  `title_snapshot` VARCHAR(255) NOT NULL,
  `quantity` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price_cents` INT UNSIGNED NOT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_items_booking` (`booking_id`),
  CONSTRAINT `fk_booking_items_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payments` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `amount_cents` INT UNSIGNED NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'USD',
  `status` ENUM('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
  `provider` VARCHAR(64) DEFAULT NULL,
  `external_id` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_booking` (`booking_id`),
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add FK from bookings to promo_codes after promo_codes exists
-- (promo_codes is created below; we add ALTER for promo_code_id)

-- -----------------------------------------------------------------------------
-- Promotions
-- -----------------------------------------------------------------------------
CREATE TABLE `promo_codes` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `discount_type` ENUM('percent','fixed_amount') NOT NULL DEFAULT 'percent',
  `discount_value` DECIMAL(12,2) NOT NULL,
  `valid_from` DATE NOT NULL,
  `valid_until` DATE NOT NULL,
  `max_redemptions` INT UNSIGNED DEFAULT NULL,
  `redemption_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promo_codes_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `promotions` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `description` TEXT,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_promo` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- Reviews
-- -----------------------------------------------------------------------------
CREATE TABLE `reviews` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `entity_type` ENUM('property','flight','vehicle','cruise','activity','booking') NOT NULL,
  `entity_id` CHAR(36) NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `title` VARCHAR(180) DEFAULT NULL,
  `body` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_user` (`user_id`),
  KEY `idx_reviews_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Support
-- -----------------------------------------------------------------------------
CREATE TABLE `support_tickets` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `status` ENUM('open','pending','resolved','closed') NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_support_tickets_user` (`user_id`),
  CONSTRAINT `fk_support_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `support_messages` (
  `id` CHAR(36) NOT NULL,
  `ticket_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) DEFAULT NULL,
  `body` TEXT NOT NULL,
  `is_staff` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_support_messages_ticket` (`ticket_id`),
  CONSTRAINT `fk_support_messages_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_support_messages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- End of schema
