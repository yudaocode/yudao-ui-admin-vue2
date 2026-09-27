<!-- MES 工序选择器：纯下拉，前端按名称和编码过滤 -->
<template>
  <el-tooltip
    :disabled="!selectedItem"
    placement="top"
    :open-delay="500"
  >
    <div
      v-if="selectedItem"
      slot="content"
      class="process-tooltip"
    ><div>编码：{{ selectedItem.code || '-' }}</div><div>名称：{{ selectedItem.name || '-' }}</div><div>工艺要求：{{ selectedItem.attention || '-' }}</div><div>备注：{{ selectedItem.remark || '-' }}</div></div>
    <el-select
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
    >
      <el-option
        v-for="item in filteredList"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      ><span>{{ item.name }}</span><el-tag
        v-if="item.code"
        size="mini"
        type="info"
        class="process-code"
      >{{ item.code }}</el-tag></el-option>
    </el-select>
  </el-tooltip>
</template>

<script>
import { ProProcessApi } from '@/api/mes/pro/process'

export default {
  name: 'ProProcessSelect',
  inheritAttrs: false,
  props: { value: Number, modelValue: Number, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择工序' }},
  data() { return { allList: [], filteredList: [], selectedItem: undefined } },
  computed: { currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value } },
  watch: { currentValue(value) { if (value == null) this.selectedItem = undefined; else if (this.allList.length && (!this.selectedItem || this.selectedItem.id !== value)) this.selectedItem = this.allList.find(item => item.id === value) } },
  async mounted() { const response = await ProProcessApi.getProcessSimpleList(); this.allList = response.data; this.filteredList = this.allList; if (this.currentValue != null) this.selectedItem = this.allList.find(item => item.id === this.currentValue) },
  methods: {
    handleFilter(query) { if (!query) { this.filteredList = this.allList; return } const keyword = query.toLowerCase(); this.filteredList = this.allList.filter(item => (item.name && item.name.toLowerCase().includes(keyword)) || (item.code && item.code.toLowerCase().includes(keyword))) },
    handleInput(value) { this.$emit('input', value); this.$emit('update:modelValue', value) },
    handleChange(value) { const item = this.allList.find(option => option.id === value); this.selectedItem = item; this.$emit('change', item) }
  }
}
</script>

<style scoped>.full-width { width: 100%; }.process-tooltip { line-height: 24px; }.process-code { margin-left: 8px; }</style>
