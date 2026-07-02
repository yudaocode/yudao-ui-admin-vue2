<template>
  <el-select
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    filterable
    clearable
    style="width: 100%"
    @input="handleChange"
  >
    <el-option
      v-for="template in templateList"
      :key="template.id"
      :label="template.name + '（' + template.code + '）'"
      :value="template.code"
    />
  </el-select>
</template>

<script>
import { getSimpleSmsTemplateList } from '@/api/system/sms/smsTemplate'

export default {
  name: 'SmsTemplateSelect',
  props: {
    value: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择短信模板'
    }
  },
  data() {
    return {
      loading: false,
      templateList: []
    }
  },
  created() {
    this.getTemplateList()
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)
    },
    async getTemplateList() {
      this.loading = true
      try {
        const response = await getSimpleSmsTemplateList()
        this.templateList = response.data || []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
