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
  (key: 'invalidToken' | 'network' | 'generic' | 'envMissing'): string;
};

export function buildBookingResetPasswordPageCopy(
  t: ResetPasswordPageTranslator,
) {
  return {
    title: t('title'),
    subtitle: t('subtitle'),
    backToLogin: {
      href: '/booking/login',
      label: t('backToLogin'),
    },
  };
}

export function buildBookingResetPasswordFormConfig(
  t: ResetPasswordFormTranslator,
) {
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
    successRedirect: '/booking/login',
  };
}

export function buildBookingResetPasswordMissingTokenCopy(
  t: ResetPasswordMissingTokenTranslator,
) {
  return {
    title: t('title'),
    message: t('message'),
    forgotHref: '/booking/forgot-password',
    forgotLabel: t('forgotLabel'),
    loginHref: '/booking/login',
    loginLabel: t('loginLabel'),
  };
}

export function buildBookingResetPasswordErrors(
  t: ResetPasswordErrorsTranslator,
) {
  return {
    invalidToken: t('invalidToken'),
    network: t('network'),
    generic: t('generic'),
    envMissing: t('envMissing'),
  };
}
