# Transmission — Collecte des données de production

**Projet :** Africa Tourism Gate  
**Phase :** 2 — Envoi à la société  
**Date de préparation du dossier :** 2026-09-21  
**Statut envoi :** À expédier par l’équipe projet (contacts société à renseigner)

---

## 1. Contenu du dossier à transmettre

| # | Pièce | Emplacement dans le dépôt | Obligatoire |
|---|--------|---------------------------|-------------|
| 1 | Guide + formulaire de collecte (parties A–D) | [`docs/production-data-preparation.md`](../production-data-preparation.md) | Oui |
| 2 | Conventions CSV | [`docs/data-collection/README.md`](./README.md) | Oui |
| 3 | Modèles CSV (01 à 13) | [`docs/data-collection/*.csv`](./) | Oui |
| 4 | Domaines / URLs prod (contexte) | [`docs/production-domains.md`](../production-domains.md) | Facultatif |

### Export recommandé pour l’envoi (hors Git)

Créer une archive ZIP nommée par exemple :

`ATG-collecte-donnees-production-2026-09-21.zip`

Contenant :

```text
README-ENVOI.txt          (copier le §2 et §3 ci-dessous en texte simple)
production-data-preparation.md
data-collection/
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

> Les secrets Stripe / SMTP **ne doivent pas** figurer dans le ZIP ni dans un e-mail en clair.

---

## 2. Modèle d’e-mail (FR) — à envoyer

**Objet :** Africa Tourism Gate — Demande de données pour la mise en production

```text
Bonjour,

Dans le cadre de la mise en production de la plateforme Africa Tourism Gate, nous
vous transmettons le dossier de collecte des données nécessaires à la configuration
et à l’alimentation du système.

Pièces jointes / lien de partage :
- production-data-preparation.md — guide unique (nettoyage DB, inventaire, formulaire
  de collecte avec suivi de statut, spécifications CSV)
- dossier data-collection/ — 13 modèles CSV + consignes de remplissage

Consignes principales :
1. Remplir les tableaux du formulaire (partie C) et/ou les fichiers CSV concernés.
2. Indiquer, pour chaque module, le service responsable côté société.
3. Prioriser les verticales actives au lancement (hébergement, vols, etc.).
4. Transmettre logos, photos et textes légaux (CGU, confidentialité) en pièces jointes.
5. Les secrets (clés Stripe, mots de passe SMTP) : canal sécurisé séparé uniquement
   — ne pas les coller dans les CSV ni dans un e-mail non chiffré.

Statuts de suivi (à mettre à jour au fil de l’eau) :
À demander → Demandée → Reçue → En cours de vérification → Validée → À corriger
→ Intégrée dans le système

Date cible de retour souhaitée : _______________

Contacts projet :
- Chef de projet : _______________  /  _______________
- Référent technique : _______________  /  _______________

Nous restons disponibles pour une session de cadrage (30–45 min) afin de préciser
les verticales actives au go-live et les formats attendus.

Cordialement,
[Nom]
[Fonction]
[Société / intégrateur]
[Téléphone]
```

---

## 3. Checklist d’expédition (équipe projet)

- [ ] Contacts société renseignés (destinataire principal + copies Finance / Juridique / IT)
- [ ] Archive ZIP générée et vérifiée (fichiers ouverts correctement)
- [ ] E-mail envoyé (ou lien de partage sécurisé créé)
- [ ] Date / heure d’envoi notées ci-dessous
- [ ] Statuts du formulaire passés à `Demandée` dans `production-data-preparation.md`
- [ ] Accusé de réception de la société obtenu

| Champ | Valeur |
|-------|--------|
| Destinataire principal | |
| Copies (CC) | |
| Canal | E-mail / Drive / autre : ________ |
| Date / heure d’envoi | |
| Envoyé par | |
| Accusé de réception | Oui / Non — date : |

---

## 4. Journal

| Date | Action | Auteur |
|------|--------|--------|
| 2026-09-21 | Dossier de transmission préparé ; statuts formulaire → `Demandée` | Équipe projet |
| | Envoi effectif à la société | *(à compléter)* |

---

## 5. Suite (Phase 2 — suivi)

Après envoi :

1. Relancer si pas d’accusé sous 3–5 jours ouvrés.
2. Au fur et à mesure des retours : passer les modules à `Reçue` puis `En cours de vérification`.
3. Voir tâches Phase 2 : suivi des statuts + vérification formats.
