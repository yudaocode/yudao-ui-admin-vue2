<template>
  <el-select
    :value="modelValue"
    clearable
    filterable
    :loading="loading"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', $event)"
    @blur="$emit('blur', $event)"
    @keyup.esc.native.capture.stop="$emit('keyup', $event)"
  >
    <el-option
      v-for="workItem in workItemList"
      :key="workItem.id"
      :label="`#${workItem.serialNumber} ${workItem.name}`"
      :value="workItem.id"
    />
  </el-select>
</template>

<script>
import * as WorkItemApi from '@/api/pms/pm/workitem'
import { getAllPageItems } from '@/utils/page'

export default {
  name: 'PmsWorkItemSelect',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Number, default: undefined },
    projectId: { type: Number, required: true },
    type: { type: Number, required: true },
    excludeId: { type: Number, default: undefined },
    placeholder: { type: String, default: '请选择工作项' }
  },
  data() {
    return { loading: false, workItemList: [] }
  },
  computed: {
    queryKey() {
      return [this.projectId, this.type, this.excludeId].join(':')
    }
  },
  watch: {
    queryKey: { immediate: true, handler: 'getWorkItemList' }
  },
  methods: {
    async getWorkItemList() {
      this.loading = true
      try {
        const list = await getAllPageItems((pageNo, pageSize) => WorkItemApi.getWorkItemPage({
          pageNo,
          pageSize,
          projectId: this.projectId,
          type: this.type
        }))
        this.workItemList = list.filter(workItem => workItem.id !== this.excludeId)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
