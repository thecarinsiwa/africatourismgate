# PR-01 — Scénario de test (validation manifeste)

Branche : `feature/pr-01-manifest-validation`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-01)

## Règle sous test

Champs **obligatoires** : `fullName`, `nationality`, `idNumber`  
Champ **optionnel** : `sex` / genre  
Surfaces : checkout web (immédiat + assisté), admin, compte client, POS (si manifeste renseigné)

---

## Tests manuels

### A. Checkout web — assisté (forfait / activité)

1. Ouvrir un forfait ou une activité en mode assisté → panier → récap.
2. Vérifier le sous-titre manifeste (plus de « Seul le nom… ») et les `*` sur nom, nationalité, n° pièce.
3. Remplir nom + nationalité, laisser le n° pièce vide → cliquer Demander une réservation → **erreur** sous le champ, pas de redirection.
4. Remplir le n° pièce, laisser le genre vide → soumettre → **succès** (page demande envoyée).
5. En admin, ouvrir la réservation : voyageurs avec nationalité + n° pièce.

### B. Checkout web — immédiat (hôtel)

1. Réserver une chambre → récap.
2. Le formulaire manifeste apparaît (voyageurs = guests).
3. Sans n° pièce → paiement Stripe / cash **bloqué**.
4. Avec les 3 champs → paiement OK ; manifeste persisté après création booking.

### C. Compte client

1. Compte → détail réservation → Ajouter / Modifier un voyageur.
2. Sans nationalité ou n° pièce → **erreur** locale.
3. Avec les 3 champs → enregistrement OK.

### D. Admin

1. Réservation → Manifeste → Ajouter un voyageur.
2. Même validation + `*` visibles.
3. `PATCH` / `POST` API sans `idNumber` → **400**.

### E. POS

1. Vente → Manifeste → enregistrer avec nom seul → **erreur**.
2. Nom + nationalité + n° pièce → OK.
3. Fermer sans voyageurs (liste vide) → caisse toujours possible (manifeste optionnel à la caisse).

### F. i18n

1. Basculer FR / EN / ES sur le récap.
2. Aucune phrase du type « Only the full name is required » / « Seul le nom… » / « Solo el nombre… ».

---

## Playwright

```bash
cd apps/web
pnpm exec playwright test tests/e2e/manifest-checkout-validation.spec.ts
# ou suite checkout mise à jour :
pnpm exec playwright test tests/e2e/package-checkout.spec.ts tests/e2e/reservation-checkout.spec.ts tests/e2e/manifest-checkout-validation.spec.ts
```

Fichiers :

| Fichier | Rôle |
| ------- | ---- |
| `tests/e2e/manifest-checkout-validation.spec.ts` | Bloqué sans n° pièce ; OK avec 3 champs |
| `tests/e2e/helpers/fill-manifest.ts` | Helper remplissage + mock API |
| Specs checkout existantes | Remplissent le manifeste complet |

---

## Checklist d’acceptation PR-01

- [ ] Checkout web : impossible avec `idNumber` vide
- [ ] `sex` peut rester vide
- [ ] Admin / compte / POS alignés
- [ ] i18n FR/EN/ES à jour
- [ ] Playwright `manifest-checkout-validation` vert
