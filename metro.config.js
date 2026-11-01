const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Map @expo/vector-icons to our rock-solid AppIcon to guarantee 100% icon rendering on standalone Android APK
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@expo/vector-icons': path.resolve(__dirname, 'src/components/common/AppIcon.tsx'),
};

module.exports = config;
