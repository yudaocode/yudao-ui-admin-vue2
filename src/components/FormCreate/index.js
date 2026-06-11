import formCreate from '@form-create/element-ui'
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

export function registerFormCreateComponent(Vue, name, component) {
  Vue.component(name, component)
  formCreate.component(name, component)
}

export function registerFormCreateCustomComponents(Vue) {
  formCreateCustomComponents.forEach((component) => {
    registerFormCreateComponent(Vue, component.name, component)
  })
}
