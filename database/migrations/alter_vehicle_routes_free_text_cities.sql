-- Vehicle routes: free-text départ / arrivée (no destinations FK).

ALTER TABLE `vehicle_routes`
  ADD COLUMN `departure_city` VARCHAR(120) NULL AFTER `vehicle_id`,
  ADD COLUMN `arrival_city` VARCHAR(120) NULL AFTER `departure_city`;

UPDATE `vehicle_routes` vr
LEFT JOIN `destinations` dep ON dep.id = vr.departure_destination_id
LEFT JOIN `destinations` arr ON arr.id = vr.arrival_destination_id
SET
  vr.departure_city = COALESCE(NULLIF(TRIM(dep.name), ''), 'Départ'),
  vr.arrival_city = COALESCE(NULLIF(TRIM(arr.name), ''), 'Arrivée');

ALTER TABLE `vehicle_routes`
  DROP FOREIGN KEY `fk_vehicle_routes_departure`,
  DROP FOREIGN KEY `fk_vehicle_routes_arrival`;

ALTER TABLE `vehicle_routes`
  DROP INDEX `uk_vehicle_routes_vehicle_od`,
  DROP INDEX `idx_vehicle_routes_departure`,
  DROP INDEX `idx_vehicle_routes_arrival`;

ALTER TABLE `vehicle_routes`
  DROP COLUMN `departure_destination_id`,
  DROP COLUMN `arrival_destination_id`;

ALTER TABLE `vehicle_routes`
  MODIFY COLUMN `departure_city` VARCHAR(120) NOT NULL,
  MODIFY COLUMN `arrival_city` VARCHAR(120) NOT NULL;

ALTER TABLE `vehicle_routes`
  ADD UNIQUE KEY `uk_vehicle_routes_vehicle_od` (`vehicle_id`, `departure_city`, `arrival_city`),
  ADD KEY `idx_vehicle_routes_departure` (`departure_city`),
  ADD KEY `idx_vehicle_routes_arrival` (`arrival_city`);
