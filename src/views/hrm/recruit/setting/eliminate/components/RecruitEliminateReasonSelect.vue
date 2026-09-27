<template>
  <el-select
    :value="value"
    :allow-create="allowCreate"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :loading="loading"
    :placeholder="placeholder"
    class="full-width"
    default-first-option
    @input="$emit('input', $event)"
    @change="handleChange"
  >
    <el-option
      v-for="reason in reasonList"
      :key="reason"
      :label="reason"
      :value="reason"
    />
  </el-select>
</template>

<script>
import { getRecruitEliminateReasonList } from '@/api/hrm/recruit/config'

export default {
  name: 'HrmRecruitEliminateReasonSelect',
  props: {
    value: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    allowCreate: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择或输入淘汰原因' }
  },
  data() {
    return { loading: false, reasonList: [] }
  },
  created() { this.getReasonList() },
  methods: {
    handleChange(value) { this.$emit('change', value) },
    async getReasonList() {
      this.loading = true
      try {
        const response = await getRecruitEliminateReasonList()
        this.reasonList = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
