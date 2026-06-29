import type { RegisterFormConfig } from '@africatourismgate/ui';

type BookingRegisterFormTranslator = {
  (
    key:
      | 'firstNameLabel'
      | 'firstNamePlaceholder'
      | 'lastNameLabel'
      | 'lastNamePlaceholder'
      | 'emailLabel'
      | 'emailPlaceholder'
      | 'phoneLabel'
      | 'phonePlaceholder'
      | 'phoneHint'
      | 'passwordLabel'
      | 'passwordPlaceholder'
      | 'confirmPasswordLabel'
      | 'confirmPasswordPlaceholder'
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
      placeholder: t('firstNamePlaceholder'),
    },
    lastName: {
      label: t('lastNameLabel'),
      placeholder: t('lastNamePlaceholder'),
    },
    email: {
      label: t('emailLabel'),
      placeholder: t('emailPlaceholder'),
    },
    phone: {
      label: t('phoneLabel'),
      placeholder: t('phonePlaceholder'),
      hint: t('phoneHint'),
    },
    password: {
      label: t('passwordLabel'),
      placeholder: t('passwordPlaceholder'),
    },
    confirmPassword: {
      label: t('confirmPasswordLabel'),
      placeholder: t('confirmPasswordPlaceholder'),
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
