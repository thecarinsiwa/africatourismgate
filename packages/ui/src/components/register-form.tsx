'use client';

import { useState } from 'react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { PasswordInput } from './password-input';
import { TextLink } from './text-link';

type FieldConfig = {
  label: string;
  /** When true, field is required and shows a red asterisk. Defaults to true for identity/password fields. */
  required?: boolean;
  hint?: string;
};

/** Configuration textuelle du formulaire d'inscription (i18n, white-label). */
export type RegisterFormConfig = {
  firstName: FieldConfig;
  lastName: FieldConfig;
  email: FieldConfig;
  phone: FieldConfig;
  password: FieldConfig & {
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
  };
  confirmPassword: FieldConfig & {
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
    mismatchError: string;
  };
  terms: {
    label: string;
    href: string;
    linkLabel: string;
    required?: boolean;
  };
  submit: {
    label: string;
    loadingLabel: string;
  };
};

export const defaultRegisterFormConfig: RegisterFormConfig = {
  firstName: {
    label: 'Prénom',
    required: true,
  },
  lastName: {
    label: 'Nom',
    required: true,
  },
  email: {
    label: 'Adresse email',
    required: true,
  },
  phone: {
    label: 'Téléphone',
    required: false,
    hint: 'Optionnel',
  },
  password: {
    label: 'Mot de passe',
    required: true,
    hint: 'Minimum 8 caractères',
    showPasswordLabel: 'Afficher le mot de passe',
    hidePasswordLabel: 'Masquer le mot de passe',
  },
  confirmPassword: {
    label: 'Confirmer le mot de passe',
    required: true,
    showPasswordLabel: 'Afficher le mot de passe',
    hidePasswordLabel: 'Masquer le mot de passe',
    mismatchError: 'Les mots de passe ne correspondent pas',
  },
  terms: {
    label: "J'accepte les",
    href: '#',
    linkLabel: "conditions d'utilisation",
    required: true,
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
  /** When set, the terms link opens a modal (or custom UI) instead of navigating. */
  onTermsClick?: () => void;
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

function isRequired(value: boolean | undefined, defaultValue: boolean): boolean {
  return value ?? defaultValue;
}

export function RegisterForm({
  config: configPartial,
  onSubmit,
  onTermsClick,
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

  const firstNameRequired = isRequired(config.firstName.required, true);
  const lastNameRequired = isRequired(config.lastName.required, true);
  const emailRequired = isRequired(config.email.required, true);
  const phoneRequired = isRequired(config.phone.required, false);
  const passwordRequired = isRequired(config.password.required, true);
  const confirmPasswordRequired = isRequired(config.confirmPassword.required, true);
  const termsRequired = isRequired(config.terms.required, true);

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
          hint={config.firstName.hint}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required={firstNameRequired}
        />
        <Input
          id="lastName"
          name="lastName"
          type="text"
          autoComplete="family-name"
          label={config.lastName.label}
          hint={config.lastName.hint}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required={lastNameRequired}
        />
      </div>

      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        label={config.email.label}
        hint={config.email.hint}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required={emailRequired}
      />

      <Input
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        label={config.phone.label}
        hint={config.phone.hint}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required={phoneRequired}
      />

      <PasswordInput
        id="password"
        name="password"
        autoComplete="new-password"
        label={config.password.label}
        hint={config.password.hint}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (confirmPasswordError) setConfirmPasswordError(undefined);
        }}
        required={passwordRequired}
        minLength={8}
        showPasswordLabel={config.password.showPasswordLabel}
        hidePasswordLabel={config.password.hidePasswordLabel}
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        autoComplete="new-password"
        label={config.confirmPassword.label}
        hint={config.confirmPassword.hint}
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (confirmPasswordError) setConfirmPasswordError(undefined);
        }}
        required={confirmPasswordRequired}
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
        required={termsRequired}
        label={
          <span>
            {config.terms.label}{' '}
            <TextLink
              href={config.terms.href}
              className="inline"
              onClick={
                onTermsClick
                  ? (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onTermsClick();
                    }
                  : undefined
              }
            >
              {config.terms.linkLabel}
            </TextLink>
            {termsRequired ? (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            ) : null}
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
