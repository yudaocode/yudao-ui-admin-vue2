// bpmn-js 样式随设计器、查看器按需加载（原在 main.js 全局引入）
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import MyProcessViewer from './ProcessViewer.vue'

MyProcessViewer.install = function(Vue) {
  Vue.component(MyProcessViewer.name, MyProcessViewer)
}

// 流程图的查看器，不可编辑
export default MyProcessViewer
