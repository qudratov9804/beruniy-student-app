// No store to check on web — sp-react-native-in-app-updates has no web
// platform module, so importing it here would break the web bundle.
export const useInAppUpdate = () => ({
  updateReady: false,
  dismissUpdateReady: () => {},
  installUpdate: () => {},
});
