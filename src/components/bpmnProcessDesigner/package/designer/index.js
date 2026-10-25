// bpmn-js 样式随设计器、查看器按需加载（原在 main.js 全局引入）
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import MyProcessDesigner from './ProcessDesigner.vue'

MyProcessDesigner.install = function(Vue) {
  Vue.component(MyProcessDesigner.name, MyProcessDesigner)
}

// 流程图的设计器，可编辑
export default MyProcessDesigner
