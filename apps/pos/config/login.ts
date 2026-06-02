import type { LoginFormConfig } from '@africatourismgate/ui';

/** Textes du formulaire de connexion caisse (configurable sans toucher aux composants). */
export const posLoginFormConfig: LoginFormConfig = {
  email: {
    label: 'Adresse e-mail',
    placeholder: 'employe@exemple.com',
  },
  password: {
    label: 'Mot de passe',
    placeholder: '••••••••',
    showPasswordLabel: 'Afficher le mot de passe',
    hidePasswordLabel: 'Masquer le mot de passe',
  },
  rememberMe: {
    label: 'Rester connecté sur cette caisse',
  },
  submit: {
    label: 'Ouvrir la caisse',
    loadingLabel: 'Connexion…',
  },
};

export const posLoginErrors = {
  invalidCredentials: 'Adresse e-mail ou mot de passe incorrect.',
  network:
    'Impossible de joindre l’API. Vérifiez que le serveur est démarré (pnpm dev:api) et NEXT_PUBLIC_API_URL.',
  envMissing:
    'Configuration manquante : définissez NEXT_PUBLIC_API_URL à la racine du projet, puis redémarrez pnpm dev:pos.',
  generic: 'Une erreur est survenue. Veuillez réessayer.',
} as const;

export const posLoginPageConfig = {
  title: 'Connexion employé',
  subtitle: 'Identifiez-vous pour accéder à la caisse enregistreuse.',
  brandName: 'Africa Tourism Gate',
  brandTagline: 'Point de vente',
  footer: {
    prefix: 'Assistance',
    email: 'support@africatourismgate.org',
    emailHref: 'mailto:support@africatourismgate.org',
  },
  theme: {
    light: 'Mode clair',
    dark: 'Mode sombre',
  },
} as const;
