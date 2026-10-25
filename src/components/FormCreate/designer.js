import Vue from 'vue'
import { setupFormCreate } from './setup'
import FcDesigner from '@form-create/designer'

/**
 * 按需安装 form-create 表单设计器：仅在表单设计页面模块中调用
 */
export function setupFcDesigner() {
  setupFormCreate()
  Vue.use(FcDesigner)
}
