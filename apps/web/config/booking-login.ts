import type { LoginFormConfig } from '@africatourismgate/ui';

type BookingLoginFormTranslator = {
  (
    key:
      | 'emailLabel'
      | 'emailPlaceholder'
      | 'passwordLabel'
      | 'passwordPlaceholder'
      | 'forgotPassword'
      | 'showPassword'
      | 'hidePassword'
      | 'submit'
      | 'submitLoading',
  ): string;
};

type BookingLoginErrorsTranslator = {
  (key: 'network' | 'generic' | 'envMissing' | 'unauthorized'): string;
};

export function buildBookingLoginFormConfig(
  t: BookingLoginFormTranslator,
): Partial<LoginFormConfig> {
  return {
    email: {
      label: t('emailLabel'),
      placeholder: t('emailPlaceholder'),
    },
    password: {
      label: t('passwordLabel'),
      placeholder: t('passwordPlaceholder'),
      forgotPassword: {
        href: '/booking/forgot-password',
        label: t('forgotPassword'),
      },
      showPasswordLabel: t('showPassword'),
      hidePasswordLabel: t('hidePassword'),
    },
    submit: {
      label: t('submit'),
      loadingLabel: t('submitLoading'),
    },
  };
}

export function buildBookingLoginErrorMessages(t: BookingLoginErrorsTranslator) {
  return {
    network: t('network'),
    generic: t('generic'),
    envMissing: t('envMissing'),
    unauthorized: t('unauthorized'),
  };
}
