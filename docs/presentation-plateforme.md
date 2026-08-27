# Africa Tourism Gate — Présentation de la plateforme

> **Date :** 12 juillet 2026  
> **Objectif :** présenter l’état d’avancement du projet — ce qui est livré, ce qui reste à faire, et la vision produit.

---

## 1. Vision & contexte

**Africa Tourism Gate (ATG)** est une plateforme de réservation voyage **de bout en bout**, orientée vers le tourisme en Afrique.

Elle couvre l’ensemble du parcours client et opérationnel :

| Besoin | Réponse de la plateforme |
|--------|--------------------------|
| Découverte & recherche | Site public multi-verticales (hôtels, vols, voitures, croisières, activités, forfaits) |
| Réservation & paiement | Tunnel de checkout en ligne (Stripe) + point de vente (espèces / Stripe) |
| Gestion opérationnelle | Back-office complet pour le staff et les partenaires |
| Engagement client | Fidélité OneKey, avis, support, réservations assistées |
| Contenu & marketing | CMS éditorial (blog, pages institutionnelles, hero, témoignages) |
| Impact social | Programme **GAP** (Gorilla Ambassadors Program) + dons |

**Positionnement :** une alternative locale et complète aux grandes plateformes internationales, avec un contrôle total sur le catalogue, les paiements et l’expérience client.

---

## 2. Architecture technique

### Monorepo pnpm — 5 applications + 5 packages partagés

```
africatourismgate/
├── apps/
│   ├── api/      → API REST NestJS          (port 3000)
│   ├── admin/    → Back-office Next.js       (port 3001)
│   ├── web/      → Site public client        (port 3002)
│   ├── pos/      → Point de vente            (port 3003)
│   └── gap/      → Site Gorilla Ambassadors  (port 3004)
├── packages/
│   ├── api-client/   → Client HTTP typé (OpenAPI)
│   ├── types/        → Types TypeScript partagés
│   ├── ui/           → Composants React (App Shell, DataTable…)
│   ├── config/       → ESLint, Prettier, thème
│   └── utils/        → Helpers
└── database/         → Schéma MySQL, migrations, seeds
```

### Stack

| Couche | Technologies |
|--------|-------------|
| Backend | NestJS 10, TypeORM, MySQL 8 |
| Frontends | Next.js 14 (App Router), React 18, Tailwind CSS |
| Auth | JWT + refresh, Google OAuth, RBAC granulaire |
| Paiements | Stripe (Checkout, webhooks, remboursements) |
| Email | Nodemailer (SMTP prod, Mailpit en dev) |
| i18n | FR / EN / ES (site public + admin) |
| Tests | Jest (API), Playwright (web) |
| Production | PM2, nginx, Let's Encrypt |

### Chiffres clés

| Métrique | Valeur |
|----------|--------|
| Applications | 5 |
| Pages admin | ~129 |
| Pages site public | ~53 |
| Modules API (CRUD) | ~80 |
| Endpoints publics | ~30 |
| Tables base de données | ~85–90 |
| Migrations SQL | 40+ |
| Tests E2E web (Playwright) | 14 scénarios |
| Tests E2E API (Jest) | 12 fichiers |
| Langues | FR, EN, ES |

---

## 3. Ce qui est déjà fait

### 3.1 API — Cœur métier (`apps/api`)

**Authentification & sécurité**
- Login, inscription (staff + client), refresh token, logout
- Mot de passe oublié / réinitialisation (email SMTP)
- Google OAuth
- RBAC avec permissions granulaires et audit

**Moteur de réservation**
- Checkout polymorphe : chambres, vols, véhicules, cabines, activités, forfaits
- Codes promo et promotions
- Réservations assistées : demande sans paiement → approbation staff → manifeste voyageurs → documents d'identité
- Messagerie client/staff par réservation
- Assignation de guides touristiques
- Synchronisation Stripe post-checkout + webhooks

**Catalogue & CRUD**
- ~80 ressources REST documentées dans Swagger
- Destinations, hébergements, vols, locations, croisières, activités, forfaits
- Paiements et remboursements
- Avis, tickets support, fidélité, CMS, GAP, dons

**API publique (sans authentification)**
- Recherche et fiches détaillées pour chaque verticale
- Contenu marketing (blog, hero, équipe, témoignages)
- Programme GAP et dons

