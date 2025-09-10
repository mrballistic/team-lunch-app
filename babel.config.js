module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: '18' } }],
    ['@babel/preset-react', { runtime: 'automatic', importSource: 'react' }],
    '@babel/preset-typescript'
  ]
};
