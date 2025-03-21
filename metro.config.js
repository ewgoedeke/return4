// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require("path");

// Get the default Metro configuration
const config = getDefaultConfig(__dirname);

// Ensure the resolver is defined
config.resolver = config.resolver || {};
config.resolver.assetExts = config.resolver.assetExts || [];

// Add .tflite to the supported asset extensions
if (!config.resolver.assetExts.includes("tflite")) {
  config.resolver.assetExts.push("tflite");
}

// Export the modified config with NativeWind support
module.exports = withNativeWind(config, { input: './global.css' });
