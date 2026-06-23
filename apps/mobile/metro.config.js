const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.assetExts = [
  ...config.resolver.assetExts.filter((ext) => ext !== 'tflite'),
  'tflite',
  'bin',
];

// Force all packages to use the same singleton instances of React and React Native.
// Without this, web-only packages (@radix-ui, react-router, etc.) that ship their own
// nested react copy cause two separate React dispatcher states, breaking hooks at runtime.
const singletonModules = {
  react: path.resolve(workspaceRoot, 'node_modules/react/index.js'),
  'react/jsx-runtime': path.resolve(workspaceRoot, 'node_modules/react/jsx-runtime.js'),
  'react/jsx-dev-runtime': path.resolve(workspaceRoot, 'node_modules/react/jsx-dev-runtime.js'),
  'react/compiler-runtime': path.resolve(workspaceRoot, 'node_modules/react/compiler-runtime.js'),
  'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom/index.js'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native/index.js'),
  'react-native-renderer': path.resolve(workspaceRoot, 'node_modules/react-native-renderer/index.js'),
  'scheduler': path.resolve(workspaceRoot, 'node_modules/scheduler/index.js'),
};

const existingResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (Object.prototype.hasOwnProperty.call(singletonModules, moduleName)) {
    return { type: 'sourceFile', filePath: singletonModules[moduleName] };
  }
  if (existingResolveRequest) {
    return existingResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Expo sets unstable_serverRoot to the monorepo workspace root (E:\a) so that
// Metro can serve web assets from the workspace root. For Android builds,
// Gradle passes --entry-file index.js (relative), which Metro resolves relative
// to unstable_serverRoot. Overriding it to projectRoot makes ./index.js resolve
// to apps/mobile/index.js instead of E:\a\index.js (which doesn't exist).
config.server = {
  ...config.server,
  unstable_serverRoot: projectRoot,
};

module.exports = config;
