/* eslint-env node */
/* global module */
module.exports = function babelConfig(api) {
  api.cache(true);
  return {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript']
  };
};
