import type { RegisterFormConfig } from '@africatourismgate/ui';

type RegisterFormTranslator = {
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

type RegisterErrorsTranslator = {
  (key: 'emailAlreadyRegistered' | 'network' | 'envMissing' | 'server' | 'generic'): string;
};

export function getAdminRegisterFormConfig(t: RegisterFormTranslator): RegisterFormConfig {
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

export function getAdminRegisterErrors(t: RegisterErrorsTranslator) {
  return {
    emailAlreadyRegistered: t('emailAlreadyRegistered'),
    network: t('network'),
    envMissing: t('envMissing'),
    server: t('server'),
    generic: t('generic'),
  };
}
