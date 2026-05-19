import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, Logo, TextLink, ThemeToggle } from '@africatourismgate/ui';
import { AdminResetPasswordForm } from '../../../components/admin-reset-password-form';
import { adminResetPasswordPageConfig } from '../../../config/reset-password';

const { logo, title, subtitle, theme } = adminResetPasswordPageConfig;

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe — Africa Tourism Gate Admin',
  description: 'Définissez un nouveau mot de passe pour votre compte admin',
};

export default function ResetPasswordPage() {
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
              <Suspense fallback={<p className="text-sm text-atg-muted">Chargement…</p>}>
                <AdminResetPasswordForm />
              </Suspense>
            </div>

            <p className="mt-8 text-center text-sm">
              <TextLink href="/login">Retour à la connexion</TextLink>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
