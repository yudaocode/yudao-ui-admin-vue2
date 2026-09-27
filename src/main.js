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
import { getDictDataByType } from "@/api/system/dict/data";
import { getConfigKey } from "@/api/infra/config";
import { parseTime, resetForm, handleTree, addBeginAndEndTime, divide } from "@/utils/ruoyi";
import { isEmpty } from "@/utils";
import Pagination from "@/components/Pagination";
// 自定义表格工具扩展
import RightToolbar from "@/components/RightToolbar"
// JSON 编辑器组件
import JsonEditor from "@/components/JsonEditor"
// 代码高亮插件
// import hljs from 'highlight.js'
// import 'highlight.js/styles/github-gist.css'
import { DICT_TYPE, getDictDataLabel, getDictDatas, getDictDatas2 } from "@/utils/dict";

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getDictDataByType = getDictDataByType
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
Vue.component('JsonEditor', JsonEditor)
Vue.component('Backtop', Backtop)
Vue.component('Sticky', Sticky)
Vue.component('InputPassword', InputPassword)
Vue.component('OperateLogV2', OperateLogV2)
Vue.component('DeptSelectForm', DeptSelectForm)
Vue.component('ContentWrap', ContentWrap)
Vue.component('ContentDetailWrap', ContentDetailWrap)
Vue.component('Infotip', Infotip)
// 字典标签组件
import DictTag from '@/components/DictTag'
import DocAlert from '@/components/DocAlert'
import Backtop from '@/components/Backtop'
import Sticky from '@/components/Sticky'
import InputPassword from '@/components/InputPassword'
import OperateLogV2 from '@/components/OperateLogV2'
import DeptSelectForm from '@/components/DeptSelectForm'
import ContentWrap from '@/components/ContentWrap'
import ContentDetailWrap from '@/components/ContentDetailWrap'
import Infotip from '@/components/Infotip'
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
import UploadImg from '@/components/UploadImg'
import UploadImgs from '@/components/UploadImgs'
import FileUpload from '@/components/FileUpload'
import UploadFile from '@/components/UploadFile'
import Editor from '@/components/Editor'
import { setupWangEditorPlugin } from '@/views/bpm/model/form/PrintTemplate/setup'
import {
  registerFormCreateComponent,
  registerFormCreateCustomComponents
} from '@/components/FormCreate'

setupWangEditorPlugin()

const formCreateComponents = [
  ['ImageUpload', ImageUpload],
  ['imageUpload', ImageUpload],
  ['UploadImg', UploadImg],
  ['uploadImg', UploadImg],
  ['ImagesUpload', ImageUpload],
  ['imagesUpload', ImageUpload],
  ['UploadImgs', UploadImgs],
  ['uploadImgs', UploadImgs],
  ['FileUpload', FileUpload],
  ['fileUpload', FileUpload],
  ['UploadFile', UploadFile],
  ['uploadFile', UploadFile],
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
