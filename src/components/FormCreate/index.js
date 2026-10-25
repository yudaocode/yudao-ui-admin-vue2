import { createApiSelect } from './src/components/useApiSelect'
import DictSelect from './src/components/DictSelect.vue'
import DeptSelect from './src/components/DeptSelect.vue'
import AreaSelect from './src/components/AreaSelect.vue'
import IframeComponent from './src/components/IframeComponent.vue'

export const UserSelect = createApiSelect({
  name: 'UserSelect',
  labelField: 'nickname',
  valueField: 'id',
  url: '/system/user/simple-list'
})

export const ApiSelect = createApiSelect({
  name: 'ApiSelect'
})

export const formCreateCustomComponents = [
  DictSelect,
  UserSelect,
  DeptSelect,
  ApiSelect,
  IframeComponent,
  AreaSelect
]

// 启动时全局注册的 form-create 组件，在使用表单的页面按需安装 form-create 时（见 ./setup.js）再注册到 form-create
export const formCreateComponents = []

export function registerFormCreateComponent(Vue, name, component) {
  Vue.component(name, component)
  formCreateComponents.push([name, component])
}

export function registerFormCreateCustomComponents(Vue) {
  formCreateCustomComponents.forEach((component) => {
    registerFormCreateComponent(Vue, component.name, component)
  })
}
