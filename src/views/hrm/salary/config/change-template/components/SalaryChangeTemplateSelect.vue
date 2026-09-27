<template>
  <el-select
    :value="value"
    :clearable="clearable"
    :disabled="disabled"
    :loading="loading"
    :placeholder="placeholder"
    class="full-width"
    filterable
    @input="handleChange"
  >
    <el-option
      v-for="template in templateList"
      :key="template.id"
      :label="template.name"
      :value="template.id"
    >
      <span>{{ template.name }}</span>
      <el-tag
        v-if="template.defaultStatus"
        type="success"
        size="mini"
        class="default-tag"
      >默认</el-tag>
    </el-option>
  </el-select>
</template>

<script>
import { getSalaryChangeTemplateList } from '@/api/hrm/salary/config/change-template'

export default {
  name: 'HrmSalaryChangeTemplateSelect',
  props: {
    value: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '全部薪资项' }
  },
  data() { return { loading: false, templateList: [] } },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    async init() {
      if (this.templateList.length === 0) {
        this.loading = true
        try {
          const response = await getSalaryChangeTemplateList()
          this.templateList = response.data
        } finally {
          this.loading = false
        }
      }
      return this.templateList
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.default-tag { margin-left: 8px; }
</style>
