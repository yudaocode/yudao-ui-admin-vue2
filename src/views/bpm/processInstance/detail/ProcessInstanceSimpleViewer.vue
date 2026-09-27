<template>
  <div v-loading="loading" class="process-viewer">
    <SimpleProcessViewer
      v-if="simpleModel"
      :flow-node="simpleModel"
      :tasks="renderTasks"
      :process-instance="renderProcessInstance"
    />
    <el-empty v-else description="暂无仿真流程图" />
  </div>
</template>

<script>
import { TaskStatusEnum } from '@/api/bpm/task'
import { NodeType } from '@/components/SimpleProcessDesignerV2/src/consts'
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
    // Vue3 also accepts the serialized simple model directly. Keep this
    // public prop so callers do not need to manufacture a modelView wrapper.
    simpleJson: {
      type: String,
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
  data() {
    return {
      simpleModel: null,
      renderTasks: [],
      renderProcessInstance: undefined
    }
  },
  watch: {
    modelView: {
      immediate: true,
      handler(value) {
        this.updateModelView(value)
      }
    },
    simpleJson: {
      immediate: true,
      handler(value) {
        // `simpleJson` is optional. When callers use the Vue2 `modelView`
        // contract, an undefined prop must not clear the model initialized by
        // the modelView watcher; only an explicitly empty value means clear.
        if (value === undefined) {
          return
        }
        if (!value) {
          this.simpleModel = null
          this.renderTasks = this.toTaskArray(this.tasks)
          this.renderProcessInstance = this.processInstance
          return
        }
        try {
          const parsed = JSON.parse(value)
          const base = this.modelView && typeof this.modelView === 'object'
            ? { ...this.modelView, simpleModel: parsed }
            : { simpleModel: parsed }
          this.updateModelView(base)
        } catch (e) {
          this.simpleModel = null
        }
      }
    },
    tasks(value) {
      this.renderTasks = this.toTaskArray(value)
    },
    processInstance(value) {
      this.renderProcessInstance = value
    }
  },
  methods: {
    toIdArray(value) {
      if (Array.isArray(value)) return value.slice()
      if (value == null || typeof value === 'string') return value == null ? [] : [value]
      try {
        if (typeof Symbol !== 'undefined' && Symbol.iterator && typeof value[Symbol.iterator] === 'function') {
          return Array.from(value)
        }
      } catch (e) {
        return []
      }
      return [value]
    },
    updateModelView(view) {
      if (!view) {
        this.simpleModel = null
        this.renderTasks = this.toTaskArray(this.tasks)
        this.renderProcessInstance = this.processInstance
        return
      }
      let viewData = view
      if (typeof viewData === 'string') {
        try {
          viewData = JSON.parse(viewData)
        } catch (e) {
          this.simpleModel = null
          return
        }
      }
      const sourceModel = viewData && (viewData.simpleModel || viewData.model || viewData)
      let data = sourceModel
      if (typeof sourceModel === 'string') {
        try {
          data = JSON.parse(sourceModel)
        } catch (e) {
          this.simpleModel = null
          return
        }
      } else {
        data = sourceModel
      }
      if (!data || typeof data !== 'object') {
        this.simpleModel = null
        return
      }

      // Keep the model-view payload immutable. The viewer annotates nodes with
      // activityStatus, so mutating the API response directly can leak stale
      // status into a later refresh.
      const model = this.clone(data)
      this.setSimpleModelNodeTaskStatus(
        model,
        viewData.processInstance && viewData.processInstance.status,
        this.toIdArray(viewData.rejectedTaskActivityIds),
        this.toIdArray(viewData.unfinishedTaskActivityIds),
        this.toIdArray(viewData.finishedTaskActivityIds || viewData.finishedActivityIds),
        this.toIdArray(viewData.finishedSequenceFlowActivityIds)
      )
      this.simpleModel = model
      this.renderTasks = this.toTaskArray(this.tasks && this.tasks.length ? this.tasks : viewData.tasks)
      this.renderProcessInstance = this.processInstance || viewData.processInstance
    },
    clone(value) {
      if (Array.isArray(value)) {
        return value.map((item) => this.clone(item))
      }
      if (value && typeof value === 'object') {
        const result = {}
        Object.keys(value).forEach((key) => {
          result[key] = this.clone(value[key])
        })
        return result
      }
      return value
    },
    toTaskArray(value) {
      if (Array.isArray(value)) return value.slice()
      if (value == null || typeof value === 'string') return []
      try {
        if (typeof Symbol !== 'undefined' && Symbol.iterator && typeof value[Symbol.iterator] === 'function') {
          return Array.from(value)
        }
      } catch (e) {
        return []
      }
      return []
    },
    setSimpleModelNodeTaskStatus(
      node,
      processStatus,
      rejectedTaskActivityIds,
      unfinishedTaskActivityIds,
      finishedActivityIds,
      finishedSequenceFlowActivityIds
    ) {
      if (!node) {
        return
      }
      const includes = (list, id) => Array.isArray(list) && list.some((item) => String(item) === String(id))
      if (node.type === NodeType.END_EVENT_NODE) {
        node.activityStatus = includes(finishedActivityIds, node.id)
          ? processStatus
          : TaskStatusEnum.NOT_START
      } else if (
        node.type === NodeType.START_USER_NODE ||
        node.type === NodeType.USER_TASK_NODE ||
        node.type === NodeType.TRANSACTOR_NODE ||
        node.type === NodeType.CHILD_PROCESS_NODE
      ) {
        node.activityStatus = TaskStatusEnum.NOT_START
        if (includes(rejectedTaskActivityIds, node.id)) {
          node.activityStatus = TaskStatusEnum.REJECT
        } else if (includes(unfinishedTaskActivityIds, node.id)) {
          node.activityStatus = TaskStatusEnum.RUNNING
        } else if (includes(finishedActivityIds, node.id)) {
          node.activityStatus = TaskStatusEnum.APPROVE
        }
      } else if (node.type === NodeType.COPY_TASK_NODE || node.type === NodeType.DELAY_TIMER_NODE || node.type === NodeType.TRIGGER_NODE) {
        node.activityStatus = includes(finishedActivityIds, node.id)
          ? TaskStatusEnum.APPROVE
          : TaskStatusEnum.NOT_START
      } else if (node.type === NodeType.CONDITION_NODE) {
        node.activityStatus = includes(finishedSequenceFlowActivityIds, node.id)
          ? TaskStatusEnum.APPROVE
          : TaskStatusEnum.NOT_START
      } else if (
        node.type === NodeType.CONDITION_BRANCH_NODE ||
        node.type === NodeType.PARALLEL_BRANCH_NODE ||
        node.type === NodeType.INCLUSIVE_BRANCH_NODE ||
        node.type === NodeType.ROUTER_BRANCH_NODE
      ) {
        node.activityStatus = includes(finishedActivityIds, node.id)
          ? TaskStatusEnum.APPROVE
          : TaskStatusEnum.NOT_START
      }
      if (Array.isArray(node.conditionNodes)) {
        node.conditionNodes.forEach((child) => this.setSimpleModelNodeTaskStatus(
          child,
          processStatus,
          rejectedTaskActivityIds,
          unfinishedTaskActivityIds,
          finishedActivityIds,
          finishedSequenceFlowActivityIds
        ))
      }
      this.setSimpleModelNodeTaskStatus(
        node.childNode,
        processStatus,
        rejectedTaskActivityIds,
        unfinishedTaskActivityIds,
        finishedActivityIds,
        finishedSequenceFlowActivityIds
      )
    }
  }
}
</script>

<style scoped>
.process-viewer {
  min-height: 560px;
}
</style>
