import type { LoginFormConfig } from '@africatourismgate/ui';

/** Textes du formulaire de connexion admin (modifiable sans toucher aux composants). */
export const adminLoginFormConfig: LoginFormConfig = {
  email: {
    label: 'Adresse email',
    placeholder: 'admin@africatourismgate.local',
  },
  password: {
    label: 'Mot de passe',
    placeholder: '••••••••',
    forgotPassword: {
      href: '#',
      label: 'Mot de passe oublié ?',
    },
  },
  rememberMe: {
    label: 'Se souvenir de moi',
  },
  submit: {
    label: 'Se connecter',
    loadingLabel: 'Connexion…',
  },
};

/** Contenu de la page /login (carte, pied de page). */
export const adminLoginPageConfig = {
  title: 'Se connecter',
  subtitle:
    'Accédez à votre tableau de bord et gérez votre plateforme touristique en toute simplicité.',
  dividerLabel: "Besoin d'un accès ?",
  secondaryAction: {
    href: 'mailto:contact@africatourismgate.local',
    label: "Contacter l'administrateur",
  },
  footer: {
    prefix: 'Pour assistance, contactez',
    email: 'support@africatourismgate.org',
    emailHref: 'mailto:support@africatourismgate.org',
  },
  logo: {
    name: 'Africa Tourism Gate',
  },
  theme: {
    light: 'Mode clair',
    dark: 'Mode sombre',
  },
} as const;
