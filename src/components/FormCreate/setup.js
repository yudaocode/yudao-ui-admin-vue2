import Vue from 'vue'
import formCreate from '@form-create/element-ui'
// 表单设计器提供的签名、表格表单等组件（FcEditor、FcTitle、SignaturePad、TableForm、FcTable），渲染设计器生成的表单需要，无需加载整个设计器
import '@form-create/designer/dist/components.es.js'
import Editor from '@/components/Editor'
import { formCreateComponents } from './index'

let installed = false

/**
 * 按需安装 form-create：在使用 form-create 的页面模块中调用，保证渲染表单前已注册
 *
 * 注意：不在 main.js 启动时安装，避免 form-create 进入登录、普通列表等首屏
 */
export function setupFormCreate() {
  if (installed) {
    return
  }
  installed = true
  formCreateComponents.forEach(([name, component]) => {
    formCreate.component(name, component)
  })
  // 富文本在 main.js 中注册为异步全局组件，form-create 中仍使用同步组件
  formCreate.component('Editor', Editor)
  // 小写 editor 为历史兼容名，保留
  // eslint-disable-next-line vue/component-definition-name-casing
  formCreate.component('editor', Editor)
  Vue.use(formCreate)
}
