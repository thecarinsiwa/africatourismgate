export const posHomeConfig = {
  title: 'Caisse',
  subtitle: 'Choisissez une action pour démarrer.',
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
} as const;
