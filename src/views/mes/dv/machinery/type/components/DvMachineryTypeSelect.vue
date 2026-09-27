<!-- MES 设备类型选择器：树形下拉，只允许选择叶节点 -->
<template>
  <el-tooltip :disabled="!selectedItem" placement="top" :open-delay="500">
    <div v-if="selectedItem" slot="content" class="type-tooltip">
      <div>编码：{{ selectedItem.code || '-' }}</div>
      <div>名称：{{ selectedItem.name || '-' }}</div>
      <div>备注：{{ selectedItem.remark || '-' }}</div>
    </div>
    <el-cascader
      v-bind="$attrs"
      :value="currentValue"
      :options="treeData"
      :props="treeProps"
      :placeholder="placeholder"
      :disabled="disabled"
      clearable
      filterable
      class="full-width"
      @input="handleInput"
      @change="handleChange"
    />
  </el-tooltip>
</template>

<script>
import { DvMachineryTypeApi } from '@/api/mes/dv/machinery/type'
import { defaultProps, handleTree } from '@/utils/tree'

export default {
  name: 'DvMachineryTypeSelect',
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '请选择设备类型' }
  },
  data() {
    return { allList: [], treeData: [], selectedItem: undefined, treeProps: defaultProps }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  watch: {
    currentValue(value) {
      if (value == null) this.selectedItem = undefined
      else if ((!this.selectedItem || this.selectedItem.id !== value) && this.allList.length > 0) {
        this.selectedItem = this.allList.find(item => item.id === value)
      }
    }
  },
  async mounted() {
    const response = await DvMachineryTypeApi.getMachineryTypeSimpleList()
    this.allList = response.data
    this.treeData = this.markParentsDisabled(handleTree(this.allList))
    if (this.currentValue != null) this.selectedItem = this.allList.find(item => item.id === this.currentValue)
  },
  methods: {
    markParentsDisabled(nodes) {
      return nodes.map(node => node.children && node.children.length
        ? { ...node, disabled: true, children: this.markParentsDisabled(node.children) }
        : node)
    },
    handleInput(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleChange(value) {
      const item = this.allList.find(option => option.id === value)
      this.selectedItem = item
      this.$emit('change', item)
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.type-tooltip { line-height: 24px; }
</style>
