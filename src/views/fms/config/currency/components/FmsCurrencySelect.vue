<template>
  <el-select :value="value" :clearable="clearable" :disabled="disabled" :filterable="filterable" :loading="loading" :multiple="multiple" :placeholder="placeholder" class="fms-currency-select" @input="handleInput">
    <el-option v-for="item in currencyList" :key="item.id" :label="item.code + ' ' + item.name" :value="item.id" />
  </el-select>
</template>

<script>
import { FmsCurrencyApi } from '@/api/fms/config/currency'
import { readFmsAccountSetId } from '@/views/fms/utils/context'

export default {
  name: 'FmsCurrencySelect',
  props: {
    value: { type: [Number, Array], default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    excludeStandard: { type: Boolean, default: false },
    placeholder: { type: String, default: '请选择币别' },
    accountSetId: { type: [Number, String], default: undefined }
  },
  data() { return { loading: false, list: [] } },
  computed: {
    currencyList() {
      return this.excludeStandard ? this.list.filter(item => !item.standard) : this.list
    },
    resolvedAccountSetId() {
      return Number(this.accountSetId || readFmsAccountSetId(this.$route)) || 0
    }
  },
  watch: {
    resolvedAccountSetId: { immediate: true, handler() { this.getCurrencyList() } }
  },
  methods: {
    getCurrencyList() {
      if (!this.resolvedAccountSetId) { this.list = []; return }
      this.loading = true
      return FmsCurrencyApi.getCurrencySimpleList(this.resolvedAccountSetId).then(response => {
        this.list = response.data
      }).finally(() => { this.loading = false })
    },
    handleInput(value) { this.$emit('input', value) }
  }
}
</script>

<style scoped>
.fms-currency-select { width: 100%; }
</style>
