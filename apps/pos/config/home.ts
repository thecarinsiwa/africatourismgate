export const posHomeConfig = {
  title: 'Caisse',
  subtitle: 'Choisissez une action pour démarrer votre session de vente.',
  orgBadgeLabel: 'Établissement',
  greeting: {
    morning: 'Bonjour',
    afternoon: 'Bon après-midi',
    evening: 'Bonsoir',
  },
  brandName: 'Africa Tourism Gate',
  brandTagline: 'Point de vente',
  actions: {
    sale: {
      label: 'Nouvelle vente',
      description: 'Recherche produit et encaissement',
    },
    history: {
      label: 'Historique',
      description: 'Ventes du jour',
      comingSoon: 'Bientôt disponible',
    },
    changeOrg: {
      label: 'Changer d’établissement',
      description: 'Autre organisation',
    },
  },
  shell: {
    logoutLabel: 'Déconnexion',
    employeeLabel: 'Employé',
    organizationLabel: 'Établissement',
  },
  theme: {
    light: 'Mode clair',
    dark: 'Mode sombre',
  },
} as const;
