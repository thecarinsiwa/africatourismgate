'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ensureClientAccessToken } from '../../lib/auth/client-session';

type Props = {
  children: ReactNode;
  currentPathWithQuery: string;
};

export function WebAuthGuard({ children, currentPathWithQuery }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void ensureClientAccessToken().then((token) => {
      if (!mounted) return;
      if (!token) {
        const next = encodeURIComponent(currentPathWithQuery);
        router.replace(`/booking/login?next=${next}`);
        return;
      }
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [currentPathWithQuery, router]);

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-atg-muted">Verification de la session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