**Intégrations**
- Stripe (Checkout, webhooks, remboursements admin)
- Google OAuth
- Emails transactionnels (bienvenue, confirmation réservation, reset password, alertes support)
- Export Excel (rapports catalogue)
- PDF (réservations assistées)

---

### 3.2 Back-office admin (`apps/admin`)

Interface de gestion opérationnelle complète pour le staff.

**Tableau de bord**
- KPIs (réservations, revenus, clients…)
- Graphique de tendances (réservations & revenus dans le temps)

**Utilisateurs & sécurité**
- Comptes, employés, adresses, moyens de paiement
- Sessions actives, journaux de sécurité
- Organisations, rôles, permissions, audit RBAC

**Catalogue voyage**
- Hébergements (propriétés, chambres, disponibilités, images)
- Vols (compagnies, aéroports, classes, disponibilités)
- Locations véhicules (agences, catégories, flotte)
- Croisières (lignes, navires, cabines, itinéraires)
- Activités & tours (fournisseurs, horaires, itinéraires)
- Forfaits combinés
- Destinations

**Réservations & commerce**
- Liste et détail des réservations (approbation assistée, messages, manifeste, documents)
- Guides touristiques
- Paiements + remboursements Stripe
- Codes promo et promotions
- Comptes fidélité OneKey

**Contenu & support**
- Blog, pages « À propos », équipe, timeline, ressources
- Hero slides, « Pourquoi nous », clients satisfaits
- Avis clients, tickets support

**Programme GAP**
- Paramètres site, pages, activités, statistiques d'impact, médias

**Qualité UX**
- i18n FR / EN / ES
- Navigation filtrée par permissions RBAC
- Branding organisation (logo, favicon dynamique)

---

### 3.3 Site public client (`apps/web`)

**Page d'accueil**
- Hero carousel (CMS)
- Onglets de recherche multi-verticales
- Sections marketing : Pourquoi nous, promo, carte activités, témoignages, avis, impact GAP

**6 verticales de réservation**

| Verticale | Recherche | Fiche produit | Checkout |
|-----------|-----------|---------------|----------|
| Hôtels | ✅ | ✅ | ✅ |
| Vols | ✅ | ✅ | ✅ |
| Locations véhicules | ✅ | ✅ | ✅ |
| Croisières | ✅ | ✅ | ✅ |
| Activités / tours | ✅ | ✅ | ✅ |
| Forfaits combinés | ✅ | ✅ | ✅ |

**Tunnel de réservation**
- Login / inscription (email + Google OAuth)
- Panier, récapitulatif, paiement Stripe
- Confirmation et annulation

**Espace client (`/account`)**
- Profil, adresses, moyens de paiement
- Mes réservations (+ chat avec le staff)
- Programme fidélité OneKey

**Pages institutionnelles**
- À propos (qui sommes-nous, historique, équipe, gouvernance, responsabilité…)
- Blog, contact, support, dons
- i18n FR / EN / ES

**Tests automatisés**
- 14 scénarios Playwright (checkout par verticale, compte client, OAuth, support, i18n…)

---

### 3.4 Point de vente — POS (`apps/pos`)

- Authentification employé + sélection d'organisation
- Vente rapide multi-produits (toutes les verticales)
- Paiement espèces ou Stripe
- Reçu HTML imprimable + mailto ; PDF via dialogue d’impression navigateur

---

### 3.5 Site GAP — Gorilla Ambassadors Program (`apps/gap`)

- Site dédié au programme de conservation
- Pages : accueil, à propos, objectifs, UNESCO, activités, médias, dons
- Contenu alimenté par l'API publique GAP + gestion admin

---

### 3.6 Base de données

- Schéma MySQL documenté (~85–90 tables)
- 40+ migrations versionnées
- Seeds de démonstration (Kinshasa, comptes admin, référentiels)
- Commande unique : `pnpm db:sync` (schéma + migrations + seeds)
- Conventions : UUID, soft delete, audit (`created_by`, `deleted_at`)

**Domaines couverts :** utilisateurs, organisations, RBAC, géographie, catalogue (6 verticales), réservations, paiements, fidélité, avis, support, CMS, GAP, dons.

---

### 3.7 Infrastructure & qualité

