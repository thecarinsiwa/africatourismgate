# Database — Africa Tourism Gate

## Requirements

- **MySQL 8.0+** or **MariaDB 10.3+** (recommended; uses `CHECK` on `reviews.rating` and modern defaults)
- User with permission to create databases, or run the script as `root` for local development

## Create the schema

From the repository root:

```bash
mysql -u root -p < database/africatourismgate_database.sql
```

This will:

1. Drop the database `africatourismgate` if it already exists
2. Create `africatourismgate` with `utf8mb4` / `utf8mb4_unicode_ci`
3. Create all tables, primary keys, and foreign keys

## Configure the app

Point NestJS (or your ORM) at:

- **Host / port / user / password**: your MySQL instance
- **Database name**: `africatourismgate`

Primary keys are **CHAR(36)** UUIDs: generate IDs in the application (e.g. `uuid` in Node) on insert.

## Table index

See [africatourismgate_database_tables.txt](africatourismgate_database_tables.txt) for a list of tables grouped by domain.

## Notes

- `package_items` and `booking_items` use polymorphic `item_type` / `reference_id` (no single FK to all product tables).
- `bookings.promo_code_id` references `promo_codes` after both tables are created (FK added via `ALTER TABLE`).
