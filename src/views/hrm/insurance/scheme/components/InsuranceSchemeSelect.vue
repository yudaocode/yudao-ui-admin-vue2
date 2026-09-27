<template>
  <el-select
    :value="value"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :loading="loading"
    :placeholder="placeholder"
    class="full-width"
    @input="$emit('input', $event)"
    @change="handleChange"
  >
    <el-option
      v-for="scheme in schemeList"
      :key="scheme.id"
      :label="scheme.name"
      :value="scheme.id"
    />
  </el-select>
</template>

<script>
import { getInsuranceSchemeSimpleList } from '@/api/hrm/insurance/scheme'

export default {
  name: 'HrmInsuranceSchemeSelect',
  props: {
    value: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择参保方案' }
  },
  data() { return { loading: false, schemeList: [] } },
  created() { this.getSchemeList() },
  methods: {
    handleChange(value) { this.$emit('change', this.schemeList.find(scheme => scheme.id === value)) },
    async getSchemeList() {
      this.loading = true
      try {
        const response = await getInsuranceSchemeSimpleList()
        this.schemeList = response.data.filter(scheme => scheme.id !== undefined)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
