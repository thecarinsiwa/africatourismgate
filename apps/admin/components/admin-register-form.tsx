'use client';

import { RegisterForm } from '@africatourismgate/ui';
import { adminRegisterFormConfig } from '../config/register';

export function AdminRegisterForm() {
  return (
    <RegisterForm
      config={adminRegisterFormConfig}
      onSubmit={async () => {
        // Auth API — POST /api/auth/register
      }}
    />
  );
}
