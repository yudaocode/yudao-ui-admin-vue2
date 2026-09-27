<template>
  <el-select
    :value="selectedCodes"
    :disabled="disabled"
    :loading="loading"
    :placeholder="placeholder"
    class="full-width"
    filterable
    multiple
    @input="handleInput"
  >
    <el-option
      v-for="option in optionList"
      :key="option.code"
      :label="option.name + ' / ' + option.code"
      :value="option.code"
    />
  </el-select>
</template>

<script>
import { getSalaryOptionSimpleList } from '@/api/hrm/salary/config/option'

export default {
  name: 'HrmSalaryChangeOptionSelect',
  props: {
    value: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '请选择调薪项' }
  },
  data() {
    return {
      loading: false,
      optionList: []
    }
  },
  computed: {
    selectedCodes() {
      return this.value.map(option => option.code)
    }
  },
  methods: {
    handleInput(codes) {
      const options = codes.map(code => {
        const selectedOption = this.value.find(option => option.code === code)
        const option = this.optionList.find(item => item.code === code)
        return {
          code,
          name: (option && option.name) || (selectedOption && selectedOption.name) || ''
        }
      })
      this.$emit('input', options)
      this.$emit('update:modelValue', options)
    },
    async init(selectAll) {
      if (this.optionList.length === 0) {
        this.loading = true
        try {
          const response = await getSalaryOptionSimpleList(true)
          this.optionList = response.data
        } finally {
          this.loading = false
        }
      }
      if (selectAll) {
        this.handleInput(this.optionList.map(option => option.code))
      }
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
