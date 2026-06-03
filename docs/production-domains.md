# Domaines production

| URL | Application | PM2 | Port interne |
|-----|-------------|-----|----------------|
| https://africatourismgate.org | Site public (`apps/web`) | `atg-web` | 3002 |
| https://app-africatourismgate.org | Admin (`apps/admin`) | `atg-admin` | 3001 |
| **https://app-africatourismgate.org/api** | API (`apps/api`) | `atg-api` | 3000 |
| **https://app-africatourismgate.org/uploads/** | Fichiers branding (`apps/api/uploads`) | `atg-api` | 3000 |

L’API est exposée sur le **même domaine** que l’admin (`/api/…` → nginx → port 3000). **Pas besoin** du sous-domaine `api.africatourismgate.org`.

Les logos et favicons utilisent `/uploads/branding/…` : nginx doit proxyer `/uploads/` vers l’API (pas vers Next.js admin). Après mise à jour du dépôt : `sudo ./scripts/setup-nginx.sh && sudo nginx -t && sudo systemctl reload nginx`.

Les variantes `www` redirigent vers le domaine canonique **sans** `www`.

## Chemins admin sur le domaine public

Sur `africatourismgate.org`, nginx et `apps/web` redirigent vers `app-africatourismgate.org` :

`/login`, `/register`, `/dashboard`, etc.

## Déploiement sur le VPS

```bash
cd /var/www/africatourismgate
git pull

# .env (racine) — exemple :
# NEXT_PUBLIC_API_URL=https://app-africatourismgate.org/api
# NEXT_PUBLIC_ADMIN_URL=https://app-africatourismgate.org
# NEXT_PUBLIC_WEB_URL=https://africatourismgate.org

pnpm build
sudo ./scripts/setup-nginx.sh
bash scripts/restart-production.sh
```

Vérifications :

```bash
pm2 list
curl -s https://app-africatourismgate.org/api/health
curl -I "https://app-africatourismgate.org/uploads/branding/VOTRE-FICHIER.png"
curl -I https://africatourismgate.org/
curl -I https://app-africatourismgate.org/login
```

Réponse health attendue : `{"status":"ok","service":"africatourismgate-api"}`.

## Erreur build admin : `@africatourismgate/config/theme`

Après `git pull`, depuis la racine du monorepo :

```bash
cd /var/www/africatourismgate
pnpm install
pnpm --filter @africatourismgate/admin build
```

Ne lancez pas `pnpm install` uniquement dans `apps/admin` — les liens workspace (`packages/config`) se font à la racine.

## Erreur « Impossible de joindre l’API »

1. **`atg-api` online** : `pm2 list`
2. **Nginx** : bloc `location /api/` sur `app-africatourismgate.org` → `sudo ./scripts/setup-nginx.sh`
3. **`.env`** : `NEXT_PUBLIC_API_URL=https://app-africatourismgate.org/api`
4. **Rebuild** : `pnpm build` puis `bash scripts/restart-production.sh`
5. **Test local VPS** : `curl -s http://127.0.0.1:3000/api/health` puis `curl -s https://app-africatourismgate.org/api/health`

## Sous-domaine api.* (optionnel)

Le fichier `nginx/snippets/atg-api-servers.conf` permet encore `https://api.africatourismgate.org` si vous ajoutez un enregistrement DNS **A** `api` → IP du VPS. Ce n’est **pas requis** avec `/api` sur `app-…`.
