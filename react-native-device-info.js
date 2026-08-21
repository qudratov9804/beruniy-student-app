// sp-react-native-in-app-updates depends on react-native-device-info, a native module
// we don't otherwise need — babel aliases it to this Expo-Constants-backed shim instead
// of linking the real native module (see babel.config.js module-resolver alias).
import Constants from 'expo-constants';

export const getBundleId = () => {
  return Constants.expoConfig?.ios?.bundleIdentifier ?? '';
};
export const getVersion = () => {
  return Constants.expoConfig?.version;
};
export default {
  getBundleId,
  getVersion,
};
