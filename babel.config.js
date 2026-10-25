module.exports = {
  presets: [
    // https://github.com/vuejs/vue-cli/tree/master/packages/@vue/babel-preset-app
    '@vue/cli-plugin-babel/preset'
  ],
  // babel-plugin-dynamic-import-node plugin only does one thing by converting all import() to require().
  // This plugin can significantly increase the speed of hot updates, when you have a large number of pages.
  // 按 NODE_ENV 判断：--mode prod/stage 时 vue-cli 会把 BABEL_ENV 置为 development，env.development 会把生产构建的 import() 打回 require()
  'plugins': process.env.NODE_ENV === 'development' ? ['dynamic-import-node'] : []
}
