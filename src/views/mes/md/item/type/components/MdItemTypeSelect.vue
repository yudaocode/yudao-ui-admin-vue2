<!-- MES 物料分类选择器：树形下拉，只允许选择叶节点 -->
<template>
  <el-tooltip :disabled="!selectedItem" placement="top" :open-delay="500">
    <div v-if="selectedItem" slot="content" class="tooltip"><div>编码：{{ selectedItem.code || '-' }}</div><div>名称：{{ selectedItem.name || '-' }}</div><div>备注：{{ selectedItem.remark || '-' }}</div></div>
    <el-cascader v-bind="$attrs" :value="currentValue" :options="treeData" :props="cascaderProps" :placeholder="placeholder" :disabled="disabled" clearable filterable class="full-width" @input="handleInput" @change="handleChange" />
  </el-tooltip>
</template>

<script>
import { MdItemTypeApi } from '@/api/mes/md/item/type'
import { handleTree } from '@/utils/ruoyi'

export default {
  name: 'MdItemTypeSelect',
  inheritAttrs: false,
  props: { value: Number, modelValue: Number, disabled: { type: Boolean, default: false }, placeholder: { type: String, default: '请选择物料分类' }},
  data() {
    return {
      allList: [],
      treeData: [],
      selectedItem: undefined,
      cascaderProps: { value: 'id', label: 'name', children: 'children', emitPath: false, checkStrictly: true }
    }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  watch: {
    currentValue(value) {
      this.selectedItem = value == null ? undefined : this.allList.find(item => item.id === value)
    }
  },
  async mounted() {
    const list = (await MdItemTypeApi.getItemTypeSimpleList()).data
    this.allList = list
    this.treeData = this.markParentsDisabled(handleTree(list))
    this.selectedItem = list.find(item => item.id === this.currentValue)
  },
  methods: {
    markParentsDisabled(nodes) {
      return nodes.map(node => node.children && node.children.length ? { ...node, disabled: true, children: this.markParentsDisabled(node.children) } : node)
    },
    handleInput(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleChange(value) {
      const id = Array.isArray(value) ? value[value.length - 1] : value
      this.selectedItem = this.allList.find(item => item.id === id)
      this.$emit('change', this.selectedItem)
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.tooltip { line-height: 24px; }
</style>
