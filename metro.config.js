const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { FileStore } = require('metro-cache');

const config = getDefaultConfig(__dirname);

// Windows: the default cache under %TEMP%\metro-cache intermittently throws EMFILE
// under concurrent worker access (antivirus/OneDrive locking newly written files).
// A project-local cache directory doesn't hit the same contention.
config.cacheStores = [new FileStore({ root: path.join(__dirname, '.metro-cache') })];

// react-async-hook's package.json "module" field points at a file that isn't
// actually published (react-async-hook.esm.js) — force Metro to its real "main" entry.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-async-hook') {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'node_modules/react-async-hook/dist/index.js'),
    };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
