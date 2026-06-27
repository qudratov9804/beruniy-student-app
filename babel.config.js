module.exports = function (api) {
  const isTest = api.env('test');
  api.cache(!isTest);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: isTest ? 'react' : 'nativewind' }],
      // nativewind/babel requires react-native-worklets which breaks jest, skip in test
      ...(!isTest ? ['nativewind/babel'] : []),
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@/components': './components',
            '@/hooks': './hooks',
            '@/services': './services',
            '@/stores': './stores',
            '@/types': './types',
            '@/constants': './constants',
            '@/utils': './utils',
          },
        },
      ],
      // react-native-reanimated/plugin re-exports react-native-worklets/plugin,
      // but react-native-worklets is not installed; use worklets-core directly
      ...(!isTest ? ['react-native-worklets-core/plugin'] : []),
    ],
  };
};
