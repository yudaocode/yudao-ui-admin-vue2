<template>
  <el-select
    v-bind="$attrs"
    :value="currentValue"
    filterable
    :filter-method="handleFilter"
    :clearable="clearable"
    :disabled="disabled"
    :placeholder="placeholder"
    @input="updateValue"
    @change="handleChange"
  ><el-option
    v-for="item in filteredList"
    :key="item.id"
    :label="item.name"
    :value="item.id"
  /></el-select>
</template>
<script>
import { MerchantApi } from '@/api/wms/md/merchant'
import {
  SupplierMerchantTypeList,
  CustomerMerchantTypeList
} from '@/views/wms/utils/constants'
export default {
  name: 'WmsMerchantSelect',
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    supplier: Boolean,
    customer: Boolean,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择往来企业' }
  },
  data() {
    return { merchantList: [], filteredList: [] }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  watch: { supplier: 'loadList', customer: 'loadList' },
  created() {
    this.loadList()
  },
  methods: {
    loadList() {
      const types = this.supplier
        ? SupplierMerchantTypeList
        : this.customer
          ? CustomerMerchantTypeList
          : undefined
      return MerchantApi.getMerchantSimpleList(types ? { types } : undefined)
        .then((response) => {
          this.merchantList = response.data
          this.filteredList = this.merchantList
        })
    },
    updateValue(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleFilter(query) {
      const keyword = String(query || '').toLowerCase()
      this.filteredList = keyword
        ? this.merchantList.filter((item) =>
          String(item.name || '')
            .toLowerCase()
            .includes(keyword)
        )
        : this.merchantList
    },
    handleChange(value) {
      this.$emit(
        'change',
        this.merchantList.find((item) => item.id === value)
      )
    }
  }
}
</script>
