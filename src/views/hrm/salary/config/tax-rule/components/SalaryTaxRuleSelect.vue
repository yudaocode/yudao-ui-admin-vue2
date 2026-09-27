<template>
  <el-select
    :value="value"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :loading="loading"
    :placeholder="placeholder"
    class="full-width"
    @input="handleChange"
  >
    <el-option
      v-for="taxRule in taxRuleOptions"
      :key="taxRule.id"
      :label="taxRule.name"
      :value="taxRule.id"
    />
  </el-select>
</template>

<script>
import { getSalaryTaxRuleList } from '@/api/hrm/salary/config/tax-rule'

export default {
  name: 'HrmSalaryTaxRuleSelect',
  props: {
    value: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择计税规则' }
  },
  data() {
    return {
      loading: false,
      taxRuleOptions: []
    }
  },
  created() {
    this.getTaxRuleList()
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
      this.$emit('change', this.taxRuleOptions.find(taxRule => taxRule.id === value))
    },
    async getTaxRuleList() {
      this.loading = true
      try {
        const response = await getSalaryTaxRuleList()
        this.taxRuleOptions = response.data.filter(taxRule => taxRule.id !== undefined)
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
