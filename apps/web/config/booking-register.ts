import type { RegisterFormConfig } from '@africatourismgate/ui';

type BookingRegisterFormTranslator = {
  (
    key:
      | 'firstNameLabel'
      | 'lastNameLabel'
      | 'emailLabel'
      | 'phoneLabel'
      | 'phoneHint'
      | 'passwordLabel'
      | 'passwordHint'
      | 'confirmPasswordLabel'
      | 'confirmPasswordMismatch'
      | 'showPassword'
      | 'hidePassword'
      | 'termsLabel'
      | 'termsLink'
      | 'submit'
      | 'submitLoading',
  ): string;
};

type BookingRegisterErrorsTranslator = {
  (key: 'emailAlreadyRegistered' | 'network' | 'envMissing' | 'server' | 'generic'): string;
};

export function buildBookingRegisterFormConfig(
  t: BookingRegisterFormTranslator,
): Partial<RegisterFormConfig> {
  return {
    firstName: {
      label: t('firstNameLabel'),
      required: true,
    },
    lastName: {
      label: t('lastNameLabel'),
      required: true,
    },
    email: {
      label: t('emailLabel'),
      required: true,
    },
    phone: {
      label: t('phoneLabel'),
      required: false,
      hint: t('phoneHint'),
    },
    password: {
      label: t('passwordLabel'),
      required: true,
      hint: t('passwordHint'),
      showPasswordLabel: t('showPassword'),
      hidePasswordLabel: t('hidePassword'),
    },
    confirmPassword: {
      label: t('confirmPasswordLabel'),
      required: true,
      mismatchError: t('confirmPasswordMismatch'),
      showPasswordLabel: t('showPassword'),
      hidePasswordLabel: t('hidePassword'),
    },
    terms: {
      label: t('termsLabel'),
      href: '/legal/terms',
      linkLabel: t('termsLink'),
      required: true,
    },
    submit: {
      label: t('submit'),
      loadingLabel: t('submitLoading'),
    },
  };
}

export function buildBookingRegisterErrorMessages(t: BookingRegisterErrorsTranslator) {
  return {
    emailAlreadyRegistered: t('emailAlreadyRegistered'),
    network: t('network'),
    envMissing: t('envMissing'),
    server: t('server'),
    generic: t('generic'),
  };
}
