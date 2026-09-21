# Contrat CMS — Centre d’aide (admin)

Spécification source pour le CMS admin `/contenu/aide` (phase 1). Aligné sur le catalogue public CMS-ready [`apps/web/lib/support/help-catalog.ts`](../apps/web/lib/support/help-catalog.ts) et les clés i18n `support.help.*` (fr / en / es).

**Hors scope phase 1 :** brancher `apps/web` sur l’API (le site reste sur le catalogue local + messages).

---

## 1. Principes

| Principe | Décision |
|----------|----------|
| Séparation structure / texte | Métadonnées partagées (slug, icône, ordre, popular, related, statut) ; textes localisés |
| Locales contenu | Exactement `fr`, `en`, `es` (même jeu que `CONTENT_LOCALES` admin) |
| Modèle de persistance | Entité parente + lignes de traduction `(parent_id, locale)` — pas une ligne complète par locale (contrairement au blog) |
| Statuts | `draft` \| `published` (comme blog / légal) |
| Permissions | `help.read` / `help.write` (distinctes de `support_tickets.*`) |
| Preview public | `/support/{categorySlug}/{articleSlug}` |

Raison du modèle parent + traductions : dans `help-catalog.ts`, `popular`, `relatedSlugs`, `icon` et l’appartenance catégorie sont **indépendants de la langue**. Dupliquer une ligne article par locale forcerait à resynchroniser ces champs.

---

## 2. Mapping catalogue → CMS

### 2.1 Catégorie

| Catalogue / i18n | Champ CMS | Notes |
|------------------|-----------|--------|
| `HelpCategory.id` | `id` (UUID) | Seed : conserver un mapping stable `cat-booking` → UUID |
| `HelpCategory.slug` | `slug` | Kebab-case, unique, non vide. Seed initial : `booking`, `payment`, `cancellation`, `account`, `contact`. Le CMS **autorise** d’autres slugs ensuite. |
| `HelpCategory.icon` | `icon` | Enum fermé : `calendar` \| `card` \| `user` \| `shield` \| `message` (`HELP_ICONS`) |
| ordre dans `HELP_CATEGORIES` | `sortOrder` | Entier ≥ 0 ; ordre d’affichage hub |
| — | `status` | `draft` \| `published`. Seed : toutes `published` |
| — | `publishedAt` | `string \| null` (ISO). Rempli à la 1ʳᵉ publication ; null si `draft` |
| `support.help.categories.{slug}.title` | `translations[].title` | Requis pour chaque locale présente |
| `support.help.categories.{slug}.description` | `translations[].description` | Requis pour chaque locale présente |
| `HelpCategory.articleSlugs` | dérivé | Ordre des articles via `HelpArticle.sortOrder` dans la catégorie (pas de colonne array) |

### 2.2 Article

| Catalogue / i18n | Champ CMS | Notes |
|------------------|-----------|--------|
| `HelpArticle.id` | `id` (UUID) | Seed : mapping `art-how-to-book` → UUID |
| `HelpArticle.slug` | `slug` | Kebab-case, unique globalement |
| `HelpArticle.categorySlug` | `categoryId` | FK vers catégorie ; l’URL publique utilise le **slug** de la catégorie |
| ordre dans `category.articleSlugs` | `sortOrder` | Entier ≥ 0 **par catégorie** |
| `HelpArticle.popular` | `isPopular` | `boolean`, défaut `false` |
| `HelpArticle.relatedSlugs` | `relatedArticleIds` | UUID[] ordonnés ; max **5** ; pas d’auto-référence ; tous doivent exister |
| — | `status` | `draft` \| `published`. Seed : toutes `published` |
| — | `publishedAt` | `string \| null` (ISO) |
| `support.help.articles.{slug}.title` | `translations[].title` | Requis |
| `support.help.articles.{slug}.summary` | `translations[].summary` | Requis (carte hub / recherche) |
| `support.help.articles.{slug}.body` | `translations[].body` | HTML TipTap en CMS. Seed : paragraphes `\n\n` → `<p>…</p>` |

### 2.3 Audit (toutes entités parentes)

Aligné sur `AuditFields` (`packages/types`) :

`createdByUserId`, `updatedByUserId`, `deletedByUserId`, `createdAt`, `updatedAt`, `deletedAt` (soft-delete).

Les lignes de traduction suivent le cycle de vie du parent (cascade soft-delete ou delete avec le parent).

---

## 3. Contrats TypeScript (cible `packages/types`)

Noms provisoires pour la tâche types ; la sémantique ci-dessous est normative.

```ts
export const HELP_CONTENT_LOCALES = ['fr', 'en', 'es'] as const;
export type HelpContentLocale = (typeof HELP_CONTENT_LOCALES)[number];

export const HELP_ICONS = [
  'calendar',
  'card',
  'user',
  'shield',
  'message',
] as const;
export type HelpIcon = (typeof HELP_ICONS)[number];

export type HelpPublishStatus = 'draft' | 'published';

export interface HelpCategoryTranslation {
  locale: HelpContentLocale;
  title: string;
  description: string;
}

export interface HelpArticleTranslation {
  locale: HelpContentLocale;
  title: string;
  summary: string;
  /** HTML TipTap */
  body: string;
}

export interface HelpCategory {
  id: string;
  slug: string;
  icon: HelpIcon;
  sortOrder: number;
  status: HelpPublishStatus;
  publishedAt: string | null;
  translations: HelpCategoryTranslation[];
  // + AuditFields
}

export interface HelpArticle {
  id: string;
  slug: string;
  categoryId: string;
  /** Présent en lecture liste/détail admin pour URLs preview */
  categorySlug?: string;
  sortOrder: number;
  isPopular: boolean;
  relatedArticleIds: string[];
  status: HelpPublishStatus;
  publishedAt: string | null;
  translations: HelpArticleTranslation[];
  // + AuditFields
}
```

