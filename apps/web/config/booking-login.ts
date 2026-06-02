import type { LoginFormConfig } from '@africatourismgate/ui';
import type { Translations } from '../lib/i18n/translations';

export function buildBookingLoginFormConfig(
  t: Translations['booking']['login']['form'],
): Partial<LoginFormConfig> {
  return {
    email: {
      label: t.emailLabel,
      placeholder: t.emailPlaceholder,
    },
    password: {
      label: t.passwordLabel,
      placeholder: t.passwordPlaceholder,
    },
    submit: {
      label: t.submit,
      loadingLabel: t.submitLoading,
    },
  };
}

export function buildBookingLoginErrorMessages(
  t: Translations['booking']['login']['errors'],
) {
  return {
    network: t.network,
    generic: t.generic,
    envMissing: t.envMissing,
    unauthorized: t.unauthorized,
  };
}
