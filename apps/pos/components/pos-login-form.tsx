'use client';

import { ApiClient } from '@africatourismgate/api-client';
import { LoginForm } from '@africatourismgate/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { posLoginErrors, posLoginFormConfig } from '../config/login';
import { getAuthErrorMessage } from '../lib/auth/api-errors';
import { getApiClient, resolveApiBaseUrl } from '../lib/auth/api';
import {
  authResponseToStoredSession,
  hasSelectedOrganization,
  saveSession,
  type PosStoredSession,
} from '../lib/auth/session';

const loginErrorMessages = {
  network: posLoginErrors.network,
  generic: posLoginErrors.generic,
  envMissing: posLoginErrors.envMissing,
  unauthorized: posLoginErrors.invalidCredentials,
};

function resolvePostLoginPath(next: string | null, _session: PosStoredSession): string {
  const hasOrg = hasSelectedOrganization();
  const safeNext = next === '/' || next === '/select-org' ? next : null;

  if (safeNext === '/') {
    return hasOrg ? '/' : '/select-org';
  }
  if (safeNext === '/select-org') {
    return hasOrg ? '/' : '/select-org';
  }
  return hasOrg ? '/' : '/select-org';
}

async function enrichSessionWithOrganization(
  session: PosStoredSession,
): Promise<PosStoredSession> {
  const orgId = session.user.organizationId;
  if (!orgId || session.selectedOrganizationName) {
    return session;
  }

  try {
    const org = await new ApiClient(resolveApiBaseUrl(), session.accessToken).getOrganization(
      orgId,
    );
    return {
      ...session,
      selectedOrganizationId: org.id,
      selectedOrganizationName: org.name,
    };
  } catch {
    return session;
  }
}

export function PosLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}

      <LoginForm
        className="pos-touch space-y-6"
        config={posLoginFormConfig}
        showRememberMe
        onSubmit={async ({ email, password, remember }) => {
          setError(null);
          try {
            const response = await getApiClient().login({ email, password });
            let session = authResponseToStoredSession(response);
            session = await enrichSessionWithOrganization(session);
            saveSession(session, remember);
            router.refresh();
            router.push(resolvePostLoginPath(searchParams.get('next'), session));
          } catch (err) {
            setError(getAuthErrorMessage(err, loginErrorMessages));
          }
        }}
      />
    </div>
  );
}
