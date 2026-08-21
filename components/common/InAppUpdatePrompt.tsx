import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInAppUpdate } from '@/hooks/useInAppUpdate';
import { ConfirmDialog } from './ConfirmDialog';

// Mounted once near the app root; renders nothing until a flexible Android update
// has finished downloading and is waiting for the user to restart.
export const InAppUpdatePrompt: React.FC = () => {
  const { t } = useTranslation();
  const { updateReady, dismissUpdateReady, installUpdate } = useInAppUpdate();

  return (
    <ConfirmDialog
      visible={updateReady}
      title={t('update.readyTitle')}
      message={t('update.readyMessage')}
      cancelLabel={t('update.later')}
      confirmLabel={t('update.restart')}
      onCancel={dismissUpdateReady}
      onConfirm={() => {
        dismissUpdateReady();
        installUpdate();
      }}
    />
  );
};
