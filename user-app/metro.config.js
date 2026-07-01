const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

try {
  const { withNativeWind } = require("nativewind/metro");
  module.exports = withNativeWind(config, { 
    input: "./global.css",
    configPath: "./tailwind.config.cjs"
  });
} catch (e) {
  console.error("NATIVEWIND STILL CRASHING:", e.stack || e);
  module.exports = config;
}