### Requêtes admin (intention)

| Opération | Corps / query |
|-----------|----------------|
| Create category | `slug`, `icon`, `sortOrder?`, `status?`, `translations` (≥ 1 locale) |
| Update category | Partial + `translations?` (remplacement par locale merge) |
| Reorder categories | `{ orderedIds: string[] }` |
| Create article | `slug`, `categoryId`, `sortOrder?`, `isPopular?`, `relatedArticleIds?`, `status?`, `translations` |
| Update article | Partial idem |
| Reorder articles | `{ categoryId: string; orderedIds: string[] }` |
| List categories | `page?`, `limit?`, `search?`, `status?`, `locale?` (filtre texte sur titre de cette locale) |
| List articles | `page?`, `limit?`, `search?`, `status?`, `categoryId?`, `isPopular?`, `locale?` |

### Règles de validation

1. **Slug** : `^[a-z0-9]+(?:-[a-z0-9]+)*$`, longueur 2–64.
2. **Unicité** : `slug` catégorie unique ; `slug` article unique (global).
3. **Traductions** : au moins une locale à la création ; pas de doublon de `locale` ; locales ∈ `{fr,en,es}`.
4. **Publication catégorie** : `status === 'published'` exige `title` + `description` non vides pour **au moins** `fr` (locale pivot). Autres locales optionnelles mais recommandées.
5. **Publication article** : `status === 'published'` exige `title`, `summary`, `body` non vides pour **au moins** `fr` ; `categoryId` doit référencer une catégorie **publiée**.
6. **Related** : ≤ 5 ids, uniques, ≠ self, articles existants (non soft-deleted). Peuvent être `draft` en admin ; côté public (phase 2) n’afficher que les related `published`.
7. **`publishedAt`** : si passage `draft` → `published` et `publishedAt` null → now ; repasser en `draft` ne l’efface pas (historique).
8. **Soft-delete catégorie** : refuser si des articles non supprimés y sont rattachés, **ou** soft-delete en cascade des articles (choix d’implémentation API : **refuser** — plus sûr pour le CMS).

---

## 4. Comportement type Facebook Help (admin)

| Capacité hub public | Champ / règle CMS |
|---------------------|-------------------|
| Grille de thèmes | Catégories `published`, tri `sortOrder` |
| Icône de thème | `icon` ∈ `HELP_ICONS` |
| Articles populaires | `isPopular === true` et `published` |
| Liste par thème | Articles de la catégorie, `published`, tri `sortOrder` |
| Articles liés | `relatedArticleIds` résolus en slugs pour l’URL |
| Recherche | Indexe `title` + `summary` + `body` (texte) par locale |
| Contact / tickets | Hors CMS articles — reste `/contenu/support` |

---

## 5. Seed initial (référence)

| Source | Volume |
|--------|--------|
| `HELP_CATEGORIES` | 5 catégories |
| `HELP_ARTICLES` | 22 articles |
| `popular: true` | `how-to-book`, `modify-or-cancel`, `payment-methods`, `cancellation-policy`, `update-profile` |
| Locales | Copier `support.help.*` depuis `apps/web/messages/{fr,en,es}.json` |
| Statut | Tout `published` avec `publishedAt` = date de seed |

Related : résoudre `relatedSlugs` → UUIDs après insertion des 22 articles.

---

## 6. URLs & permissions

| Surface | Valeur |
|---------|--------|
| Admin hub | `/contenu/aide` |
| Admin catégories | `/contenu/aide/categories`, `/contenu/aide/categories/nouveau`, `/contenu/aide/categories/[id]` |
| Admin articles | `/contenu/aide/articles`, `/contenu/aide/articles/nouveau`, `/contenu/aide/articles/[id]` |
| Preview | `{WEB_ORIGIN}/support/{categorySlug}/{articleSlug}` |
| API (intention) | `/help-categories`, `/help-articles` |
| RBAC | `help.read`, `help.write` |

---

## 7. Écarts volontaires vs catalogue statique

| Catalogue actuel | CMS |
|------------------|-----|
| `HelpCategorySlug` union fermée | `slug: string` (seed = les 5 valeurs) |
| `articleSlugs` sur la catégorie | `sortOrder` sur l’article |
| `relatedSlugs` | `relatedArticleIds` (stables si slug change) |
| Body texte `\n\n` | Body HTML TipTap |
| Pas de draft | `draft` \| `published` |
| Contenu dans JSON i18n | Contenu en base (traductions) |

---

## 8. Suite du plan

1. **t02–t03** — Migrations SQL conformes à ce contrat  
2. **t04** — Types exportés dans `packages/types` (copier §3)  
3. **t05–t09** — Entités, modules Nest, api-client  
4. **t10–t24** — Admin UI, seed, e2e  
5. **t25 / phase 2** — Remplacer `help-catalog.ts` + messages par lecture API publique  
