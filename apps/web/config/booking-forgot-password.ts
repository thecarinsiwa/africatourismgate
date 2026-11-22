type ForgotPasswordFormTranslator = {
  (
    key: 'emailLabel' | 'emailPlaceholder' | 'submit' | 'submitLoading',
  ): string;
};

type ForgotPasswordPageTranslator = {
  (
    key: 'title' | 'subtitle' | 'successMessage' | 'backToLogin',
  ): string;
};

type ForgotPasswordErrorsTranslator = {
  (key: 'network' | 'generic' | 'envMissing'): string;
};

export function buildBookingForgotPasswordPageCopy(
  t: ForgotPasswordPageTranslator,
) {
  return {
    title: t('title'),
    subtitle: t('subtitle'),
    successMessage: t('successMessage'),
    backToLogin: {
      href: '/booking/login',
      label: t('backToLogin'),
    },
  };
}

export function buildBookingForgotPasswordFormConfig(
  t: ForgotPasswordFormTranslator,
) {
  return {
    email: {
      label: t('emailLabel'),
      placeholder: t('emailPlaceholder'),
    },
    submit: {
      label: t('submit'),
      loadingLabel: t('submitLoading'),
    },
  };
}

export function buildBookingForgotPasswordErrors(
  t: ForgotPasswordErrorsTranslator,
) {
  return {
    network: t('network'),
    generic: t('generic'),
    envMissing: t('envMissing'),
  };
}
