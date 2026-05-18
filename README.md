# 🧳 Africa Tourism Gate - Travel Booking Platform

> End-to-end booking platform (API, admin UI, database, and documentation) for accommodations, flights, car rentals, cruises, activities, and packages.

[Documentation]()
[Language]()
[API]()
[Frontend]()
[Database]()
[Status]()

## 📋 Table of contents

- [Description](#description)
- [Features](#features)
- [Project structure](#project-structure)
- [Technologies](#technologies)
- [Quick start](#quick-start)
- [Documentation](#documentation)
- [Functional domains](#functional-domains)
- [Database architecture](#database-architecture)
- [Contributing](#contributing)

---

## 📋 Description

**Africa Tourism Gate** is a travel booking platform that includes:

- **REST API** (NestJS) for users, bookings, accommodations, flights, car rentals, cruises, activities, packages, payments, reviews, promotions, and support.
- **Web apps** (Next.js): admin back office and customer-facing client.
- **MySQL database** with documented, scripted schemas (relationships, sample SQL).
- **Educational documentation** on database architecture and use cases.

This repository contains the code and docs needed to run the full stack.

## ✨ Features

- 🏨 **Accommodation booking** (hotels, vacation rentals)
- ✈️ **Flight booking** with multiple airlines
- 🚗 **Car rental** worldwide
- 🚢 **Cruises** with multiple itineraries
- 🎯 **Activities and experiences** at destinations
- 📦 **Combined packages** (e.g. hotel + flight) with discounts
- ⭐ **Reviews and ratings**
- 💳 **Secure payment** handling
- 🎁 **Promotions and promo codes**
- 👥 **OneKey loyalty** (points and rewards)
- 📱 **Built-in customer support**

## 📁 Project structure

**pnpm monorepo** (`pnpm-workspace.yaml`): applications under `apps/`, shared libraries under `packages/`.

```
africatourismgate/
├── README.md
├── pnpm-workspace.yaml
├── package.json                         # Root scripts (dev, build, lint)
├── .env.example
├── apps/
│   ├── api/                             # NestJS API (port 3000, prefix /api)
│   ├── admin/                           # Next.js admin (port 3001)
│   ├── web/                             # Next.js public site (port 3002)
│   └── pos/                             # Next.js POS (port 3003)
├── packages/
│   ├── api-client/                      # Typed HTTP client for the API
│   ├── config/                        # Shared ESLint / Prettier config
│   ├── types/                         # Shared TypeScript types
│   ├── ui/                            # Shared React UI (App Shell, etc.)
│   └── utils/                         # Shared helpers
├── nginx/
│   └── africatourismgate.conf           # Example reverse-proxy vhosts
├── scripts/                           # deploy.sh, setup-nginx.sh, setup-server.sh
├── scratch/                           # Local debug scripts (tokens, roles)
└── database/
    ├── README.md
    ├── africatourismgate_database.sql
    └── africatourismgate_database_tables.txt
```

## 🛠️ Technologies

| Layer            | Stack                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| **Monorepo**     | pnpm workspaces                                                       |
| **API**          | NestJS 10, TypeScript, MySQL (e.g. TypeORM or Prisma), CORS          |
| **Frontend**     | Next.js 14, React 18, TypeScript, Tailwind CSS                        |
| **Database**     | MySQL 8+ / MariaDB, relational schemas, UUID keys                    |
| **Documentation**| Markdown, ASCII diagrams, SQL examples                                |

## 🚀 Quick start

### Prerequisites

- **Node.js 18+** and **pnpm 9** (`corepack enable` then `corepack prepare pnpm@9.15.4 --activate`)
- **MySQL 8+** (or MariaDB) for the schema script

### 1. Install dependencies

```bash
pnpm install
```

### 2. Database

```bash
mysql -u root -p < database/africatourismgate_database.sql
```

See [database/README.md](database/README.md).

### 3. Environment

Copy `.env.example` to `.env` and adjust values (database, JWT placeholders, `NEXT_PUBLIC_API_URL`, optional `CORS_ORIGIN`).

### 4. Run apps

```bash
# All apps (API + Admin + Web + POS) on ports 3000–3003
pnpm dev

# Or one app only
pnpm dev:api
pnpm dev:admin
pnpm dev:web
pnpm dev:pos
```

Ensure `.env` includes `CORS_ORIGIN` for the three frontends (see `.env.example`) when using `pnpm dev`.

If `pnpm dev` fails with `exited with code 1`, a port is likely already in use (often **3000**). Run `node scripts/check-ports.mjs` or stop the old process with `taskkill /PID <pid> /F`. Optional labeled logs: `pnpm dev:tui`.

| App   | URL / port |
| ----- | ---------- |
| API   | [http://localhost:3000/api/health](http://localhost:3000/api/health) |
| Admin | [http://localhost:3001](http://localhost:3001) |
| Web   | [http://localhost:3002](http://localhost:3002) |
| POS   | [http://localhost:3003](http://localhost:3003) |

Build all applications: `pnpm build`. Lint: `pnpm lint`.

### Production (VPS / Hostinger)

On a small VPS, use PM2 (not `pnpm start`, which launches all four apps and overloads CPU).

```bash
cp .env.production.example .env   # edit database, JWT, domains
./scripts/setup-server.sh         # Node, pnpm, build, PM2 (api + web + admin)
sudo ./scripts/setup-nginx.sh     # reverse proxy + disable default nginx site
sudo certbot --nginx -d app-africatourismgate.org …
```

| App | Production URL |
| --- | -------------- |
| Public site | https://africatourismgate.org |
| **Admin** | **https://app-africatourismgate.org** |
| API | https://api.africatourismgate.org/api |

Updates: `pnpm deploy` or `./scripts/deploy.sh`.

Optional POS: `ATG_ENABLE_POS=1 pm2 start ecosystem.config.cjs --only atg-pos`

See `ecosystem.config.cjs` and `nginx/africatourismgate.conf`.

### 5. Documentation and schemas

- **Educational DB doc**: [documentation_structure_bdd_expedia.md](documentation_structure_bdd_expedia.md) *(add file when available)*
- **Table list**: [database/africatourismgate_database_tables.txt](database/africatourismgate_database_tables.txt)

## 📚 Documentation

| Resource                                                                 | Description                                                           |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [Educational DB documentation](documentation_structure_bdd_expedia.md)   | Concepts, architecture, domains, relationships, use cases, SQL samples |
| [Table list](database/africatourismgate_database_tables.txt)             | Tables grouped by functional domain                                   |
| [API source](apps/api)                                                   | NestJS app entry: `src/main.ts`, global prefix `api`, sample `GET /api/health` |
| [Database](database/README.md)                                           | MySQL setup, structure, UUIDs, indexes, maintenance                   |

## 🗂️ Functional domains

- **👥 Users** — Authentication, profiles, addresses, payment methods, sessions
- **🏨 Accommodations** — Properties, rooms, availability, amenities, images
- **✈️ Flights** — Airlines, airports, flights, classes, availability
- **🚗 Car rentals** — Agencies, vehicles, categories, availability
- **🚢 Cruises** — Lines, ships, cabins, itineraries, ports
- **🎯 Activities** — Experiences, suppliers, schedules, bookings
- **📦 Packages** — Bundles (e.g. hotel + flight), discounts
- **💳 Bookings & payments** — Bookings, statuses, payments, refunds
- **⭐ Reviews & ratings** — Scores, comments, photos
- **🎁 Promotions** — Promo codes, offers, campaigns
- **📍 Destinations** — Geography, points of interest
- **💬 Customer support** — Tickets, FAQ, help articles

## 📊 Database architecture

### Overview

```
┌─────────────────────────────────────────────────────────┐
│                 Africa Tourism Gate PLATFORM              │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │    USERS     │  │   PRODUCTS   │  │  BOOKINGS    │   │
│  │   & AUTH     │  │ (Hotels,     │  │  & PAYMENTS  │   │
│  │              │  │  flights…)   │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │                  │                  │          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   REVIEWS    │  │  PROMOTIONS  │  │   CUSTOMER   │   │
│  │  & RATINGS   │  │  & DEALS     │  │   SUPPORT    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key relationships

- **Users** → **Bookings** (1:N)
- **Bookings** → **Booking_Items** (1:N)
- **Properties** → **Rooms** (1:N)
- **Rooms** → **Room_Availability** (1:N)
- **Bookings** → **Payments** (1:N)

## 📈 At a glance

- **100+ tables** (documentation) / **60+ tables** (current SQL script), depending on domain
- **Educational documentation**: 716+ lines with SQL samples and diagrams
- **API**: NestJS with domain modules (controllers, services, data access)

## 🎯 Project goals

- Understand how a booking database and API are structured
- Provide a foundation to build and evolve the Africa Tourism Gate platform
- Serve as a reference for development (NestJS backend, Next.js frontend, database)

## 🤝 Contributing

Suggestions, fixes, and additions are welcome.

1. Fork the repository
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## 📄 License

This project is for learning and demonstration purposes.

## 📞 Contact

Questions or ideas? Open an issue on the repository.

---

**Africa Tourism Gate** — *Your digital travel companion* 🧳✈️
