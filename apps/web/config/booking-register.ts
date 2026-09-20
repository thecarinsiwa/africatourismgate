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
    },
    lastName: {
      label: t('lastNameLabel'),
    },
    email: {
      label: t('emailLabel'),
    },
    phone: {
      label: t('phoneLabel'),
      hint: t('phoneHint'),
    },
    password: {
      label: t('passwordLabel'),
      hint: t('passwordHint'),
    },
    confirmPassword: {
      label: t('confirmPasswordLabel'),
      mismatchError: t('confirmPasswordMismatch'),
    },
    terms: {
      label: t('termsLabel'),
      href: '#',
      linkLabel: t('termsLink'),
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
