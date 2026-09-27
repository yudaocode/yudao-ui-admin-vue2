// Vue 2 使用 webpack require.context 注册装修组件与属性面板。
const configModules = require.context('./', true, /\.\/[^/]+\/config\.js$/)
const viewModules = require.context('./', true, /\.\/[^/]+\/(index|property)\.vue$/)

const components = {}
const componentConfigs = {}

configModules.keys().forEach((configPath) => {
  const configModule = configModules(configPath)
  const component = configModule.component
  if (!component || !component.id) return

  componentConfigs[component.id] = component
  const basePath = configPath.replace(/config\.js$/, '')
  const indexPath = `${basePath}index.vue`
  const propertyPath = `${basePath}property.vue`
  if (viewModules.keys().includes(indexPath)) {
    const viewModule = viewModules(indexPath)
    components[component.id] = viewModule.default || viewModule
  }
  if (viewModules.keys().includes(propertyPath)) {
    const propertyModule = viewModules(propertyPath)
    components[`${component.id}Property`] = propertyModule.default || propertyModule
  }
})

export { components, componentConfigs }
