import type { RegisterFormConfig } from '@africatourismgate/ui';

type RegisterFormTranslator = {
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

type RegisterErrorsTranslator = {
  (key: 'emailAlreadyRegistered' | 'network' | 'envMissing' | 'server' | 'generic'): string;
};

export function getAdminRegisterFormConfig(t: RegisterFormTranslator): RegisterFormConfig {
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

export function getAdminRegisterErrors(t: RegisterErrorsTranslator) {
  return {
    emailAlreadyRegistered: t('emailAlreadyRegistered'),
    network: t('network'),
    envMissing: t('envMissing'),
    server: t('server'),
    generic: t('generic'),
  };
}
