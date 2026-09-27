<template>
  <el-select
    :value="value"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :loading="loading"
    :placeholder="placeholder"
    @change="handleChange"
  >
    <el-option
      v-for="template in templates"
      :key="template.id"
      :value="template.id"
      :label="template.name"
    />
  </el-select>
</template>

<script>
import * as TemplateApi from '@/api/oa/officialdoc/template'

export default {
  name: 'OaOfficialDocTemplateSelect',
  props: {
    value: {
      type: Number,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请选择套红模板'
    }
  },
  data() {
    return {
      templates: [],
      loading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleChange(value) {
      this.$emit('input', typeof value === 'number' ? value : undefined)
      this.$emit('change', typeof value === 'number' ? value : undefined)
    },
    // 获得套红模板列表
    getList() {
      this.loading = true
      TemplateApi.getSimpleTemplateList().then(response => {
        this.templates = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
