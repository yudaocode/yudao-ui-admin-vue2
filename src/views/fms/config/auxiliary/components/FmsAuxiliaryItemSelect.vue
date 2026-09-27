<template>
  <el-select
    :value="value"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :loading="loading"
    :multiple="multiple"
    :placeholder="placeholder"
    class="fms-auxiliary-item-select"
    @input="handleChange"
  >
    <el-option
      v-for="item in auxiliaryItemList"
      :key="item.id"
      :label="item.code + ' ' + item.name"
      :value="item.id"
    />
  </el-select>
</template>

<script>
import { FmsAuxiliaryItemApi } from '@/api/fms/config/auxiliary/item'
import { readFmsAccountSetId } from '@/views/fms/utils/context'

export default {
  name: 'FmsAuxiliaryItemSelect',
  props: {
    value: { type: [Number, Array], default: undefined },
    auxiliaryTypeId: { type: [Number, String], default: undefined },
    accountSetId: { type: [Number, String], default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择' }
  },
  data() {
    return { loading: false, auxiliaryItemList: [], requestSequence: 0 }
  },
  computed: {
    resolvedAccountSetId() {
      return Number(this.accountSetId || readFmsAccountSetId(this.$route)) || 0
    },
    contextKey() {
      return String(this.resolvedAccountSetId) + ':' + String(Number(this.auxiliaryTypeId) || 0)
    }
  },
  watch: {
    contextKey: { immediate: true, handler() { this.getAuxiliaryItemList() } }
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
      if (Array.isArray(value)) {
        this.$emit('change', this.auxiliaryItemList.filter(item => value.includes(item.id)))
      } else {
        this.$emit('change', this.auxiliaryItemList.find(item => item.id === value))
      }
    },
    getAuxiliaryItemList() {
      const accountSetId = this.resolvedAccountSetId
      const auxiliaryTypeId = Number(this.auxiliaryTypeId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId || !auxiliaryTypeId) {
        this.auxiliaryItemList = []
        this.loading = false
        return
      }
      this.loading = true
      return FmsAuxiliaryItemApi.getAuxiliaryItemSimpleList(accountSetId, auxiliaryTypeId).then(response => {
        if (sequence !== this.requestSequence) return
        const rows = response.data
        this.auxiliaryItemList = rows
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.fms-auxiliary-item-select { width: 100%; }
</style>
