<template>
  <el-select
    :value="value"
    :clearable="clearable"
    collapse-tags
    :disabled="disabled"
    :filterable="filterable"
    :loading="loading"
    :multiple="multiple"
    :placeholder="placeholder"
    class="fms-auxiliary-type-select"
    @input="handleChange"
  >
    <el-option
      v-for="item in auxiliaryTypeList"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    />
  </el-select>
</template>

<script>
import { FmsAuxiliaryTypeApi } from '@/api/fms/config/auxiliary/type'
import { readFmsAccountSetId } from '@/views/fms/utils/context'

export default {
  name: 'FmsAuxiliaryTypeSelect',
  props: {
    value: { type: [Number, Array], default: undefined },
    accountSetId: { type: [Number, String], default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择辅助核算' }
  },
  data() {
    return { loading: false, auxiliaryTypeList: [], requestSequence: 0 }
  },
  computed: {
    resolvedAccountSetId() {
      return Number(this.accountSetId || readFmsAccountSetId(this.$route)) || 0
    }
  },
  watch: {
    resolvedAccountSetId: { immediate: true, handler() { this.getAuxiliaryTypeList() } }
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)
    },
    getAuxiliaryTypeList() {
      const accountSetId = this.resolvedAccountSetId
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.auxiliaryTypeList = []
        this.loading = false
        this.$emit('loaded', [])
        return
      }
      this.loading = true
      return FmsAuxiliaryTypeApi.getAuxiliaryTypeSimpleList(accountSetId).then(response => {
        if (sequence !== this.requestSequence) return
        const rows = response.data
        this.auxiliaryTypeList = rows
        this.$emit('loaded', this.auxiliaryTypeList)
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.fms-auxiliary-type-select { width: 100%; }
</style>
