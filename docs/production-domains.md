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
# Vérifier .env : NEXT_PUBLIC_WEB_URL et NEXT_PUBLIC_ADMIN_URL (voir .env.production.example)
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
```
