import type { Metadata } from 'next';
import { Button, Card, Divider, Logo, TextLink, ThemeToggle } from '@africatourismgate/ui';
import { AdminLoginForm } from '../../../components/admin-login-form';
import { adminLoginPageConfig } from '../../../config/login';

const { logo, title, subtitle, dividerLabel, secondaryAction, footer, theme } =
  adminLoginPageConfig;

export const metadata: Metadata = {
  title: 'Connexion — Africa Tourism Gate Admin',
  description: 'Accédez au back-office Africa Tourism Gate',
};

export default function LoginPage() {
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
