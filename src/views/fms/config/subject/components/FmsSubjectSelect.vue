<template>
  <el-select
    :value="selectedValue"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :loading="loading"
    :placeholder="placeholder"
    @input="handleInput"
  >
    <el-option v-for="subject in subjectOptions" :key="subject.id" :label="formatSubject(subject)" :value="subject.id" />
  </el-select>
</template>

<script>
import * as SubjectApi from '@/api/fms/config/subject'
import { FMS_SUBJECT_STATUS } from '@/views/fms/utils/constants'
import { readFmsAccountSetId } from '@/views/fms/utils/context'

export default {
  name: 'FmsSubjectSelect',
  model: { prop: 'value', event: 'input' },
  props: {
    value: { type: [Number, String], default: undefined },
    modelValue: { type: [Number, String], default: undefined },
    options: { type: Array, default: null },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    filterable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择科目' }
  },
  data() { return { loading: false, subjectList: [] } },
  computed: {
    selectedValue() { return this.modelValue !== undefined ? this.modelValue : this.value },
    subjectOptions() { return this.flatten(this.options || this.subjectList) }
  },
  watch: {
    '$route.query.accountSetId': 'loadList',
    options: { handler: 'loadList', immediate: true }
  },
  mounted() { this.loadList() },
  methods: {
    formatSubject(subject) {
      const indent = Array(Math.max(Number(subject.level || 1) - 1, 0) + 1).join('　')
      const disabled = Number(subject.status) === FMS_SUBJECT_STATUS.DISABLED ? '（已停用）' : ''
      return indent + subject.code + ' ' + subject.name + disabled
    },
    flatten(items) {
      const result = []
      ;(items || []).forEach(item => {
        result.push(item)
        if (item.children && item.children.length) result.push.apply(result, this.flatten(item.children))
      })
      return result
    },
    handleInput(value) {
      const normalized = value === '' || value === null ? undefined : (Number(value) || value)
      this.$emit('input', normalized)
      this.$emit('update:modelValue', normalized)
      this.$emit('change', normalized)
    },
    loadList() {
      if (this.options) return
      const accountSetId = readFmsAccountSetId(this.$route)
      if (!accountSetId) { this.subjectList = []; return }
      this.loading = true
      return SubjectApi.getSubjectSimpleList(accountSetId).then(response => {
        const rows = response.data
        this.subjectList = rows
      }).finally(() => { this.loading = false })
    }
  }
}
</script>
