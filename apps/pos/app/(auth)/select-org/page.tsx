import type { Metadata } from 'next';
import { Card, Logo, ThemeToggle } from '@africatourismgate/ui';
import { PosChangeAccountLink } from '../../../components/pos-change-account-link';
import { PosOrgSelect } from '../../../components/pos-org-select';
import { posLoginPageConfig } from '../../../config/login';
import { posSelectOrgPageConfig } from '../../../config/select-org';

const { title, subtitle } = posSelectOrgPageConfig;
const { brandName, brandTagline, theme } = posLoginPageConfig;

export const metadata: Metadata = {
  title: 'Établissement — Caisse ATG',
  description: 'Sélection de l’organisation pour la session de caisse',
};

export default function PosSelectOrgPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative px-6 py-6 md:px-10">
        <div className="flex flex-col items-center gap-1 text-center">
          <Logo name={brandName} />
          <p className="text-sm font-medium text-atg-muted">{brandTagline}</p>
        </div>
        <div className="absolute right-6 top-6 md:right-10">
          <ThemeToggle labels={{ light: theme.light, dark: theme.dark }} />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-2xl">
          <Card accent>
            <h1 className="text-3xl font-bold text-atg-fg">{title}</h1>
            <p className="mt-3 text-base leading-relaxed text-atg-muted">{subtitle}</p>

            <div className="mt-8">
              <PosOrgSelect />
            </div>

            <p className="mt-8 text-center">
              <PosChangeAccountLink label={posSelectOrgPageConfig.changeAccountLabel} />
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
