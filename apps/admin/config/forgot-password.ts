import type { LoginFormConfig } from '@africatourismgate/ui';

type ForgotPasswordFormTranslator = {
  (
    key:
      | 'emailLabel'
      | 'emailPlaceholder'
      | 'submit'
      | 'submitLoading',
  ): string;
};

type ForgotPasswordPageTranslator = {
  (
    key:
      | 'title'
      | 'subtitle'
      | 'successMessage'
      | 'backToLogin',
  ): string;
};

type ForgotPasswordErrorsTranslator = {
  (key: 'network' | 'generic'): string;
};

export function getAdminForgotPasswordPageCopy(t: ForgotPasswordPageTranslator) {
  return {
    title: t('title'),
    subtitle: t('subtitle'),
    successMessage: t('successMessage'),
    backToLogin: {
      href: '/login',
      label: t('backToLogin'),
    },
  };
}

export function getAdminForgotPasswordFormConfig(
  t: ForgotPasswordFormTranslator,
): Pick<LoginFormConfig, 'email'> & {
  submit: { label: string; loadingLabel: string };
} {
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

export function getAdminForgotPasswordErrors(t: ForgotPasswordErrorsTranslator) {
  return {
    network: t('network'),
    generic: t('generic'),
  };
}
