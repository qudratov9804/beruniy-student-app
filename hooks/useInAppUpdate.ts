import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import SpInAppUpdates, { IAUInstallStatus, IAUUpdateKind } from 'sp-react-native-in-app-updates';

// Android: Play Core downloads the update in the background (flexible) and shows its own
// "update available" UI; we only need to prompt the user to restart once it's downloaded.
// iOS: no Play Core equivalent — the library checks the App Store version via iTunes and
// shows its own native alert (localized here) linking out to the App Store.
export const useInAppUpdate = () => {
  const { t } = useTranslation();
  const [updateReady, setUpdateReady] = useState(false);
  const inAppUpdatesRef = useRef<SpInAppUpdates | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const inAppUpdates = new SpInAppUpdates(false);
    inAppUpdatesRef.current = inAppUpdates;

    const onStatusUpdate = (status: { status: IAUInstallStatus }) => {
      if (status.status === IAUInstallStatus.DOWNLOADED) setUpdateReady(true);
    };
    if (Platform.OS === 'android') {
      inAppUpdates.addStatusUpdateListener(onStatusUpdate);
    }

    inAppUpdates
      .checkNeedsUpdate()
      .then((result) => {
        if (!result.shouldUpdate) return;
        if (Platform.OS === 'android') {
          inAppUpdates.startUpdate({ updateType: IAUUpdateKind.FLEXIBLE });
        } else {
          inAppUpdates.startUpdate({
            title: t('update.title'),
            message: t('update.message'),
            buttonUpgradeText: t('update.upgrade'),
            buttonCancelText: t('update.later'),
          });
        }
      })
      .catch(() => {
        // Store lookup failing (offline, store API down) shouldn't block app usage.
      });

    return () => {
      if (Platform.OS === 'android') {
        inAppUpdates.removeStatusUpdateListener(onStatusUpdate);
      }
    };
  }, [t]);

  const installUpdate = () => inAppUpdatesRef.current?.installUpdate();

  return { updateReady, dismissUpdateReady: () => setUpdateReady(false), installUpdate };
};
