type ResetPasswordFormTranslator = {
  (
    key:
      | 'passwordLabel'
      | 'passwordPlaceholder'
      | 'confirmPasswordLabel'
      | 'confirmPasswordPlaceholder'
      | 'confirmPasswordMismatch'
      | 'submit'
      | 'submitLoading',
  ): string;
};

type ResetPasswordPageTranslator = {
  (key: 'title' | 'subtitle' | 'backToLogin'): string;
};

type ResetPasswordMissingTokenTranslator = {
  (key: 'title' | 'message' | 'forgotLabel' | 'loginLabel'): string;
};

type ResetPasswordErrorsTranslator = {
  (key: 'invalidToken' | 'network' | 'generic'): string;
};

export function getAdminResetPasswordPageCopy(t: ResetPasswordPageTranslator) {
  return {
    title: t('title'),
    subtitle: t('subtitle'),
    backToLogin: {
      href: '/login',
      label: t('backToLogin'),
    },
  };
}

export function getAdminResetPasswordFormConfig(t: ResetPasswordFormTranslator) {
  return {
    password: {
      label: t('passwordLabel'),
      placeholder: t('passwordPlaceholder'),
    },
    confirmPassword: {
      label: t('confirmPasswordLabel'),
      placeholder: t('confirmPasswordPlaceholder'),
      mismatchError: t('confirmPasswordMismatch'),
    },
    submit: {
      label: t('submit'),
      loadingLabel: t('submitLoading'),
    },
    successRedirect: '/login',
  };
}

export function getAdminResetPasswordMissingTokenCopy(
  t: ResetPasswordMissingTokenTranslator,
) {
  return {
    title: t('title'),
    message: t('message'),
    forgotHref: '/forgot-password',
    forgotLabel: t('forgotLabel'),
    loginHref: '/login',
    loginLabel: t('loginLabel'),
  };
}

export function getAdminResetPasswordErrors(t: ResetPasswordErrorsTranslator) {
  return {
    invalidToken: t('invalidToken'),
    network: t('network'),
    generic: t('generic'),
  };
}