| Élément | Statut |
|---------|--------|
| CI GitHub Actions (lint, build, db:sync, tests API) | ✅ |
| Déploiement PM2 + nginx + SSL | ✅ |
| OpenAPI Swagger + codegen client API | ✅ |
| Emails SMTP transactionnels | ✅ |
| Domaines production configurés | ✅ |

**URLs production**

| Service | URL |
|---------|-----|
| Site public | https://africatourismgate.org |
| Admin + API | https://app-africatourismgate.org |
| GAP (optionnel) | https://gap.africatourismgate.org |
| POS (optionnel) | https://pos.africatourismgate.org |

---

## 4. Parcours utilisateur — démo suggérée

### Parcours client (site web)

1. **Accueil** → recherche hôtel à Kinshasa
2. **Fiche produit** → sélection chambre + dates
3. **Checkout** → inscription / login → paiement Stripe
4. **Confirmation** → email reçu → espace client
5. **Compte** → voir la réservation, contacter le support

### Parcours staff (admin)

1. **Dashboard** → vue KPIs et tendances
2. **Catalogue** → ajouter/modifier un hébergement ou une activité
3. **Réservation assistée** → approuver une demande, gérer le manifeste
4. **Paiement** → consulter une transaction, effectuer un remboursement
5. **Contenu** → publier un article de blog ou modifier le hero

### Parcours POS

1. **Login employé** → sélection organisation
2. **Vente rapide** → ajouter produits → encaissement
3. **Reçu** → impression / PDF

### Comptes de démonstration (local)

| App | URL | Identifiants |
|-----|-----|--------------|
| Admin | http://localhost:3001/login | `admin@africatourismgate.local` / `ChangeMe123!` |
| Web | http://localhost:3002 | Inscription client via `/booking/login` |
| POS | http://localhost:3003/login | Compte employé seed |
| API Swagger | http://localhost:3000/api | — |

**Lancer en local :** `pnpm dev` (depuis la racine du monorepo)

---

## 5. Ce qui reste à faire

### Priorité haute — fonctionnalités incomplètes

| Élément | Description | Impact |
|---------|-------------|--------|
| **Historique fidélité** | L'UI existe mais les transactions ne sont pas encore exposées par l'API | Espace client incomplet |
| **Stats dashboard serveur** | Les KPIs sont calculés côté client (pagination complète) ; un endpoint dédié améliorerait les perfs | Performance admin |
| **Messages support standalone** | Page `/contenu/messages` en placeholder ; les messages sont gérés dans chaque ticket | UX admin |
| **Health check DB** | `GET /api/health` ne vérifie pas la connexion MySQL | Observabilité prod |

### Priorité moyenne — qualité & ops

| Élément | Description |
|---------|-------------|
| **CI POS & GAP** | POS : job `pos` (lint + build) ; GAP encore hors CI ; E2E POS → roadmap-pos POS-10 |
| **Tests E2E admin** | 1 seul spec (i18n) vs 14 pour le web |
| **Textes résiduels** | Quelques mentions « coming soon » dans les traductions web |
| **Doc BDD pédagogique** | Fichier annoncé dans le README mais absent du repo |
| **Roadmap doc** | `docs/roadmap-development.md` (juin 2026) obsolète sur plusieurs points |

### Priorité basse — améliorations UX (roadmaps design)

Deux documents détaillent des PRs UX sans nouvelle feature API :

- **Admin :** `docs/admin-design-improvements.md` — livrables UX-1 à UX-22
- **Web :** `docs/web-design-improvements.md` — livrables WEB-UX-1 à WEB-UX-20

Exemples : polish visuel, micro-interactions, accessibilité, responsive, empty states.

### Livrables roadmap restants (#78–83)

| # | Livrable | Statut |
|---|----------|--------|
| 78 | Health DB + observabilité (logs structurés, métriques) | ⚠️ Partiel |
| 79 | Emails transactionnels complets | ✅ Fait |
| 80 | i18n admin FR/EN/ES | ✅ Fait |
| 81 | OpenAPI codegen | ✅ Fait |
| 82 | Durcissement production (rate limiting, headers sécurité, secrets) | ⚠️ Partiel |
| 83 | Audit scope multi-tenant organisation | ⚠️ Partiel |

---

## 6. Synthèse — tableau de bord d'avancement

### Par couche applicative

```
                    Fait ████████████████████░░  ~90%
                    Reste ░░░░░░░░░░░░░░░░░░██  ~10%
```

