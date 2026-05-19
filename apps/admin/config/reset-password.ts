/** Textes de la page réinitialisation mot de passe */
export const adminResetPasswordPageConfig = {
  title: 'Nouveau mot de passe',
  subtitle: 'Choisissez un mot de passe sécurisé pour votre compte.',
  password: {
    label: 'Nouveau mot de passe',
    placeholder: '••••••••',
  },
  confirmPassword: {
    label: 'Confirmer le mot de passe',
    placeholder: '••••••••',
    mismatchError: 'Les mots de passe ne correspondent pas',
  },
  submit: {
    label: 'Réinitialiser le mot de passe',
    loadingLabel: 'Réinitialisation…',
  },
  missingToken: {
    title: 'Lien invalide',
    message:
      'Ce lien de réinitialisation est incomplet ou a expiré. Demandez un nouveau lien.',
    forgotHref: '/forgot-password',
    forgotLabel: 'Demander un nouveau lien',
    loginHref: '/login',
    loginLabel: 'Retour à la connexion',
  },
  successRedirect: '/login',
  logo: {
    name: 'Africa Tourism Gate',
  },
  theme: {
    light: 'Mode clair',
    dark: 'Mode sombre',
  },
} as const;

export const adminResetPasswordErrors = {
  invalidToken:
    'Lien de réinitialisation expiré ou invalide. Demandez un nouveau lien.',
  network: 'Impossible de joindre le serveur. Vérifiez votre connexion.',
  generic: 'Une erreur est survenue. Veuillez réessayer.',
} as const;
