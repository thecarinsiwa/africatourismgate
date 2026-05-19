import type { RegisterFormConfig } from '@africatourismgate/ui';

/** Textes du formulaire d'inscription admin (modifiable sans toucher aux composants). */
export const adminRegisterFormConfig: RegisterFormConfig = {
  firstName: {
    label: 'Prénom',
    placeholder: 'Carin',
  },
  lastName: {
    label: 'Nom',
    placeholder: 'Siwa',
  },
  email: {
    label: 'Adresse email',
    placeholder: 'vous@exemple.com',
  },
  phone: {
    label: 'Téléphone',
    placeholder: '+243 000 000 000',
    hint: 'Optionnel',
  },
  password: {
    label: 'Mot de passe',
    placeholder: '••••••••',
  },
  confirmPassword: {
    label: 'Confirmer le mot de passe',
    placeholder: '••••••••',
    mismatchError: 'Les mots de passe ne correspondent pas',
  },
  terms: {
    label: "J'accepte les",
    href: '#',
    linkLabel: "conditions d'utilisation",
  },
  submit: {
    label: 'Créer mon compte',
    loadingLabel: 'Création du compte…',
  },
};

export const adminRegisterErrors = {
  emailAlreadyRegistered:
    'Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse.',
  network: 'Impossible de joindre le serveur. Vérifiez votre connexion.',
  generic: 'Une erreur est survenue. Veuillez réessayer.',
} as const;

/** Contenu de la page /register (carte, pied de page). */
export const adminRegisterPageConfig = {
  title: 'Créer un compte',
  subtitle:
    'Rejoignez Africa Tourism Gate pour gérer vos offres touristiques, réservations et activités sur la plateforme.',
  dividerLabel: 'Déjà un compte ?',
  secondaryAction: {
    href: '/login',
    label: 'Se connecter',
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
