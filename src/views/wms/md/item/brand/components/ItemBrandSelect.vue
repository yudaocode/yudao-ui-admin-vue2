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
  >
    <el-option
      v-for="brand in filteredList"
      :key="brand.id"
      :label="brand.name"
      :value="brand.id"
    />
  </el-select>
</template>

<script>
import { ItemBrandApi } from '@/api/wms/md/item/brand'

export default {
  name: 'WmsItemBrandSelect',
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择商品品牌' }
  },
  data() {
    return { brandList: [], filteredList: [] }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  created() {
    ItemBrandApi.getItemBrandSimpleList()
      .then((response) => {
        this.brandList = response.data
        this.filteredList = this.brandList
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
        ? this.brandList.filter((item) =>
          String(item.name || '')
            .toLowerCase()
            .includes(keyword)
        )
        : this.brandList
    },
    handleChange(value) {
      this.$emit(
        'change',
        this.brandList.find((item) => item.id === value)
      )
    }
  }
}
</script>
