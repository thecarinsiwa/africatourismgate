'use client';

import { useState } from 'react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { PasswordInput } from './password-input';
import { TextLink } from './text-link';

/** Configuration textuelle du formulaire de connexion (i18n, white-label). */
export type LoginFormConfig = {
  email: {
    label: string;
    placeholder: string;
  };
  password: {
    label: string;
    placeholder: string;
    forgotPassword?: {
      href: string;
      label: string;
    };
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
  };
  rememberMe: {
    label: string;
  };
  submit: {
    label: string;
    loadingLabel: string;
  };
};

export const defaultLoginFormConfig: LoginFormConfig = {
  email: {
    label: 'Adresse email',
    placeholder: 'admin@africatourismgate.local',
  },
  password: {
    label: 'Mot de passe',
    placeholder: '••••••••',
    forgotPassword: {
      href: '#',
      label: 'Mot de passe oublié ?',
    },
    showPasswordLabel: 'Afficher le mot de passe',
    hidePasswordLabel: 'Masquer le mot de passe',
  },
  rememberMe: {
    label: 'Se souvenir de moi',
  },
  submit: {
    label: 'Se connecter',
    loadingLabel: 'Connexion…',
  },
};

export type LoginFormProps = {
  config?: Partial<LoginFormConfig>;
  /** Appelé à la soumission avec les valeurs du formulaire. */
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void | Promise<void>;
  className?: string;
  submitButtonVariant?: React.ComponentProps<typeof Button>['variant'];
  submitButtonRightIcon?: React.ReactNode;
};

function mergeConfig(partial?: Partial<LoginFormConfig>): LoginFormConfig {
  if (!partial) return defaultLoginFormConfig;
  return {
    email: { ...defaultLoginFormConfig.email, ...partial.email },
    password: { ...defaultLoginFormConfig.password, ...partial.password },
    rememberMe: { ...defaultLoginFormConfig.rememberMe, ...partial.rememberMe },
    submit: { ...defaultLoginFormConfig.submit, ...partial.submit },
  };
}

export function LoginForm({
  config: configPartial,
  onSubmit,
  className,
  submitButtonVariant = 'primary',
  submitButtonRightIcon = <span aria-hidden>→</span>,
}: LoginFormProps) {
  const config = mergeConfig(configPartial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit?.({ email, password, remember });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className ?? 'space-y-5'}>
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        label={config.email.label}
        placeholder={config.email.placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <PasswordInput
        id="password"
        name="password"
        autoComplete="current-password"
        label={config.password.label}
        placeholder={config.password.placeholder}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        showPasswordLabel={config.password.showPasswordLabel}
        hidePasswordLabel={config.password.hidePasswordLabel}
        labelExtra={
          config.password.forgotPassword ? (
            <TextLink href={config.password.forgotPassword.href}>
              {config.password.forgotPassword.label}
            </TextLink>
          ) : undefined
        }
      />

      <Checkbox
        id="remember"
        name="remember"
        label={config.rememberMe.label}
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
      />

      <Button
        type="submit"
        variant={submitButtonVariant}
        size="lg"
        fullWidth
        loading={loading}
        loadingText={config.submit.loadingLabel}
        rightIcon={!loading ? submitButtonRightIcon : undefined}
      >
        {config.submit.label}
      </Button>
    </form>
  );
}
