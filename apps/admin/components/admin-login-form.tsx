'use client';

import { LoginForm } from '@africatourismgate/ui';
import { adminLoginFormConfig } from '../config/login';

export function AdminLoginForm() {
  return (
    <LoginForm
      config={adminLoginFormConfig}
      onSubmit={async () => {
        // Auth API — POST /api/auth/login
      }}
    />
  );
}
