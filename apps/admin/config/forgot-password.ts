/** Textes de la page mot de passe oublié */
export const adminForgotPasswordPageConfig = {
  title: 'Mot de passe oublié',
  subtitle:
    'Saisissez votre adresse e-mail. Si un compte existe, vous recevrez les instructions pour réinitialiser votre mot de passe.',
  email: {
    label: 'Adresse email',
    placeholder: 'votre-email@exemple.com',
  },
  submit: {
    label: 'Envoyer le lien',
    loadingLabel: 'Envoi…',
  },
  successMessage:
    'Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé.',
  backToLogin: {
    href: '/login',
    label: 'Retour à la connexion',
  },
  logo: {
    name: 'Africa Tourism Gate',
  },
  theme: {
    light: 'Mode clair',
    dark: 'Mode sombre',
  },
} as const;

export const adminForgotPasswordErrors = {
  network: 'Impossible de joindre le serveur. Vérifiez votre connexion.',
  generic: 'Une erreur est survenue. Veuillez réessayer.',
} as const;
