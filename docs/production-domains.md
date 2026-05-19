# Domaines production

| URL | Application | PM2 | Port |
|-----|-------------|-----|------|
| https://africatourismgate.org | Site public (`apps/web`) | `atg-web` | 3002 |
| https://app-africatourismgate.org | Admin (`apps/admin`) | `atg-admin` | 3001 |
| https://api.africatourismgate.org/api | API (`apps/api`) | `atg-api` | 3000 |

Les variantes `www` redirigent vers le domaine canonique **sans** `www`.

## Chemins admin sur le domaine public

Sur `africatourismgate.org`, nginx et `apps/web` redirigent vers `app-africatourismgate.org` :

`/login`, `/register`, `/dashboard`, `/organisations`, `/utilisateurs`, `/hebergements`, `/reservations`, `/parametres`, etc.

## Déploiement sur le VPS

```bash
cd /chemin/vers/africatourismgate
git pull
# Vérifier .env : NEXT_PUBLIC_WEB_URL, NEXT_PUBLIC_ADMIN_URL, NEXT_PUBLIC_API_URL (voir .env.production.example)
pnpm build
sudo ./scripts/setup-nginx.sh
bash scripts/restart-production.sh
```

Vérifications :

```bash
pm2 list   # atg-web et atg-admin en ligne
curl -I https://africatourismgate.org/
curl -I https://app-africatourismgate.org/login
curl -I https://africatourismgate.org/login   # doit rediriger vers app-…
curl -I https://api.africatourismgate.org/api/health   # doit répondre 200
```

## Erreur « Impossible de joindre l’API » sur /register

1. **DNS** : enregistrement **A** `api.africatourismgate.org` → IP du VPS (comme les autres sous-domaines).
2. **Certificat + nginx** : `sudo ./scripts/issue-ssl-certs.sh` (inclure `api.africatourismgate.org`) puis `sudo ./scripts/setup-nginx.sh`.
3. **`.env` sur le VPS** (racine du repo) :
   ```env
   NEXT_PUBLIC_API_URL=https://api.africatourismgate.org/api
   ```
4. **Rebuild obligatoire** après modification de `.env` :
   ```bash
   pnpm build
   bash scripts/restart-production.sh
   ```
5. **PM2** : `pm2 list` → `atg-api` doit être **online**.
6. Test : `curl https://api.africatourismgate.org/api/health` → `{"status":"ok",...}`.
