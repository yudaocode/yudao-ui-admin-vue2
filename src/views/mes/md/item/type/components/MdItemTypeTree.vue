<!-- MES 物料分类树面板 -->
<template>
  <div>
    <el-input v-model="filterText" placeholder="搜索分类" clearable prefix-icon="el-icon-search" class="filter" />
    <el-tree ref="tree" :data="treeData" :props="treeProps" :expand-on-click-node="false" :filter-node-method="filterNode" default-expand-all highlight-current node-key="id" @node-click="handleNodeClick" />
  </div>
</template>

<script>
import { MdItemTypeApi } from '@/api/mes/md/item/type'
import { handleTree } from '@/utils/ruoyi'

export default {
  name: 'MdItemTypeTree',
  data() {
    return { filterText: '', treeData: [], treeProps: { children: 'children', label: 'name' }, currentNodeId: undefined }
  },
  watch: {
    filterText(value) {
      if (this.$refs.tree) this.$refs.tree.filter(value)
    }
  },
  mounted() {
    this.loadTree()
  },
  methods: {
    filterNode(value, data) {
      return !value || String(data.name || '').includes(value)
    },
    handleNodeClick(data) {
      if (this.currentNodeId === data.id) {
        this.clearCurrent()
        this.$emit('node-click', undefined)
      } else {
        this.currentNodeId = data.id
        this.$emit('node-click', data)
      }
    },
    async loadTree() {
      const list = (await MdItemTypeApi.getItemTypeSimpleList()).data
      this.treeData = handleTree(list)
    },
    clearCurrent() {
      if (this.$refs.tree) this.$refs.tree.setCurrentKey(undefined)
      this.currentNodeId = undefined
    },
    reset() {
      this.clearCurrent()
      this.filterText = ''
    }
  }
}
</script>

<style scoped>
.filter { margin-bottom: 12px; }
</style>
