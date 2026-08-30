<template>
  <div v-loading="loading" class="process-viewer">
    <my-process-viewer
      v-if="bpmnXML"
      key="detail-bpmn-viewer"
      v-model="bpmnXML"
      :prefix="'flowable'"
      :activity-data="activityData"
      :process-instance-data="processInstanceData"
      :task-data="taskData"
    />
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
    },
    // Vue3 的 MyProcessViewer 会直接消费实例视图；Vue2 旧 viewer 使用
    // activityData/processInstanceData/taskData 三个字段，因此在边界层做一次
    // 兼容映射，保留空数组以便定义预览和历史脏数据仍可正常渲染。
    activityNodes: {
      type: Array,
      default: () => []
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
    bpmnXML: {
      get() {
        if (typeof this.modelView === 'string') {
          return this.modelView
        }
        return this.modelView && (this.modelView.bpmnXml || this.modelView.bpmnXML || this.modelView.xml)
      },
      set() {}
    },
    activityData() {
      const nodes = Array.isArray(this.activityNodes) ? this.activityNodes : []
      const result = []
      const seen = new Set()
      const taskByActivityId = new Map()
      nodes.forEach((node) => {
        if (!node || node.id === undefined || node.id === null) {
          return
        }
        const nodeTasks = Array.isArray(node.tasks) ? node.tasks : []
        // 对同一节点的并行/会签任务，优先使用进行中的任务作为旧 viewer
        // 的 taskId；旧组件本身按 key 查找单个 activity，无法同时呈现多个
        // task，但至少不会把已结束任务覆盖掉当前待办状态。
        const task = nodeTasks.find((item) => Number(item && item.status) === 1) || nodeTasks[0]
        if (task) {
          taskByActivityId.set(String(node.id), task)
        }
        result.push({
          key: String(node.id),
          taskId: task && task.id,
          startTime: node.startTime || (task && task.createTime),
          endTime: node.endTime || (task && task.endTime),
          type: this.getActivityType(node)
        })
        seen.add(String(node.id))
      })

      // 审批详情接口可能省略网关/连线节点，实例视图接口仍会返回进度集合；
      // 将集合补成最小 activity 记录，让旧 viewer 至少能高亮这些元素。
      const view = this.modelView && typeof this.modelView === 'object' ? this.modelView : {}
      const viewTasks = Array.isArray(this.tasks) && this.tasks.length
        ? this.tasks
        : (Array.isArray(view.tasks) ? view.tasks : [])
      viewTasks.forEach((task) => {
        if (task && task.taskDefinitionKey && !taskByActivityId.has(String(task.taskDefinitionKey))) {
          taskByActivityId.set(String(task.taskDefinitionKey), task)
        }
      })
      const appendIds = (ids, endTime, type) => {
        if (!ids) return
        const values = Array.isArray(ids)
          ? ids
          : ids instanceof Set
            ? Array.from(ids)
            : [ids]
        values.forEach((id) => {
          const key = String(id)
          if (seen.has(key)) return
          const task = taskByActivityId.get(key)
          result.push({
            key,
            taskId: task && task.id,
            startTime: task && task.createTime ? task.createTime : (endTime ? undefined : true),
            endTime: task && task.endTime ? task.endTime : endTime,
            type
          })
          seen.add(key)
        })
      }
      appendIds(view.unfinishedTaskActivityIds, undefined, 'userTask')
      appendIds(view.finishedTaskActivityIds, true, 'gateway')
      appendIds(view.finishedSequenceFlowActivityIds, true, 'sequenceFlow')
      appendIds(view.rejectedTaskActivityIds, true, 'userTask')
      return result
    },
    taskData() {
      const sourceTasks = Array.isArray(this.tasks) && this.tasks.length
        ? this.tasks
        : (this.modelView && typeof this.modelView === 'object' && Array.isArray(this.modelView.tasks)
          ? this.modelView.tasks
          : [])
      return sourceTasks.map((task) => ({
        ...task,
        // 旧 viewer 使用 result，当前后端统一返回 status。
        result: task && task.result !== undefined
          ? task.result
          : this.toViewerResult(task && task.status)
      }))
    },
    processInstanceData() {
      const source = this.processInstance && Object.keys(this.processInstance).length
        ? this.processInstance
        : (this.modelView && typeof this.modelView === 'object' ? this.modelView.processInstance : {})
      // Keep the legacy viewer's falsy guard effective when a historical or
      // definition-only payload has no instance metadata.  Passing `{}`
      // would be truthy and its start-event hover handler expects startUser.
      if (!source) return undefined
      return {
        ...source,
        result: source.result !== undefined ? source.result : this.toViewerResult(source.status)
      }
    }
  },
  methods: {
    toViewerResult(status) {
      const value = Number(status)
      // 旧 BPMN viewer 的结果枚举：1 处理中、2 通过、3 拒绝、4 取消、5 退回。
      if (value === 0 || value === 1 || value === 6 || value === 7) return 1
      if ([2, 3, 4, 5].includes(value)) return value
      return undefined
    },
    getActivityType(node) {
      const type = Number(node && node.nodeType)
      // NodeType 常量：结束=1、发起人=10、审批=11、抄送=12、办理=13、
      // 子流程=20、条件/分支=50~54；未知节点交给 viewer 的通用高亮逻辑。
      if (type === 1) return 'endEvent'
      if (type >= 50) return 'gateway'
      if (type === 20) return 'callActivity'
      if ([10, 11, 12, 13, 14, 15].includes(type)) return 'userTask'
      return undefined
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
