import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const LAST_PROMPTED_KEY = 'review_last_prompted_at';
// The OS itself throttles how often the native dialog can actually appear
// (Google/Apple allow only a handful per year regardless of how often we
// ask), but we still avoid pestering the API on every single quiz pass —
// wait at least this long between our own requests.
const MIN_INTERVAL_MS = 1000 * 60 * 60 * 24 * 30;

export const maybeRequestReview = async () => {
  try {
    const available = await StoreReview.isAvailableAsync();
    if (!available) return;

    const lastPrompted = await AsyncStorage.getItem(LAST_PROMPTED_KEY);
    if (lastPrompted && Date.now() - Number(lastPrompted) < MIN_INTERVAL_MS) return;

    await AsyncStorage.setItem(LAST_PROMPTED_KEY, String(Date.now()));
    await StoreReview.requestReview();
  } catch {
    // Reviews are a nice-to-have — never let this interrupt the user's flow.
  }
};
