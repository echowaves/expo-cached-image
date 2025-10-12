/**
 * Metro configuration for expo-masonry-layout
 * https://facebook.github.io/metro/docs/configuration
 */

/* eslint-env node */
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true
      }
    })
  },
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json'],
    sourceExts: ['js', 'json', 'ts', 'tsx']
  }
}
