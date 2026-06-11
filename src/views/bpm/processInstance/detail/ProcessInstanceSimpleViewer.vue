<template>
  <div v-loading="loading" class="process-viewer">
    <SimpleProcessViewer
      v-if="simpleModel"
      :flow-node="simpleModel"
      :tasks="tasks"
      :process-instance="processInstance"
    />
    <el-empty v-else description="暂无仿真流程图" />
  </div>
</template>

<script>
import { SimpleProcessViewer } from '@/components/SimpleProcessDesignerV2/src'

export default {
  name: 'ProcessInstanceSimpleViewer',
  components: {
    SimpleProcessViewer
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    modelView: {
      type: [Object, String],
      default: undefined
    },
    tasks: {
      type: Array,
      default: () => []
    },
    processInstance: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    simpleModel() {
      const view = this.modelView
      if (!view) {
        return null
      }
      const data = typeof view === 'string' ? view : (view.simpleModel || view.model || view)
      if (!data) {
        return null
      }
      if (typeof data === 'string') {
        try {
          return JSON.parse(data)
        } catch (e) {
          return null
        }
      }
      return data
    }
  }
}
</script>

<style scoped>
.process-viewer {
  min-height: 560px;
}
</style>
