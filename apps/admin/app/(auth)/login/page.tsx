import type { Metadata } from 'next';
import { Button, Card, Divider, Logo, TextLink } from '@africatourismgate/ui';
import { AdminLoginForm } from '../../../components/admin-login-form';
import { adminLoginPageConfig } from '../../../config/login';

const { logo, title, subtitle, dividerLabel, secondaryAction, footer } = adminLoginPageConfig;

export const metadata: Metadata = {
  title: 'Connexion — Africa Tourism Gate Admin',
  description: 'Accédez au back-office Africa Tourism Gate',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 py-6 md:px-10">
        <Logo name={logo.name} centered />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Card accent>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-atg-muted">{subtitle}</p>

            <div className="mt-8">
              <AdminLoginForm />
            </div>

            <Divider className="my-8">{dividerLabel}</Divider>

            <Button variant="outline" size="md" fullWidth href={secondaryAction.href}>
              {secondaryAction.label}
            </Button>
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
