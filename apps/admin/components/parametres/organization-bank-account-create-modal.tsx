'use client';

import { Modal } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { OrganizationBankAccountForm } from './organization-bank-account-form';

type OrganizationBankAccountCreateModalProps = {
  open: boolean;
  organizationId: string;
  isSuperAdmin: boolean;
  onOpenChange: (open: boolean) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSuccess: () => void;
};

export function OrganizationBankAccountCreateModal({
  open,
  organizationId,
  isSuperAdmin,
  onOpenChange,
  onDirtyChange,
  onSuccess,
}: OrganizationBankAccountCreateModalProps) {
  const t = useTranslations('modules.settings.bankAccounts.form');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('createTitle')}
      showClose
      closeAriaLabel={t('cancel')}
      className="max-w-lg"
    >
      <OrganizationBankAccountForm
        key={open ? 'create-open' : 'create-closed'}
        organizationId={organizationId}
        isSuperAdmin={isSuperAdmin}
        embedded
        onDirtyChange={onDirtyChange}
        onSuccess={onSuccess}
        onCancel={() => onOpenChange(false)}
      />
    </Modal>
  );
}
