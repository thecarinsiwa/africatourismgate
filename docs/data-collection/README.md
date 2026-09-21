# Modèles de collecte de données — Africa Tourism Gate

Fichiers CSV destinés à la **collecte** des données de production auprès de la société.  
Document parent : [production-data-preparation.md](../production-data-preparation.md) (parties B, C, D).  
Dossier d’envoi société : [TRANSMISSION.md](./TRANSMISSION.md).

**Ces fichiers ne sont pas importés automatiquement.** Après validation (`Validée` dans le formulaire), l’intégration se fait via l’admin et/ou des scripts (Phase 4).

---

## Fichiers

| Fichier | Contenu |
|---------|---------|
| [01-organization.csv](01-organization.csv) | Organisation, locale, contact, branding |
| [02-users-staff.csv](02-users-staff.csv) | Utilisateurs, rôles, employés POS |
| [03-bank-accounts.csv](03-bank-accounts.csv) | Comptes bancaires organisation |
| [04-mobile-money.csv](04-mobile-money.csv) | Pays → opérateurs → numéros MM |
| [05-destinations-poi.csv](05-destinations-poi.csv) | Destinations et points d’intérêt |
| [06-properties-rooms.csv](06-properties-rooms.csv) | Hôtels, chambres, disponibilités |
| [07-flights.csv](07-flights.csv) | Compagnies, aéroports, vols, classes |
| [08-vehicles.csv](08-vehicles.csv) | Agences et véhicules |
| [09-cruises.csv](09-cruises.csv) | Lignes, ports, navires, cabines, départs |
| [10-activities-packages.csv](10-activities-packages.csv) | Activités, créneaux, forfaits |
| [11-tour-guides.csv](11-tour-guides.csv) | Guides (`display_name`, `type`, `status`, `languages`) |
| [12-promo-codes.csv](12-promo-codes.csv) | Codes promo |
| [13-cms-content-checklist.csv](13-cms-content-checklist.csv) | Checklist contenus CMS / légal / GAP |

Chaque fichier contient **une ligne d’en-tête** et des **lignes d’exemple commentées** (préfixe `#`). Supprimer ou adapter les exemples avant envoi. Si l’outil CSV n’accepte pas `#`, supprimer ces lignes manuellement.

---

## Conventions

| Règle | Détail |
|-------|--------|
| Encodage | **UTF-8** (sans BOM de préférence) |
| Séparateur | Virgule `,` |
| Excel | Données → Depuis un fichier texte/CSV → UTF-8 |
| Dates | ISO 8601 : `YYYY-MM-DD` (ou `YYYY-MM-DDTHH:MM:SS` pour horaires) |
| Prix | Entier en **cents** : `15000` = 150,00 + colonne `currency` (ISO 4217) |
| Booléens | `true` / `false` (minuscules) |
| Téléphones | E.164 : `+243812345678` |
| Images | URL HTTPS publique, ou chemin du fichier joint (noter dans `notes`) |
| Champs vides | Laisser vide si non applicable à la ligne |
| ID / UUID | Laisser vide pour une création ; renseigner seulement pour une mise à jour |

### Valeurs énumérées utiles

| Colonne | Valeurs |
|---------|---------|
| `role_code` | `super_admin`, `org_admin`, `support`, `customer`, `gap_coordinator` |
| `guide_type` | *(obsolète dans les CSV — utiliser `type`)* |
| `type` (11) | `internal`, `external` |
| `status` (11) | `active`, `inactive` |
| `record_type` (05) | `destination`, `poi` |
| `record_type` (06) | `property`, `room`, `availability` |
| `record_type` (07) | `airline`, `airport`, `flight`, `flight_class` |
| `record_type` (08) | `agency`, `vehicle`, `availability` |
| `record_type` (09) | `line`, `port`, `ship`, `itinerary`, `cabin`, `sailing` |
| `record_type` (10) | `provider`, `activity`, `schedule`, `package`, `package_item` |
| `section` (13) | `hero`, `about`, `legal_terms`, `legal_privacy`, `blog`, `gap`, `why_us`, `happy_customers`, `email_branding` |
| `status` (13) | `À demander`, `Demandée`, `Reçue`, `En cours de vérification`, `Validée`, `À corriger`, `Intégrée dans le système` |

### Secrets

Ne **jamais** mettre dans ces CSV : clés Stripe (`sk_…`), mots de passe SMTP, tokens API. Les transmettre via un canal sécurisé séparé (voir document parent §1.5).

### Moyens de paiement (rappel)

Le setting `payment_methods` attend les booléens : `stripe`, `cash`, `bank_transfer`, `mobile_money`. Au moins **un** doit être `true`.

---

## Workflow recommandé

1. Remplir uniquement les CSV des **verticales actives** au go-live (voir formulaire partie C.4 du document parent).
2. Joindre logos / photos / PDF légaux dans un dossier zippé nommé clairement.
3. Mettre à jour les **statuts** dans [production-data-preparation.md](../production-data-preparation.md) partie C.
4. Attendre le statut `Validée` avant toute intégration en base.

---

## Référence

Document unique : [../production-data-preparation.md](../production-data-preparation.md)
