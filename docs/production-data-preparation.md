# Préparation de la base de données pour la mise en production

**Projet :** Africa Tourism Gate  
**Document :** unique (parties A + B + C + D)  
**Version :** 1.2  
**Statut :** Collecte **Demandée** — dossier prêt ; envoi effectif à confirmer (voir `docs/data-collection/TRANSMISSION.md`)  
**Public :** équipe technique, équipe projet, interlocuteurs société  
**Dernière revue :** 2026-09-21 (Phase 2 — préparation transmission)

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Classification des données](#2-classification-des-données)
3. [Partie A — Plan de nettoyage de la base](#3-partie-a--plan-de-nettoyage-de-la-base)
4. [Partie B — Inventaire des données de production à collecter](#4-partie-b--inventaire-des-données-de-production-à-collecter)
5. [Partie C — Formulaire de collecte (société)](#5-partie-c--formulaire-de-collecte-société)
6. [Partie D — Modèles CSV / Excel](#6-partie-d--modèles-csv--excel)
7. [Annexes](#7-annexes)

---

## 1. Introduction

### 1.1 Objet

Ce document prépare la base MySQL d’Africa Tourism Gate pour la mise en production. Il regroupe :

| Partie | Contenu |
|--------|---------|
| **A** | Plan de nettoyage (données démo / test vs paramétrage / référence) |
| **B** | Inventaire des données métier à fournir par la société |
| **C** | Formulaire de collecte traçable (statuts) |
| **D** | Structure des fichiers CSV pour faciliter la saisie et l’import |

### 1.2 Périmètre produit

Africa Tourism Gate est une **marketplace tourisme** multi-verticales :

- Hébergement, vols, location de véhicules, croisières, activités, forfaits (packages)
- Réservations web, caisse POS, programme GAP, CMS (hero, about, blog, légal)

**Hors périmètre schéma actuel :** entrepôts, stocks ERP, fournisseurs internationaux, importation / dédouanement, logistique entrepôt. Ces catégories sont marquées **N/A** en partie B.

### 1.3 Règles

1. **Aucune suppression** de données sans validation écrite (société + responsable technique).
2. Exécuter d’abord toute purge sur **staging**, jamais directement en production live.
3. Conserver les données de **paramétrage** et de **référence** nécessaires au fonctionnement.
4. Les données métier réelles sont fournies par la société, puis intégrées (partie C → statut `Intégrée`).

### 1.4 Références techniques

| Élément | Emplacement |
|---------|-------------|
| Schéma | `database/africatourismgate_database.sql` |
| Seed installation (dev/demo) | `database/seeds/install.seed.sql` |
| Seed production minimal | `database/seeds/install.seed.prod.sql` |
| Purge démo + CLI prépare | `database/scripts/purge-demo-data.sql`, `pnpm db:prepare-prod` |
| Registre UUID seed | `database/seeds/seed-ids.txt` |
| Doc seeds | `database/seeds/README.md` |
| Modèles CSV | `docs/data-collection/` (voir partie D) |
| Domaines prod | `docs/production-domains.md` |

### 1.5 Confidentialité

Les données bancaires, numéros Mobile Money, identifiants et secrets (Stripe, SMTP) sont **confidentiels**. Les transmettre via canal sécurisé convenu (pas d’e-mail en clair pour les secrets). Les secrets d’environnement (clés API) ne sont **pas** stockés dans MySQL : ils vont dans les variables d’environnement du serveur.

---

## 2. Classification des données

| Catégorie | Description | Action production |
|-----------|-------------|-------------------|
| **Référence système** | Permissions, rôles, matrices RBAC, amenities, catégories véhicules | **Conserver** |
| **Paramétrage** | Organisation plateforme, `organization_settings` (locale, booking, paiements, branding…) | **Conserver** la structure, **remplacer** les valeurs par celles de la société |
| **Référentiels transport** | Compagnies aériennes, aéroports, lignes / ports croisière (seed minimal) | **Conserver** s’ils sont utiles ; sinon purger et recharger le catalogue réel |
| **Contenu éditorial** | Hero, blog, about, légal, why us, happy customers, GAP | **Réviser** : valider ou remplacer |
| **Démo / test** | Hôtel démo, vols/véhicules/croisières/activités/package seed, org Guichet Est, guides seed, promo `POSWELCOME10`, compte bancaire sample | **Supprimer** (ordre FK) |
| **Métier réel** | Clients, réservations, catalogue commercial, Mobile Money réel, employés | **À fournir / intégrer** (souvent vide à l’install) |

---

## 3. Partie A — Plan de nettoyage de la base

### 3.1 Objectif

Retirer les données de démonstration / développement sans casser le démarrage de l’application (RBAC, org plateforme, settings runtime).

### 3.2 Scénarios

| Scénario | Approche |
|----------|----------|
| **Base existante (staging)** | Backup → contrôles FK → script de purge ciblée par UUID seed → smoke tests |
| **Install neuve production** | Schéma + migrations + **seed prod minimal** (sans catalogue démo) + `DATABASE_AUTO_SEED=false` |

> **Attention :** `pnpm db:sync` rejoue `install.seed.sql` en mode insert-only. Sans seed prod séparé, une purge one-shot **réinsère** le catalogue démo au prochain sync.

### 3.3 Données à conserver

| Domaine | Tables / éléments | Motif |
|---------|-------------------|--------|
| RBAC | `permissions`, `roles`, `role_permissions` (+ rôle `gap_coordinator`) | AuthZ obligatoire |
| Organisation | `organizations` plateforme (Africa Tourism Gate, id `…0001`) | Tenant par défaut |
| Paramètres | `organization_settings` (locale, booking, payment_methods, deposits, branding, contact, loyalty, email, item_type_modes, auth_visual) | Runtime web / admin / POS |
| Référentiels catalogue génériques | `amenities` (seed prod) ; `vehicle_categories` à fournir hors seed | Listes de référence |
| Référentiels transport (option) | `airlines`, `airports`, `cruise_lines`, `cruise_ports` | **Hors seed prod** — à intégrer avec le catalogue réel |

### 3.4 Données à supprimer (démo / test)

| Cible | Identifiants / indices (voir `seed-ids.txt`) | Tables principales |
|-------|---------------------------------------------|-------------------|
| Hôtel / chambre / dispos démo | `PROP_DEMO_HOTEL`, `ROOM_DEMO_STD`, `ROOM_AVAIL_DEMO_*` | `room_availability`, `rooms`, `property_amenities`, `properties` |
| Destination / POI seed Kinshasa (si purement démo) | `…2001`, `POI_GOMBE` | `points_of_interest`, `destinations` |
| Vols démo | `FLIGHT_DEMO_*`, classes, dispos, images | `flight_*`, `flights` |
| Véhicules démo | `RENTAL_AGENCY_DEMO_KIN`, `VEHICLE_DEMO_*` | `vehicle_*`, `vehicles`, `rental_agencies` |
| Croisières démo | `SHIP_DEMO_*`, itinerary, cabins, sailing | `cabin_*`, `cruise_sailings`, `ships`, `itineraries`… |
| Activités / package démo | `ACTIVITY_*_DEMO_*`, package `…5001` Kinshasa Duo | `activity_*`, `activities`, `activity_providers`, `packages`, `package_*` |
| Activité exclusive POS | `ACTIVITY_POS_EXCLUSIVE_GUICHET_EST` | `activity_schedules`, `activities` |
| Org POS test | `ORG_POS_GUICHET_EST` (`…0002`) | `organization_settings` branding, `organizations` |
| Guides seed | Marie Kabila (`…0701`), Jean-Pierre Mwamba (`…0702`) — **absents de `seed-ids.txt`**, IDs dans `install.seed.sql` | `tour_guides` (ne pas supprimer le user admin lié au guide interne) |
| Promo test | `POSWELCOME10` / `PROMO_POS_WELCOME10` | `promo_codes` |
| Compte bancaire sample | `ORG_BANK_DEFAULT` (`…0020`) Rawbank `0001234567890` | `organization_bank_accounts` |
| Sessions / tokens test | Comptes non prod | `user_sessions`, `password_reset_tokens`, etc. |

### 3.5 Données à réinitialiser / remplacer

| Élément | Valeur seed actuelle | Action |
|---------|----------------------|--------|
| Compte admin | `admin@africatourismgate.local` / `ChangeMe123!` | Remplacer email + mot de passe fort (ou créer compte prod et désactiver le seed) |
| Branding / contact / email_branding | Valeurs ATG seed | Remplacer par identité société |
| payment_methods / deposits | JSON seed | Alignés sur politique commerciale réelle |
| Pages légales | Draft CGU / privacy | Textes validés juridiquement |
| Happy customers / stats marketing | Chiffres seed | Remplacer si non réels |
| Contenu CMS / GAP | Contenu d’amorçage | Valider ou republier |

### 3.6 Ordre de suppression recommandé (clés étrangères)

Exécuter dans cet ordre (enfants → parents) :

1. **Disponibilités et médias enfants**  
   `room_availability`, `room_images`, `flight_class_availability`, `flight_images`, `vehicle_availability`, `vehicle_images`, `cabin_availability`, `ship_images`, `activity_schedules`, `activity_images`, `activity_itinerary_stops`, `activity_description_assets`, `package_items`, `package_images`, `package_description_assets`
2. **Entités catalogue**  
   `rooms` → `property_amenities` → `properties`  
   `flight_classes` → `flights`  
   `vehicles` → `rental_agencies`  
   `cabin_availability` → puis `cabins` et `cruise_sailings` (indépendants) → `itinerary_ports` → `itineraries` → `ships`  
   `activities` → `activity_providers`  
   `package_items` / `package_images` → `packages`  
   `points_of_interest` → `destinations` (uniquement si la destination Kinshasa seed n’est pas réutilisée en prod)
3. **Opérations démo**  
   `tour_guides` seed, `promo_codes` `POSWELCOME10`
4. **Finance sample**  
   `organization_bank_accounts` sample
5. **Org POS test**  
   settings Guichet Est → `organizations` `…0002`
6. **Sessions / tokens** de comptes non destinés à la prod

### 3.7 Précautions obligatoires avant nettoyage

1. **Backup** : `mysqldump` complet + checksum (SHA-256) ; conserver hors serveur.
2. Environnement : **staging** uniquement pour le premier run.
3. **Contrôles SQL** avant DELETE (exemples) :
   - Aucun `booking_items` / `payments` / `reviews` pointant vers les UUID démo.
   - Compter les lignes cibles (`SELECT COUNT(*) … WHERE id IN (…)`) et consigner le résultat.
4. Après purge staging :
   - `DATABASE_AUTO_SEED=false`
   - Introduire un seed prod minimal (`install.seed.prod.sql`) sans catalogue démo
   - Smoke tests : login admin, catalogue, CMS, parcours paiement
5. Validation écrite avant application en production (Phase 5).

### 3.8 Suites techniques (après validation — ne pas exécuter sans feu vert)

| Livrable | Rôle | Statut |
|----------|------|--------|
| `database/scripts/purge-demo-data.sql` | DELETE ciblés par UUID, commentaires, SELECT de contrôle | **Disponible** |
| `database/seeds/install.seed.prod.sql` | 8 tables : RBAC + org plateforme + settings + amenities | **Disponible** |
| `apps/api/scripts/prepare-production-db.mjs` | CLI `check` / `purge` / `fresh` / `reset` / `install-only` (`pnpm db:prepare-prod`) | **Disponible** |
| Mise à jour `database/seeds/README.md` | Distinguer seed dev vs seed prod | **Disponible** |

```bash
# Contrôles (staging)
pnpm db:prepare-prod -- --mode=check

# Purge démo (staging uniquement, avec backup)
pnpm db:prepare-prod -- --mode=purge --confirm --backup

# Install neuve production
pnpm db:prepare-prod -- --mode=fresh --database=africatourismgate_prod

# Production : vider toutes les tables métier, garder uniquement le seed d'installation
pnpm db:prod-install-only -- --backup

# Sync ultérieur sans réinjecter CMS / catalogue démo (filtre les DML migrations)
pnpm db:sync:prod
# équivalent : SEED_PROFILE=prod dans .env puis pnpm db:sync
# + DATABASE_AUTO_SEED=false
```

Voir aussi `database/scripts/README.md`.

---

## 4. Partie B — Inventaire des données de production à collecter

Légende **Obligatoire** : O = obligatoire pour go-live minimal ; F = facultatif / peut arriver après le lancement.

### 4.1 Informations générales de l’entreprise

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Raison sociale / nom affiché | Nom légal et nom commercial | Org + branding | Texte | O | Organisation | Africa Tourism Gate SARL | Direction / Juridique |
| Slug organisation | Identifiant URL / technique | Table `organizations` | `kebab-case` | O | Organisation | `africa-tourism-gate` | Technique + Direction |
| E-mail de contact org | Contact principal | `organizations.contact_email` | E-mail | O | Organisation | contact@exemple.cd | Direction |
| Devise principale | Devise catalogue / org | `organizations.currency` + locale | ISO 4217 | O | Organisation / Finance | `USD` | Finance |
| Fuseau horaire | Affichages et créneaux | JSON locale | IANA | O | Organisation | `Africa/Kinshasa` | Technique / Ops |
| Langue par défaut | UI | JSON locale | `fr` / `en` / `es` | O | Organisation | `fr` | Marketing / Produit |
| Couleurs marque | Thème admin / e-mails | Identité visuelle | Hex | O | Branding | `#0B6E4F` | Marketing |
| Logo | Identité visuelle | Branding uploads / URLs | Fichier PNG/SVG ou URL HTTPS | O | Branding | `logo.png` (fond transparent) | Marketing |
| Adresse / localisation affichée | Footer, contact web | Setting contact | Texte | O | Contact | Kinshasa, RD Congo | Direction |
| Réseaux sociaux | Liens footer | Setting contact | URL HTTPS | F | Contact | URL Facebook / Instagram / X | Marketing |

### 4.2 Utilisateurs et rôles

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Compte super admin | Accès plateforme | Bootstrap sécurisé | E-mail + MDP fort | O | Auth | admin@societe.cd | Direction IT |
| Comptes org_admin | Administrateurs métier | Admin back-office | E-mail, nom, rôle | O | Auth / RBAC | ops@societe.cd | Ops |
| Comptes support | Support client | Tickets / assistance | E-mail, rôle `support` | F | Support | support@societe.cd | Support |
| Employés POS | Caissiers / guichets | Ventes POS | E-mail, org, département | O si POS | POS / RH | caisse.est@societe.cd | Ops / RH |
| Départements | Structure RH | Table `departments` | Nom + org | F | RH | Accueil, Ventes | RH |
| Guides touristiques | Guides internes / externes | Réservations assistées | Nom, e-mail, type, téléphone | F | Guides | Marie N., interne | Ops terrain |
| Rôles additionnels | Ex. coordinateur GAP | RBAC | Code rôle existant ou à confirmer | F | RBAC / GAP | `gap_coordinator` | Produit |

Rôles système déjà en base : `super_admin`, `org_admin`, `support`, `customer`, `gap_coordinator`.

### 4.3 Clients

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Fichier clients initial | Import comptes voyageurs | Amorçage CRM | CSV (e-mail, nom, téléphone) | F | Clients | — | Commercial / CRM |

Sans import, les clients se créent via inscription / checkout.

### 4.4 Catalogue — Destinations et points d’intérêt

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Destinations | Villes / régions commercialisées | Navigation catalogue | Nom, slug, code pays ISO2, description, featured | O | Catalogue | Kinshasa, `CD` | Produit / Contenu |
| Points d’intérêt | Coordonnées / zones | Cartes, hébergement | Nom, lat, lng, destination | F | Catalogue | Gombe, -4.30, 15.30 | Contenu |

### 4.5 Catalogue — Hébergement

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Propriétés (hôtels…) | Établissements | Vertical hébergement | Nom, slug, type, étoiles, adresse, description, images | O si vertical actif | Hébergement | Hôtel XYZ, 4★ | Partenariats |
| Chambres | Types de chambres | Réservation | Nom, type, max guests, prix (cents), devise | O si vertical actif | Hébergement | Standard Double, 15000 (= 150.00 USD) | Partenariats |
| Disponibilités | Calendrier | Booking | Date début/fin, stock, prix override | O pour vendre | Hébergement | 2026-10-01 → 2026-12-31 | Ops / Yield |
| Équipements | Amenities liés | Fiches produit | Codes amenities existants | F | Hébergement | wifi, pool | Partenariats |

### 4.6 Catalogue — Vols

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Compagnies | Airlines | Référentiel | Code IATA, nom, logo | O si vertical actif | Vols | KQ, Kenya Airways | Partenariats |
| Aéroports | Airports | Référentiel | IATA, ville, pays | O si vertical actif | Vols | FIH, Kinshasa, CD | Partenariats |
| Vols + classes | Itinéraires vendables | Catalogue | Numéro, départ/arrivée, classes, prix, dispos | O pour vendre | Vols | KQ210 FIH-NBO | Yield / Partenariats |

### 4.7 Catalogue — Véhicules

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Agences de location | Fournisseurs locaux | Vertical véhicules | Nom, contact | O si vertical actif | Véhicules | Rent Kinshasa | Partenariats |
| Véhicules | Flotte | Catalogue | Catégorie, plaque, prix/jour, images, dispos | O pour vendre | Véhicules | SUV, CD-KIN-123 | Ops |

Catégories véhicules : à créer via admin / import (plus dans le seed prod).

### 4.8 Catalogue — Croisières

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Lignes / ports / navires | Référentiel croisière | Vertical croisière | Noms, codes ports, images | O si vertical actif | Croisières | Congo River Spirit | Partenariats |
| Itinéraires / cabines / départs | Offres vendables | Booking | Dates sailing, cabines, prix, dispos | O pour vendre | Croisières | Kinshasa–Banana | Yield |

### 4.9 Catalogue — Activités et forfaits

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Prestataires d’activités | Partenaires | Fiches activités | Nom, contact | O si vertical actif | Activités | Experiences Kinshasa | Partenariats |
| Activités + créneaux | Produits | Booking / POS | Titre, prix, durée, schedules, images, org (si exclusif POS) | O pour vendre | Activités | City Tour, 09:00 | Ops / Produit |
| Forfaits (packages) | Bundles | Vente packagée | Nom, items liés, prix, images | F | Packages | Duo Kinshasa | Produit |

### 4.10 Moyens de paiement, banques, Mobile Money

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Flags moyens de paiement web | Stripe / cash / virement / Mobile Money | `organization_settings` `payment_methods` | JSON booléens | O | Paiements | `{"stripe":true,"cash":false,"bank_transfer":true,"mobile_money":true}` | Finance / Produit |
| Clés Stripe | Paiement carte | Env serveur (pas DB) | Secret + publishable | O si Stripe | Paiements / Env | `sk_live_…` | Finance / IT |
| Comptes bancaires org | Virement B2B / affichage | `organization_bank_accounts` | Banque, titulaire, n°, SWIFT, devise, défaut | O si virement | Finance | Rawbank, USD, SWIFT | Finance |
| Pays Mobile Money | Config MM | `mobile_money_countries` | Code ISO2, nom | O si MM | Paiements | CD, RD Congo | Finance |
| Opérateurs MM | Réseaux | `mobile_money_operators` | Nom, logo, actif | O si MM | Paiements | M-Pesa, Airtel Money | Finance |
| Numéros de paiement MM | Numéros encaissement | `mobile_money_payment_numbers` | E.164, libellé | O si MM | Paiements | `+2438…`, « Caisse principale » | Finance |
| Acomptes (deposits) | Politique acompte | Setting `deposits` | JSON | F | Booking / Finance | `enabled:false` | Finance |

### 4.11 Devises et taux de change

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Devise catalogue | Prix produits | Colonne `currency` (pas de table taux dédiée) | ISO 4217 | O | Finance | `USD` | Finance |
| Taux de change | Conversion multi-devises | **Non modélisé** en table dédiée aujourd’hui | — | N/A | — | Gérer hors système ou évolution future | Finance |

### 4.12 Paramètres commerciaux / booking

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Durée de hold | Réservation temporaire | `booking.defaults.holdMinutes` | Entier (minutes) | O | Booking | `15` | Produit |
| Checkout invité | Achat sans compte | `allowGuestCheckout` | Booléen | O | Booking | `true` | Produit |
| Modes par vertical | immediate vs assisted | `item_type_modes` | JSON | O | Booking | activity=`assisted`, room=`immediate` | Produit / Ops |
| Codes promo | Remises | `promo_codes` | Code, %, dates, actif | F | Marketing | `BIENVENUE10` | Marketing |
| Promotions | Campagnes | `promotions` | Titre, période, règles | F | Marketing | Été 2026 | Marketing |

### 4.13 Contenu CMS et légal

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Hero slides | Accueil web | Tables `hero_slides` | Titre, sous-titre, image, i18n | O | CMS | Slide Masai Mara | Marketing |
| Pages About / équipe / timeline | Qui sommes-nous | `about_*`, `team_members` | Textes + photos | O | CMS | Bio équipe | Direction / RH |
| Why us / Happy customers | Sections marketing | Tables dédiées | Textes + stats | F | CMS | « 10 ans d’expérience » | Marketing |
| Blog | Articles | `blog_posts` | Titre, slug, corps, langue | F | CMS | Guide Kinshasa | Contenu |
| CGU | Conditions | `legal_pages` | Markdown/HTML validé | O | Légal | — | Juridique |
| Politique de confidentialité | Privacy | `legal_pages` | Texte validé | O | Légal | — | Juridique |

### 4.14 GAP (programme)

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Paramètres site GAP | Config programme | `gap_site_settings` | Liens, options | O si GAP actif | GAP | — | GAP / Produit |
| Pages / activités / stats / médias GAP | Contenu programme | `gap_pages`, `gap_activities`, `gap_impact_stats`, `gap_media_items` | Textes + images | O si GAP actif | GAP | — | GAP |
| Dons | Campagnes donation | `donations` | Montants, libellés | F | GAP | — | GAP / Finance |

### 4.15 Communication

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| SMTP / provider e-mail | Envoi transactionnel | Variables d’environnement | Host, port, user, MDP | O | E-mail / Env | — | IT |
| Branding e-mail | En-tête / pied | `email_branding` setting | Nom, couleur, footer | O | E-mail | © Société 2026 | Marketing |

### 4.16 Organisations POS additionnelles

| Nom | Description | Pourquoi | Format | O/F | Module | Exemple | Service |
|-----|-------------|----------|--------|-----|--------|---------|---------|
| Guichets / orgs POS réels | Multi-tenant caisse | `organizations` + branding | Nom, slug, devise | F | POS | Guichet Gombe | Ops |
| Catalogue exclusif par org | Produits scopés | `activities.organization_id` | UUID org + activité | F | POS | Atelier exclusif | Ops |

L’org seed « Kinshasa Guichet Est » est **de test** : à supprimer, pas à réutiliser telle quelle.

### 4.17 Hors périmètre (N/A)

| Catégorie demandée (générique) | Statut | Commentaire |
|--------------------------------|--------|-------------|
| Entrepôts et emplacements | N/A | Non présent dans le schéma |
| Fournisseurs internationaux (ERP) | N/A | Hors modèle ; partenaires = `activity_providers` / agences locales |
| Importation et dédouanement | N/A | Non modélisé |
| Paramètres logistiques entrepôt | N/A | Non modélisé |
| Données fiscales avancées (TVA multi-régimes) | N/A | Pas de module fiscal dédié ; à traiter hors système ou évolution |
| Table pays / villes générique | N/A | Codes pays en colonnes (`country_code`) ; destinations = référentiel métier |
| Table taux de change | N/A | Non implémentée |

---

## 5. Partie C — Formulaire de collecte (société)

### 5.1 Consignes pour la société

1. Remplir les tableaux ci-dessous (ou les fichiers CSV de la partie D).
2. Indiquer le **service responsable** et mettre à jour le **statut**.
3. Fournir les pièces jointes (logos, photos, PDF légaux) via le canal convenu.
4. Les secrets (Stripe, SMTP) : canal sécurisé uniquement — ne pas coller les clés secrètes dans ce fichier versionné.

### 5.2 Statuts de collecte

| Code | Signification |
|------|----------------|
| `À demander` | Identifié, pas encore sollicité |
| `Demandée` | Demande envoyée à la société |
| `Reçue` | Donnée reçue, pas encore vérifiée |
| `En cours de vérification` | Contrôle format / cohérence |
| `Validée` | Prête à intégrer |
| `À corriger` | Retour à la société |
| `Intégrée dans le système` | Présente en base / config |

### 5.3 Synthèse de suivi

| Module | Responsable société | Responsable projet | Statut global | Date cible | Commentaire |
|--------|---------------------|--------------------|---------------|------------|-------------|
| Entreprise / branding | | | Demandée | | Dossier transmis — voir `docs/data-collection/TRANSMISSION.md` |
| Utilisateurs / rôles | | | Demandée | | |
| Clients (import) | | | Demandée | | Facultatif |
| Destinations | | | Demandée | | |
| Hébergement | | | Demandée | | Remplir si verticale active |
| Vols | | | Demandée | | Remplir si verticale active |
| Véhicules | | | Demandée | | Remplir si verticale active |
| Croisières | | | Demandée | | Remplir si verticale active |
| Activités / packages | | | Demandée | | Remplir si verticale active |
| Paiements / banques / MM | | | Demandée | | Secrets via canal sécurisé |
| Paramètres booking | | | Demandée | | |
| CMS / légal | | | Demandée | | CGU / privacy obligatoires |
| GAP | | | Demandée | | Si programme actif |
| Communication (SMTP) | | | Demandée | | Secrets via canal sécurisé |
| POS orgs | | | Demandée | | Si POS multi-guichet |

### 5.4 Tableaux de collecte détaillés

Colonnes : **Donnée | Description | Format | Obligatoire | Exemple | Service | Statut | Date | Commentaire**

#### C.1 — Entreprise

| Donnée | Description | Format | Obligatoire | Exemple | Service | Statut | Date | Commentaire |
|--------|-------------|--------|-------------|---------|---------|--------|------|-------------|
| Nom affiché | Marque | Texte | Oui | Africa Tourism Gate | | Demandée | 2026-09-21 | |
| Raison sociale | Légal | Texte | Oui | … SARL | | Demandée | 2026-09-21 | |
| Slug | Technique | kebab-case | Oui | africa-tourism-gate | | Demandée | 2026-09-21 | |
| E-mail contact | Org | E-mail | Oui | contact@… | | Demandée | 2026-09-21 | |
| Devise | ISO 4217 | Texte | Oui | USD | | Demandée | 2026-09-21 | |
| Timezone | IANA | Texte | Oui | Africa/Kinshasa | | Demandée | 2026-09-21 | |
| Langue défaut | Code | Texte | Oui | fr | | Demandée | 2026-09-21 | |
| Couleur primaire | Hex | Texte | Oui | #0B6E4F | | Demandée | 2026-09-21 | |
| Couleur secondaire | Hex | Texte | Non | #199a45 | | Demandée | 2026-09-21 | |
| Logo | Fichier / URL | PNG/SVG | Oui | | | Demandée | 2026-09-21 | |
| Localisation affichée | Texte | Texte | Oui | Kinshasa, RD Congo | | Demandée | 2026-09-21 | |
| Facebook / Instagram / X | URL | URL | Non | | | Demandée | 2026-09-21 | |

#### C.2 — Utilisateurs et staff

| Donnée | Description | Format | Obligatoire | Exemple | Service | Statut | Date | Commentaire |
|--------|-------------|--------|-------------|---------|---------|--------|------|-------------|
| Super admin | Compte racine | E-mail + MDP | Oui | | IT | Demandée | 2026-09-21 | |
| Org admins | Liste | CSV ligne | Oui | | Ops | Demandée | 2026-09-21 | |
| Support | Liste | CSV ligne | Non | | Support | Demandée | 2026-09-21 | |
| Employés POS | Liste | CSV ligne | Si POS | | Ops | Demandée | 2026-09-21 | |
| Départements | Liste | Texte | Non | | RH | Demandée | 2026-09-21 | |
| Guides | Liste | CSV | Non | | Ops | Demandée | 2026-09-21 | |

#### C.3 — Paiements

| Donnée | Description | Format | Obligatoire | Exemple | Service | Statut | Date | Commentaire |
|--------|-------------|--------|-------------|---------|---------|--------|------|-------------|
| Activer Stripe | Oui/Non | Bool | Oui | Oui | Finance | Demandée | 2026-09-21 | |
| Activer cash | Oui/Non | Bool | Oui | Non | Finance | Demandée | 2026-09-21 | |
| Activer virement | Oui/Non | Bool | Oui | Oui | Finance | Demandée | 2026-09-21 | |
| Activer Mobile Money | Oui/Non | Bool | Oui | Oui | Finance | Demandée | 2026-09-21 | Au moins un moyen doit être `true` |
| Clés Stripe | Env | Secrets | Si Stripe | | IT / Finance | Demandée | 2026-09-21 | Canal sécurisé |
| Banque / titulaire / n° / SWIFT / devise | Compte B2B | Texte | Si virement | | Finance | Demandée | 2026-09-21 | |
| Pays MM | ISO2 + nom | Texte | Si MM | CD | Finance | Demandée | 2026-09-21 | |
| Opérateurs MM | Noms | Texte | Si MM | M-Pesa | Finance | Demandée | 2026-09-21 | |
| Numéros MM | E.164 | Téléphone | Si MM | +243… | Finance | Demandée | 2026-09-21 | |
| Acomptes activés | Oui/Non | Bool | Non | Non | Finance | Demandée | 2026-09-21 | |

#### C.4 — Catalogue (cocher les verticales actives au lancement)

| Verticale | Active au go-live ? (Oui/Non) | Fichier CSV associé | Statut | Date | Commentaire |
|-----------|-------------------------------|---------------------|--------|------|-------------|
| Destinations / POI | | `05-destinations-poi.csv` | Demandée | 2026-09-21 | |
| Hébergement | | `06-properties-rooms.csv` | Demandée | 2026-09-21 | |
| Vols | | `07-flights.csv` | Demandée | 2026-09-21 | |
| Véhicules | | `08-vehicles.csv` | Demandée | 2026-09-21 | |
| Croisières | | `09-cruises.csv` | Demandée | 2026-09-21 | |
| Activités / packages | | `10-activities-packages.csv` | Demandée | 2026-09-21 | |

#### C.5 — Paramètres booking

| Donnée | Description | Format | Obligatoire | Exemple | Service | Statut | Date | Commentaire |
|--------|-------------|--------|-------------|---------|---------|--------|------|-------------|
| holdMinutes | Hold panier | Entier | Oui | 15 | Produit | Demandée | 2026-09-21 | |
| allowGuestCheckout | Invité | Bool | Oui | true | Produit | Demandée | 2026-09-21 | |
| Mode room | immediate/assisted | Enum | Oui | immediate | Produit | Demandée | 2026-09-21 | |
| Mode flight_class | idem | Enum | Oui | immediate | Produit | Demandée | 2026-09-21 | |
| Mode vehicle | idem | Enum | Oui | immediate | Produit | Demandée | 2026-09-21 | |
| Mode cabin | idem | Enum | Oui | immediate | Produit | Demandée | 2026-09-21 | |
| Mode activity_schedule | idem | Enum | Oui | assisted | Produit | Demandée | 2026-09-21 | |
| Mode package | idem | Enum | Oui | assisted | Produit | Demandée | 2026-09-21 | |

#### C.6 — CMS / légal / GAP / communication

| Donnée | Description | Format | Obligatoire | Service | Statut | Date | Commentaire |
|--------|-------------|--------|-------------|--------|--------|------|-------------|
| Hero slides | Contenu + images | Checklist / fichiers | Oui | Marketing | Demandée | 2026-09-21 | |
| About + équipe | Textes + photos | Fichiers | Oui | Direction | Demandée | 2026-09-21 | |
| CGU | Texte validé | DOC/PDF/MD | Oui | Juridique | Demandée | 2026-09-21 | |
| Privacy | Texte validé | DOC/PDF/MD | Oui | Juridique | Demandée | 2026-09-21 | |
| Blog / Why us / Happy customers | Contenu | Fichiers | Non | Marketing | Demandée | 2026-09-21 | |
| Contenu GAP | Si programme actif | Fichiers | Si GAP | GAP | Demandée | 2026-09-21 | |
| SMTP | Config e-mail | Secrets env | Oui | IT | Demandée | 2026-09-21 | |
| Branding e-mail | JSON / consignes | Texte | Oui | Marketing | Demandée | 2026-09-21 | |
| Codes promo réels | Liste | CSV | Non | Marketing | Demandée | 2026-09-21 | |

### 5.5 Contacts projet

| Rôle | Nom | E-mail | Téléphone |
|------|-----|--------|-----------|
| Chef de projet (intégrateur) | | | |
| Référent technique | | | |
| Référent société | | | |
| Référent finance société | | | |
| Référent juridique société | | | |

---

## 6. Partie D — Modèles CSV / Excel

### 6.1 Emplacement

Les modèles sont prévus dans le dossier :

```text
docs/data-collection/
  README.md
  01-organization.csv
  02-users-staff.csv
  03-bank-accounts.csv
  04-mobile-money.csv
  05-destinations-poi.csv
  06-properties-rooms.csv
  07-flights.csv
  08-vehicles.csv
  09-cruises.csv
  10-activities-packages.csv
  11-tour-guides.csv
  12-promo-codes.csv
  13-cms-content-checklist.csv
```

Les modèles (en-têtes + exemples commentés) sont disponibles dans ce dossier. Voir aussi `docs/data-collection/README.md`.

### 6.2 Conventions communes

| Règle | Détail |
|-------|--------|
| Encodage | UTF-8 |
| Séparateur | Virgule `,` (Excel : importer en UTF-8) |
| Dates | ISO 8601 `YYYY-MM-DD` |
| Prix | Entier en **cents** (ex. `15000` = 150.00) + colonne `currency` ISO |
| Booléens | `true` / `false` |
| Téléphones | E.164 (`+243…`) |
| Images | URL HTTPS publique ou chemin fichier joint (préciser dans commentaire) |
| ID | Laisser vide pour création ; UUID uniquement si mise à jour d’existant |

### 6.3 En-têtes recommandés par fichier

#### `01-organization.csv`

```text
display_name,legal_name,slug,contact_email,currency,timezone,language,primary_color,secondary_color,logo_url,location_text,facebook_url,instagram_url,twitter_url,notes
```

#### `02-users-staff.csv`

```text
email,first_name,last_name,role_code,organization_slug,department_name,is_employee,phone,notes
```

`role_code` : `super_admin` | `org_admin` | `support` | `customer` | `gap_coordinator`

#### `03-bank-accounts.csv`

```text
bank_name,account_name,account_number,swift_bic,currency,is_default,notes
```

#### `04-mobile-money.csv`

```text
country_code,country_name,operator_name,operator_logo_url,phone_e164,label,is_active,sort_order,notes
```

#### `05-destinations-poi.csv`

```text
record_type,name,slug,country_code,description,is_featured,destination_slug,latitude,longitude,notes
```

`record_type` : `destination` | `poi`

#### `06-properties-rooms.csv`

```text
record_type,property_name,property_slug,property_type,star_rating,address_line,description,destination_slug,room_name,room_type,max_guests,bed_config,base_price_cents,currency,amenity_codes,image_urls,avail_start,avail_end,avail_stock,notes
```

`record_type` : `property` | `room` | `availability`

#### `07-flights.csv`

```text
record_type,airline_iata,airline_name,airport_iata,airport_name,city,country_code,flight_number,departure_airport,arrival_airport,departure_at,arrival_at,class_name,price_cents,currency,seats,notes
```

#### `08-vehicles.csv`

```text
record_type,agency_name,category_name,license_plate,daily_price_cents,currency,image_urls,avail_start,avail_end,status,notes
```

#### `09-cruises.csv`

```text
record_type,line_name,port_code,port_name,country_code,ship_name,itinerary_name,cabin_name,max_guests,base_price_cents,currency,sailing_start,sailing_end,stock,notes
```

#### `10-activities-packages.csv`

```text
record_type,provider_name,activity_title,price_cents,currency,duration_minutes,organization_slug,schedule_start,schedule_capacity,package_name,package_item_activity_title,image_urls,notes
```

#### `11-tour-guides.csv`

```text
display_name,contact_email,type,organization_slug,languages,status,notes
```

- Colonne DB : `type` (`internal` | `external`), pas `guide_type`
- `status` : `active` | `inactive` (colonne DB ; pas de téléphone dédié sur `tour_guides`)
- `languages` : JSON tableau de codes, ex. `["fr","en"]`
- Guide interne seed lié au user admin : supprimer la **ligne guide** uniquement, jamais l’utilisateur bootstrap sans remplacement

#### `12-promo-codes.csv`

```text
code,discount_percent,valid_from,valid_until,is_active,organization_slug,notes
```

#### `13-cms-content-checklist.csv`

```text
section,item_key,language,title_or_label,status,file_or_url,owner,notes
```

`section` exemples : `hero`, `about`, `legal_terms`, `legal_privacy`, `blog`, `gap`, `why_us`, `happy_customers`

### 6.4 Import

Les CSV servent d’abord à la **collecte**. L’import en base se fait ensuite via l’admin et/ou scripts d’intégration (Phase 4), uniquement pour les lignes au statut `Validée`.

---

## 7. Annexes

### 7.1 Mapping rapide tables MySQL

| Besoin métier | Tables |
|---------------|--------|
| Org + settings | `organizations`, `organization_settings` |
| RBAC | `permissions`, `roles`, `role_permissions`, `user_role_assignments` |
| Users / staff | `users`, `employees`, `departments` |
| Banque | `organization_bank_accounts` |
| Mobile Money | `mobile_money_countries`, `mobile_money_operators`, `mobile_money_payment_numbers` |
| Hébergement | `destinations`, `points_of_interest`, `properties`, `rooms`, `room_availability`, `amenities` |
| Vols | `airlines`, `airports`, `flights`, `flight_classes`, `flight_class_availability` |
| Véhicules | `rental_agencies`, `vehicle_categories`, `vehicles`, `vehicle_availability` |
| Croisières | `cruise_lines`, `cruise_ports`, `ships`, `itineraries`, `cabins`, `cruise_sailings`, `cabin_availability` |
| Activités / packages | `activity_providers`, `activities`, `activity_schedules`, `packages`, `package_items` |
| Guides | `tour_guides` |
| Promo | `promo_codes`, `promotions` |
| CMS | `hero_slides`, `blog_posts`, `about_*`, `legal_pages`, `why_us_*`, `happy_customers_*` |
| GAP | `gap_site_settings`, `gap_pages`, `gap_activities`, `gap_impact_stats`, `gap_media_items`, `donations` |
| Commerce runtime | `bookings`, `booking_items`, `payments`, `reviews`, `support_tickets` |

### 7.2 IDs seed démo à cibler (extrait)

Voir le registre complet : `database/seeds/seed-ids.txt`.

Exemples : `ORG_POS_GUICHET_EST`, `PROP_DEMO_HOTEL`, `ROOM_DEMO_STD`, `FLIGHT_DEMO_*`, `VEHICLE_DEMO_*`, `SHIP_DEMO_CONGO`, `ACTIVITY_DEMO_*`, `ACTIVITY_POS_EXCLUSIVE_GUICHET_EST`, package `…5001` / items `…5002`–`…5004`, guides `…0701` / `…0702` (dans `install.seed.sql` uniquement), `PROMO_POS_WELCOME10`, `ORG_BANK_DEFAULT`.  
`USER_SUPER_ADMIN` : **sécuriser** (e-mail / mot de passe), ne pas supprimer sans compte admin de remplacement.

### 7.3 Checklist go-live (rappel)

- [ ] Backup production effectué et vérifié
- [ ] Données démo absentes (ou seed prod utilisé)
- [ ] `DATABASE_AUTO_SEED=false`
- [ ] Admin prod opérationnel (plus `ChangeMe123!`)
- [ ] payment_methods + banque / MM / Stripe OK
- [ ] Catalogue minimal des verticales actives publié
- [ ] CGU + privacy publiées
- [ ] SMTP testé (e-mail de test reçu)
- [ ] Domaines / SSL (voir `docs/production-domains.md`)
- [ ] Smoke : web réservation + admin + POS (si actif)

### 7.4 Revue technique interne (Phase 1)

| Point de contrôle | Résultat |
|-------------------|----------|
| Alignement schéma MySQL / seeds / migrations MM & CMS | OK |
| Distinction démo vs paramétrage vs référence | OK |
| Risque `db:sync` / `DATABASE_AUTO_SEED` documenté | OK |
| Formulaire + statuts de collecte | OK |
| 13 CSV + README présents et liés | OK |
| Liens depuis `database/seeds/README.md` et `docs/production-domains.md` | OK |
| Corrections appliquées en v1.1 | Tableaux §4.1 ; flag `mobile_money` ; guides (`type`/`status`) ; IDs package/guides ; ordre FK croisières |

**Verdict :** document **apte à l’envoi à la société** pour la Phase 2 (collecte). Aucune purge SQL tant que les données collectées ne sont pas validées et qu’un backup staging n’est pas fait.

### 7.5 Historique du document

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0 | 2026-09-20 | Équipe projet | Création document unique A+B+C+D |
| 1.1 | 2026-09-21 | Équipe projet | Revue tech interne ; corrections schéma / paiements / guides / IDs |
| 1.2 | 2026-09-21 | Équipe projet | Phase 2 : dossier transmission + statuts → `Demandée` |

---

*Fin du document — Aucune donnée n’a été modifiée dans la base par la seule rédaction ou revue de ce fichier.*
