'use client';

import { useRouter } from 'next/navigation';
import { logout } from '../lib/auth/logout';

type PosChangeAccountLinkProps = {
  label: string;
};

export function PosChangeAccountLink({ label }: PosChangeAccountLinkProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
      onClick={() => {
        void (async () => {
          await logout();
          router.refresh();
          router.push('/login');
        })();
      }}
    >
      {label}
    </button>
  );
}
