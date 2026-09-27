<!-- MES 库区选择器 -->
<template><el-tooltip
  :disabled="!selectedItem"
  placement="top"
  :open-delay="500"
><div
  v-if="selectedItem"
  slot="content"
  class="tooltip"
><div>编码：{{ selectedItem.code || '-' }}</div><div>名称：{{ selectedItem.name || '-' }}</div><div>所属仓库：{{ selectedItem.warehouseName || '-' }}</div></div><el-select
  v-bind="$attrs"
  :value="currentValue"
  :placeholder="placeholder"
  :disabled="disabled"
  :clearable="clearable"
  filterable
  :filter-method="handleFilter"
  class="full-width"
  @input="handleInput"
  @change="handleChange"
><el-option
  v-for="item in filteredList"
  :key="item.id"
  :label="item.name"
  :value="item.id"
><span>{{ item.name }}</span><el-tag
  v-if="item.code"
  size="mini"
  type="info"
  class="code"
>编号: {{ item.code }}</el-tag></el-option></el-select></el-tooltip></template>
<script>
import { WmWarehouseLocationApi } from '@/api/mes/wm/warehouse/location'
export default {
  name: 'WmWarehouseLocationSelect', inheritAttrs: false,
  props: { value: Number, modelValue: Number, warehouseId: Number, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择库区' }},
  data() { return { allList: [], filteredList: [], filterQuery: '', selectedItem: undefined } },
  computed: { currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value } },
  watch: { currentValue(value) { this.selectedItem = value == null ? undefined : this.allList.find(item => item.id === value) }, warehouseId() { this.loadList() } },
  mounted() { this.loadList() },
  methods: {
    async loadList() { const list = (await WmWarehouseLocationApi.getWarehouseLocationSimpleList(this.warehouseId)).data; this.allList = list; this.applyFilter(); this.selectedItem = list.find(item => item.id === this.currentValue) },
    applyFilter() { const keyword = this.filterQuery.toLowerCase(); this.filteredList = keyword ? this.allList.filter(item => String(item.name || '').toLowerCase().includes(keyword) || String(item.code || '').toLowerCase().includes(keyword)) : this.allList },
    handleFilter(query) { this.filterQuery = query || ''; this.applyFilter() },
    handleInput(value) { this.$emit('input', value); this.$emit('update:modelValue', value) },
    handleChange(value) { this.selectedItem = this.allList.find(item => item.id === value); this.$emit('change', this.selectedItem) }
  }
}
</script>
<style scoped>.full-width { width: 100%; }.tooltip { line-height: 24px; }.code { float: right; margin-top: 6px; }</style>
