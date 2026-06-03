import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, TextLink, ThemeToggle } from '@africatourismgate/ui';
import { BrandingLogo } from '../../../components/branding-logo';
import { PosLoginForm } from '../../../components/pos-login-form';
import { posLoginPageConfig } from '../../../config/login';

const { title, subtitle, footer, theme } = posLoginPageConfig;

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connexion employé au point de vente Africa Tourism Gate',
};

function LoginFormFallback() {
  return (
    <div className="pos-touch space-y-6" aria-busy="true" aria-label="Chargement du formulaire">
      <div className="h-14 animate-pulse rounded-lg bg-atg-elevated" />
      <div className="h-14 animate-pulse rounded-lg bg-atg-elevated" />
      <div className="h-14 animate-pulse rounded-lg bg-atg-elevated" />
    </div>
  );
}

export default function PosLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative px-6 py-6 md:px-10">
        <BrandingLogo centered />
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
              <Suspense fallback={<LoginFormFallback />}>
                <PosLoginForm />
              </Suspense>
            </div>
          </Card>
        </div>
      </main>

      <footer className="pb-8 text-center text-sm text-atg-muted">
        {footer.prefix}{' '}
        <TextLink href={footer.emailHref}>{footer.email}</TextLink>
      </footer>
    </div>
  );
}