| Couche | Avancement | Commentaire |
|--------|------------|-------------|
| **API & BDD** | ████████████████████░ 95% | Cœur métier complet ; health check & stats à finaliser |
| **Admin** | ███████████████████░░ 90% | Quasi complet ; messages standalone + perf dashboard |
| **Site web** | ████████████████████░ 95% | 6 verticales + checkout + compte client opérationnels |
| **POS** | ██████████████████░░░ 85% | Vente + reçus OK ; CI lint/build OK ; E2E & déploiement optionnel |
| **GAP** | ██████████████████░░░ 85% | Site + admin OK ; déploiement prod optionnel |
| **Infra & CI** | ██████████████████░░░ 85% | Pipeline principal + job POS ; GAP hors CI |
| **Tests** | ███████████████░░░░░░ 75% | Web & API solides ; admin à renforcer |
| **UX / Design polish** | ██████████░░░░░░░░░░░ 50% | Roadmaps UX documentées, PRs en attente |

### Ce qui impressionne déjà

- **Plateforme complète** : 5 apps, 6 verticales, tunnel de bout en bout
- **Back-office riche** : ~129 pages, RBAC, CMS, réservations assistées
- **Paiements réels** : Stripe intégré (web + admin remboursements + POS)
- **Multi-langue** : FR / EN / ES sur web et admin
- **Production-ready** : déployé sur VPS avec PM2, nginx, SSL
- **Tests automatisés** : 14 scénarios Playwright web + suite API Jest
- **Programme social** : GAP + dons intégrés

### Ce qu'il faut dire honnêtement

- Quelques finitions UI/UX restent (roadmaps design non implémentées)
- L'historique fidélité et les stats dashboard serveur sont les principales lacunes fonctionnelles
- La documentation interne (roadmap) n'a pas été mise à jour depuis juin 2026
- POS et GAP sont fonctionnels mais optionnels en production

---

## 7. Prochaines étapes recommandées

### Court terme (1–2 semaines)

1. Finaliser l'historique transactions fidélité (API + UI)
2. Créer l'endpoint stats dashboard côté serveur
3. Mettre à jour la roadmap documentaire
4. Corriger les textes « coming soon » résiduels

### Moyen terme (1 mois)

5. Health check DB + logs structurés
6. Étendre la CI à GAP ; ajouter les tests E2E POS (roadmap-pos POS-10)
7. Ajouter des tests E2E admin (login, CRUD, réservations)
8. Durcissement production (headers sécurité, rate limiting)

### Long terme

9. PRs UX admin et web (roadmaps design)
10. Audit multi-tenant complet
11. Documentation pédagogique BDD
12. Monitoring & alertes production

---

## 8. Questions fréquentes (FAQ présentation)

**Q : Est-ce que la plateforme accepte de vrais paiements ?**  
R : Oui, via Stripe (Checkout Sessions). Les webhooks synchronisent automatiquement le statut des réservations.

**Q : Peut-on gérer plusieurs organisations ?**  
R : Oui, le modèle multi-organisation est en place avec RBAC par rôle et scope organisation.

**Q : Le site est-il multilingue ?**  
R : Oui, FR / EN / ES sur le site public et l'admin.

**Q : Comment ajouter un nouveau produit (hôtel, activité…) ?**  
R : Via le back-office admin, section « Produits voyage », avec formulaires CRUD complets.

**Q : Quelle est la différence entre réservation en ligne et assistée ?**  
R : En ligne = paiement immédiat Stripe. Assistée = demande sans paiement, le staff approuve, collecte les documents voyageurs, puis confirme.

**Q : Le POS fonctionne hors connexion ?**  
R : Non, le POS nécessite une connexion à l'API. Il est conçu pour les guichets physiques avec réseau.

---

## Annexe — commandes utiles pour la démo

```bash
# Installer les dépendances
pnpm install

# Lancer toute la stack en dev
pnpm dev

# Synchroniser la base de données
pnpm db:sync

# Lancer les tests
pnpm --filter @africatourismgate/web test:e2e    # Playwright web
pnpm --filter @africatourismgate/api test:e2e    # Jest API

# Build production
pnpm build

# Déployer (sur le VPS)
pnpm deploy
```

---

*Document généré le 11 juillet 2026 — basé sur l'analyse du code source du monorepo Africa Tourism Gate.*
