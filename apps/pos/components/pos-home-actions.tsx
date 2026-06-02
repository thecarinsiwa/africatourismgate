'use client';

import { Button } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { posHomeConfig } from '../config/home';
import { clearSelectedOrganization, getSessionPersistence } from '../lib/auth/session';

const { actions } = posHomeConfig;

type HomeActionCardProps = {
  label: string;
  description: string;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
};

function HomeActionCard({ label, description, disabled, badge, onClick }: HomeActionCardProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      fullWidth
      disabled={disabled}
      className="!h-auto min-h-[5.5rem] px-5 py-5"
      onClick={onClick}
    >
      <span className="flex w-full flex-col items-start gap-2 text-left">
        <span className="flex w-full items-center justify-between gap-2">
          <span className="text-xl font-semibold">{label}</span>
          {badge ? (
            <span className="rounded-full bg-atg-surface px-2.5 py-0.5 text-xs font-medium text-atg-muted">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="text-sm font-normal text-atg-muted">{description}</span>
      </span>
    </Button>
  );
}

export function PosHomeActions() {
  const router = useRouter();

  function handleChangeOrganization() {
    const remember = getSessionPersistence() === 'local';
    clearSelectedOrganization(remember);
    router.refresh();
    router.push('/select-org');
  }

  return (
    <div className="pos-touch grid gap-4 sm:grid-cols-2">
      <HomeActionCard
        label={actions.sale.label}
        description={actions.sale.description}
        badge={actions.sale.comingSoon}
        disabled
      />
      <HomeActionCard
        label={actions.history.label}
        description={actions.history.description}
        badge={actions.history.comingSoon}
        disabled
      />
      <div className="sm:col-span-2">
        <HomeActionCard
          label={actions.changeOrg.label}
          description={actions.changeOrg.description}
          onClick={handleChangeOrganization}
        />
      </div>
    </div>
  );
}
