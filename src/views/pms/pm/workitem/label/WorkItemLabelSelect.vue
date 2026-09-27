<template>
  <el-select :value="modelValue" clearable collapse-tags filterable :loading="loading" multiple
    :placeholder="placeholder" @input="$emit('update:modelValue', $event)">
    <el-option v-for="label in labelList" :key="label.id" :label="label.name" :value="label.id" />
  </el-select>
</template>

<script>
import * as WorkItemLabelApi from '@/api/pms/pm/workitem/label'

export default {
  name: 'PmsWorkItemLabelSelect',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Array, default: undefined },
    placeholder: { type: String, default: '请选择标签' }
  },
  data() {
    return { loading: false, labelList: [] }
  },
  mounted() {
    this.getWorkItemLabelList()
  },
  methods: {
    async getWorkItemLabelList() {
      this.loading = true
      try {
        const response = await WorkItemLabelApi.getWorkItemLabelList()
        this.labelList = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
