import type { Metadata } from 'next';
import { Card, Logo, TextLink, ThemeToggle } from '@africatourismgate/ui';
import { AdminForgotPasswordForm } from '../../../components/admin-forgot-password-form';
import { adminForgotPasswordPageConfig } from '../../../config/forgot-password';

const { logo, title, subtitle, backToLogin, theme } = adminForgotPasswordPageConfig;

export const metadata: Metadata = {
  title: 'Mot de passe oublié — Africa Tourism Gate Admin',
  description: 'Réinitialisez votre mot de passe admin',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative px-6 py-6 md:px-10">
        <Logo name={logo.name} centered />
        <div className="absolute right-6 top-6 md:right-10">
          <ThemeToggle labels={{ light: theme.light, dark: theme.dark }} />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Card accent>
            <h1 className="text-2xl font-bold text-atg-fg">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-atg-muted">{subtitle}</p>

            <div className="mt-8">
              <AdminForgotPasswordForm />
            </div>

            <p className="mt-8 text-center text-sm">
              <TextLink href={backToLogin.href}>{backToLogin.label}</TextLink>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
