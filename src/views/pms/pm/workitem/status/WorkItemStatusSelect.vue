<template>
  <el-select
    :value="modelValue"
    :loading="loading"
    :placeholder="placeholder"
    @change="$emit('change', $event)"
    @input="$emit('update:modelValue', $event)"
    @blur="$emit('blur', $event)"
    @keyup.esc.native.capture.stop="$emit('keyup', $event)"
  >
    <el-option
      v-for="status in statusList"
      :key="status.id"
      :label="status.name"
      :value="status.id"
    />
  </el-select>
</template>

<script>
import * as WorkItemStatusApi from '@/api/pms/pm/workitem/status'

export default {
  name: 'PmsWorkItemStatusSelect',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Number, default: undefined },
    projectId: { type: Number, required: true },
    workItemType: { type: Number, required: true },
    placeholder: { type: String, default: '请选择状态' }
  },
  data() {
    return { loading: false, statusList: [] }
  },
  computed: {
    queryKey() {
      return `${this.projectId}:${this.workItemType}`
    }
  },
  watch: {
    queryKey: { immediate: true, handler: 'getWorkItemStatusList' }
  },
  methods: {
    async getWorkItemStatusList() {
      this.loading = true
      try {
        const response = await WorkItemStatusApi.getWorkItemStatusList(this.projectId, this.workItemType)
        this.statusList = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
