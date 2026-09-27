<template>
  <el-select
    v-model="selectedCodes"
    :loading="loading"
    :placeholder="placeholder"
    class="full-width"
    filterable
    multiple
  >
    <el-option
      v-for="option in selectableOptionList"
      :key="option.code"
      :disabled="disabledCodes.includes(option.code)"
      :label="option.name + ' / ' + option.code"
      :value="option.code"
    />
  </el-select>
</template>

<script>
import { getSalaryOptionSimpleList } from '@/api/hrm/salary/config/option'
import { HrmSalaryOptionCategoryCode } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmSalaryOptionSelect',
  props: {
    value: { type: Array, default: () => [] },
    disabledCodes: { type: Array, default: () => [] },
    adjustable: { type: Boolean, default: undefined },
    placeholder: { type: String, default: '请选择薪资项' }
  },
  data() { return { loading: false, optionList: [] } },
  computed: {
    selectableOptionList() {
      return this.optionList.filter(option => option.parentCode !== HrmSalaryOptionCategoryCode.ROOT)
    },
    selectedCodes: {
      get() { return this.value },
      set(value) {
        this.$emit('input', value)
        this.$emit('update:modelValue', value)
        this.$emit('change', value)
      }
    }
  },
  methods: {
    async init() {
      if (this.optionList.length === 0) {
        this.loading = true
        try {
          const response = await getSalaryOptionSimpleList(this.adjustable)
          this.optionList = response.data
        } finally {
          this.loading = false
        }
      }
      return this.optionList
    }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
