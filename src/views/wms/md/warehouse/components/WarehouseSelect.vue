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
import { WarehouseApi } from '@/api/wms/md/warehouse'
export default {
  name: 'WmsWarehouseSelect',
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择仓库' }
  },
  data() {
    return { warehouseList: [], filteredList: [] }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  created() {
    WarehouseApi.getWarehouseSimpleList()
      .then((response) => {
        this.warehouseList = response.data
        this.filteredList = this.warehouseList
      })
  },
  methods: {
    updateValue(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleFilter(query) {
      const keyword = String(query || '').toLowerCase()
      this.filteredList = keyword
        ? this.warehouseList.filter((item) =>
          String(item.name || '')
            .toLowerCase()
            .includes(keyword)
        )
        : this.warehouseList
    },
    handleChange(value) {
      this.$emit(
        'change',
        this.warehouseList.find((item) => item.id === value)
      )
    }
  }
}
</script>
