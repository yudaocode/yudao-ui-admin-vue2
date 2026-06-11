<template>
  <div v-loading="loading" class="process-viewer">
    <my-process-viewer v-if="bpmnXML" key="detail-bpmn-viewer" v-model="bpmnXML" :prefix="'flowable'" />
    <el-empty v-else description="暂无 BPMN 流程图" />
  </div>
</template>

<script>
export default {
  name: 'ProcessInstanceBpmnViewer',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    modelView: {
      type: [Object, String],
      default: undefined
    }
  },
  computed: {
    bpmnXML: {
      get() {
        if (typeof this.modelView === 'string') {
          return this.modelView
        }
        return this.modelView && (this.modelView.bpmnXml || this.modelView.bpmnXML || this.modelView.xml)
      },
      set() {}
    }
  }
}
</script>

<style scoped>
.process-viewer {
  min-height: 560px;
}

.my-process-designer {
  height: 560px;
}
</style>
