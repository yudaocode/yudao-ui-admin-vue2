import Vue from 'vue'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css
import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import plugins from './plugins' // plugins

import './assets/icons' // icon
import './permission' // permission control
import './tongji' // 百度统计
import { getDicts } from "@/api/system/dict/data";
import { getConfigKey } from "@/api/infra/config";
import { parseTime, resetForm, handleTree, addBeginAndEndTime, divide } from "@/utils/ruoyi";
import { isEmpty } from "@/utils";
import Pagination from "@/components/Pagination";
// 自定义表格工具扩展
import RightToolbar from "@/components/RightToolbar"
// 代码高亮插件
// import hljs from 'highlight.js'
// import 'highlight.js/styles/github-gist.css'
import { DICT_TYPE, getDictDataLabel, getDictDatas, getDictDatas2 } from "@/utils/dict";

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.getDictDatas = getDictDatas
Vue.prototype.getDictDatas2 = getDictDatas2
Vue.prototype.getDictDataLabel = getDictDataLabel
Vue.prototype.DICT_TYPE = DICT_TYPE
Vue.prototype.handleTree = handleTree
Vue.prototype.addBeginAndEndTime = addBeginAndEndTime
Vue.prototype.divide = divide
Vue.prototype.isEmpty = isEmpty

// 全局组件挂载
Vue.component('DictTag', DictTag)
Vue.component('DocAlert', DocAlert)
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
// 字典标签组件
import DictTag from '@/components/DictTag'
import DocAlert from '@/components/DocAlert'
// 头部标签插件
import VueMeta from 'vue-meta'

Vue.use(directive)
Vue.use(plugins)
Vue.use(VueMeta)
// Vue.use(hljs.vuePlugin);

// bpmnProcessDesigner 需要引入
import MyPD from "@/components/bpmnProcessDesigner/package/index.js";

Vue.use(MyPD);
import "@/components/bpmnProcessDesigner/package/theme/index.scss";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

// TODO【BPM 迁移清理】Form Generator 组件需要使用到 tinymce；待 bpm/model、processInstance 等页面
//   全部迁移到 form-create 后，可连同 components/tinymce 一起删除（详见 BPM_MIGRATION_PLAN.md 阶段3备注）
// Form Generator 组件需要使用到 tinymce
import Tinymce from '@/components/tinymce/index.vue'

Vue.component('tinymce', Tinymce)
import '@/assets/icons'
import request from "@/utils/request" // 实现 form generator 使用自己定义的 axios request 对象
console.log(request)
Vue.prototype.$axios = request
import '@/styles/index.scss'

// 默认点击背景不关闭弹窗
import ElementUI from 'element-ui'

ElementUI.Dialog.props.closeOnClickModal.default = false

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: localStorage.getItem("size") || "medium", // set element-ui default size
});

Vue.config.productionTip = false

// form-create 表单设计器（Vue2 + Element UI 版本）
import formCreate from '@form-create/element-ui'
import FcDesigner from '@form-create/designer'
import ImageUpload from '@/components/ImageUpload'
import FileUpload from '@/components/FileUpload'
import Editor from '@/components/Editor'
import {
  registerFormCreateComponent,
  registerFormCreateCustomComponents
} from '@/components/FormCreate'

const formCreateComponents = [
  ['ImageUpload', ImageUpload],
  ['imageUpload', ImageUpload],
  ['UploadImg', ImageUpload],
  ['uploadImg', ImageUpload],
  ['ImagesUpload', ImageUpload],
  ['imagesUpload', ImageUpload],
  ['UploadImgs', ImageUpload],
  ['uploadImgs', ImageUpload],
  ['FileUpload', FileUpload],
  ['fileUpload', FileUpload],
  ['UploadFile', FileUpload],
  ['uploadFile', FileUpload],
  ['Editor', Editor],
  ['editor', Editor]
]
registerFormCreateCustomComponents(Vue)
formCreateComponents.forEach(([name, component]) => {
  registerFormCreateComponent(Vue, name, component)
})
const formCreateComponentAliases = [
  ['dictSelect', Vue.options.components.DictSelect],
  ['userSelect', Vue.options.components.UserSelect],
  ['deptSelect', Vue.options.components.DeptSelect],
  ['apiSelect', Vue.options.components.ApiSelect],
  ['iframeComponent', Vue.options.components.IframeComponent],
  ['areaSelect', Vue.options.components.AreaSelect]
]
formCreateComponentAliases.forEach(([name, component]) => {
  registerFormCreateComponent(Vue, name, component)
})
Vue.use(formCreate)
Vue.use(FcDesigner)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
