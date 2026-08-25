import type { LoginFormConfig } from '@africatourismgate/ui';

type LoginFormTranslator = {
  (key: 'emailLabel' | 'emailPlaceholder' | 'passwordLabel' | 'passwordPlaceholder' | 'forgotPassword' | 'submit' | 'submitLoading'): string;
};

type LoginErrorsTranslator = {
  (key: 'invalidCredentials' | 'network' | 'envMissing' | 'generic' | 'accountPendingApproval'): string;
};

/** Textes du formulaire de connexion admin (i18n via next-intl). */
export function getAdminLoginFormConfig(t: LoginFormTranslator): LoginFormConfig {
  return {
    email: {
      label: t('emailLabel'),
      placeholder: t('emailPlaceholder'),
    },
    password: {
      label: t('passwordLabel'),
      placeholder: t('passwordPlaceholder'),
      forgotPassword: {
        href: '/forgot-password',
        label: t('forgotPassword'),
      },
    },
    rememberMe: {
      label: '',
    },
    submit: {
      label: t('submit'),
      loadingLabel: t('submitLoading'),
    },
  };
}

export function getAdminLoginErrors(t: LoginErrorsTranslator) {
  return {
    invalidCredentials: t('invalidCredentials'),
    network: t('network'),
    envMissing: t('envMissing'),
    generic: t('generic'),
    unauthorized: t('invalidCredentials'),
    accountPendingApproval: t('accountPendingApproval'),
  };
}
