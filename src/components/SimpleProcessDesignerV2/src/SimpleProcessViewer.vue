<template>
  <SimpleProcessModel :flow-node="simpleModel" :readonly="true" />
</template>

<script setup>
import { ref, watch, provide } from 'vue'
import SimpleProcessModel from './SimpleProcessModel.vue'
import { useWatchNode } from './node'


const props = defineProps({
  flowNode: {
    type: Object,
    required: true
  },
  // 流程任务
  tasks: {
    type: Array,
    default: () => []
  },
  // 流程实例
  processInstance: {
    type: Object,
    default: () => undefined
  }
})
const approveTasks = ref(props.tasks)
const currentProcessInstance = ref(props.processInstance)
const simpleModel = useWatchNode(props)
watch(
  () => props.tasks,
  (newValue) => {
    approveTasks.value = newValue
  }
)
watch(
  () => props.processInstance,
  (newValue) => {
    currentProcessInstance.value = newValue
  }
)

provide('tasks', approveTasks)
provide('processInstance', currentProcessInstance)
</script>
