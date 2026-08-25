'use client';

import { Modal } from '@africatourismgate/ui';
import type { OrganizationBankAccount } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { OrganizationBankAccountForm } from './organization-bank-account-form';

type OrganizationBankAccountEditModalProps = {
  open: boolean;
  account: OrganizationBankAccount | null;
  organizationId: string;
  isSuperAdmin: boolean;
  onOpenChange: (open: boolean) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSuccess: () => void;
};

export function OrganizationBankAccountEditModal({
  open,
  account,
  organizationId,
  isSuperAdmin,
  onOpenChange,
  onDirtyChange,
  onSuccess,
}: OrganizationBankAccountEditModalProps) {
  const t = useTranslations('modules.settings.bankAccounts.form');

  if (!account) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('editTitle')}
      showClose
      closeAriaLabel={t('cancel')}
      className="max-w-lg"
    >
      <OrganizationBankAccountForm
        key={open ? account.id : 'edit-closed'}
        organizationId={organizationId}
        isSuperAdmin={isSuperAdmin}
        account={account}
        embedded
        onDirtyChange={onDirtyChange}
        onSuccess={onSuccess}
        onCancel={() => onOpenChange(false)}
      />
    </Modal>
  );
}
