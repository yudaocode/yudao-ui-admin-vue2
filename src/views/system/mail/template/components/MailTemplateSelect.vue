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
import { getSimpleMailTemplateList } from '@/api/system/mail/template'

export default {
  name: 'MailTemplateSelect',
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
      default: '请选择邮件模板'
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
        const response = await getSimpleMailTemplateList()
        this.templateList = response.data || []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
