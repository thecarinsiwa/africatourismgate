'use client';

import { useState } from 'react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { PasswordInput } from './password-input';
import { TextLink } from './text-link';

/** Configuration textuelle du formulaire d'inscription (i18n, white-label). */
export type RegisterFormConfig = {
  firstName: {
    label: string;
    placeholder: string;
  };
  lastName: {
    label: string;
    placeholder: string;
  };
  email: {
    label: string;
    placeholder: string;
  };
  phone: {
    label: string;
    placeholder: string;
    hint?: string;
  };
  password: {
    label: string;
    placeholder: string;
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
  };
  confirmPassword: {
    label: string;
    placeholder: string;
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
    mismatchError: string;
  };
  terms: {
    label: string;
    href: string;
    linkLabel: string;
  };
  submit: {
    label: string;
    loadingLabel: string;
  };
};

export const defaultRegisterFormConfig: RegisterFormConfig = {
  firstName: {
    label: 'Prénom',
    placeholder: 'Jean',
  },
  lastName: {
    label: 'Nom',
    placeholder: 'Dupont',
  },
  email: {
    label: 'Adresse email',
    placeholder: 'vous@exemple.com',
  },
  phone: {
    label: 'Téléphone',
    placeholder: '+243 000 000 000',
    hint: 'Optionnel',
  },
  password: {
    label: 'Mot de passe',
    placeholder: '••••••••',
    showPasswordLabel: 'Afficher le mot de passe',
    hidePasswordLabel: 'Masquer le mot de passe',
  },
  confirmPassword: {
    label: 'Confirmer le mot de passe',
    placeholder: '••••••••',
    showPasswordLabel: 'Afficher le mot de passe',
    hidePasswordLabel: 'Masquer le mot de passe',
    mismatchError: 'Les mots de passe ne correspondent pas',
  },
  terms: {
    label: "J'accepte les",
    href: '#',
    linkLabel: "conditions d'utilisation",
  },
  submit: {
    label: 'Créer mon compte',
    loadingLabel: 'Création du compte…',
  },
};

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
};

export type RegisterFormProps = {
  config?: Partial<RegisterFormConfig>;
  onSubmit?: (data: RegisterFormData) => void | Promise<void>;
  className?: string;
  submitButtonVariant?: React.ComponentProps<typeof Button>['variant'];
  submitButtonRightIcon?: React.ReactNode;
};

function mergeConfig(partial?: Partial<RegisterFormConfig>): RegisterFormConfig {
  if (!partial) return defaultRegisterFormConfig;
  return {
    firstName: { ...defaultRegisterFormConfig.firstName, ...partial.firstName },
    lastName: { ...defaultRegisterFormConfig.lastName, ...partial.lastName },
    email: { ...defaultRegisterFormConfig.email, ...partial.email },
    phone: { ...defaultRegisterFormConfig.phone, ...partial.phone },
    password: { ...defaultRegisterFormConfig.password, ...partial.password },
    confirmPassword: { ...defaultRegisterFormConfig.confirmPassword, ...partial.confirmPassword },
    terms: { ...defaultRegisterFormConfig.terms, ...partial.terms },
    submit: { ...defaultRegisterFormConfig.submit, ...partial.submit },
  };
}

export function RegisterForm({
  config: configPartial,
  onSubmit,
  className,
  submitButtonVariant = 'primary',
  submitButtonRightIcon = <span aria-hidden>→</span>,
}: RegisterFormProps) {
  const config = mergeConfig(configPartial);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setConfirmPasswordError(config.confirmPassword.mismatchError);
      return;
    }
    setConfirmPasswordError(undefined);

    setLoading(true);
    try {
      await onSubmit?.({ firstName, lastName, email, phone, password, acceptTerms });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className ?? 'space-y-5'}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="firstName"
          name="firstName"
          type="text"
          autoComplete="given-name"
          label={config.firstName.label}
          placeholder={config.firstName.placeholder}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          id="lastName"
          name="lastName"
          type="text"
          autoComplete="family-name"
          label={config.lastName.label}
          placeholder={config.lastName.placeholder}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

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

      <Input
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        label={config.phone.label}
        placeholder={config.phone.placeholder}
        hint={config.phone.hint}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <PasswordInput
        id="password"
        name="password"
        autoComplete="new-password"
        label={config.password.label}
        placeholder={config.password.placeholder}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (confirmPasswordError) setConfirmPasswordError(undefined);
        }}
        required
        minLength={8}
        showPasswordLabel={config.password.showPasswordLabel}
        hidePasswordLabel={config.password.hidePasswordLabel}
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        autoComplete="new-password"
        label={config.confirmPassword.label}
        placeholder={config.confirmPassword.placeholder}
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (confirmPasswordError) setConfirmPasswordError(undefined);
        }}
        required
        minLength={8}
        error={confirmPasswordError}
        showPasswordLabel={config.confirmPassword.showPasswordLabel}
        hidePasswordLabel={config.confirmPassword.hidePasswordLabel}
      />

      <Checkbox
        id="acceptTerms"
        name="acceptTerms"
        checked={acceptTerms}
        onChange={(e) => setAcceptTerms(e.target.checked)}
        required
        label={
          <span>
            {config.terms.label}{' '}
            <TextLink href={config.terms.href} className="inline">
              {config.terms.linkLabel}
            </TextLink>
          </span>
        }
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
