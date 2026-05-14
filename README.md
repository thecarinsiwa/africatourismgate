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

```
africatourismgate/
├── README.md                              # This file
├── documentation_structure_bdd_expedia.md  # Educational DB documentation
├── GITHUB_DESCRIPTION.md                  # GitHub profile/repo copy
├── .github/                               # CI/CD workflows
├── api/                                   # NestJS backend
│   ├── README.md                          # API setup and endpoints
│   ├── package.json
│   ├── nest-cli.json
│   └── src/                               # main.ts, modules, controllers, services
├── web/
│   ├── admin/                             # Admin UI (Next.js, port 3001)
│   └── client/                            # Customer UI (Next.js)
└── database/
    ├── README.md                          # DB setup and layout
    ├── africatourismgate_database.sql     # Database creation script
    └── africatourismgate_database_tables.txt  # Tables listed by domain
```

## 🛠️ Technologies

| Layer            | Stack                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| **API**          | NestJS, TypeScript, MySQL (e.g. TypeORM or Prisma), CORS              |
| **Frontend**     | Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI, Zustand     |
| **Database**     | MySQL 5.7+ / MariaDB, relational schemas, UUID keys                  |
| **Documentation**| Markdown, ASCII diagrams, SQL examples                                  |

## 🚀 Quick start

### Prerequisites

- **Node.js 18+** (NestJS API and Next.js apps)
- **MySQL 5.7+** or MariaDB 10.2+

### 1. Database

```bash
# Create database and tables (from project root)
mysql -u root -p < database/africatourismgate_database.sql
```

Details and troubleshooting: see [database/README.md](database/README.md).

### 2. NestJS API

```bash
cd api
npm install
# Configure environment (e.g. .env): DATABASE_URL / MySQL host, port, etc.
npm run start:dev
```

API (development, default NestJS port): **[http://localhost:3000](http://localhost:3000)**  
Full guide: [api/README.md](api/README.md).

### 3. Admin UI (Next.js)

```bash
cd web/admin
npm install
npm run dev
```

Admin: **[http://localhost:3001](http://localhost:3001)**

### 4. Documentation and schemas

- **Educational DB doc**: [documentation_structure_bdd_expedia.md](documentation_structure_bdd_expedia.md)
- **Table list**: [database/africatourismgate_database_tables.txt](database/africatourismgate_database_tables.txt)

## 📚 Documentation

| Resource                                                                 | Description                                                           |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [Educational DB documentation](documentation_structure_bdd_expedia.md)   | Concepts, architecture, domains, relationships, use cases, SQL samples |
| [Table list](database/africatourismgate_database_tables.txt)             | Tables grouped by functional domain                                   |
| [API](api/README.md)                                                     | Setup, endpoints, NestJS authentication                               |
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
