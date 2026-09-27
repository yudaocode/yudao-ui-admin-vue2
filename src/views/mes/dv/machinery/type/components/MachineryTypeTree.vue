<!-- MES 设备类型树面板 -->
<template>
  <div>
    <el-input v-model="filterText" placeholder="搜索分类" clearable prefix-icon="el-icon-search" class="tree-filter" />
    <el-tree
      ref="tree"
      :data="treeData"
      :props="treeProps"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      default-expand-all
      highlight-current
      node-key="id"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script>
import { DvMachineryTypeApi } from '@/api/mes/dv/machinery/type'
import { handleTree } from '@/utils/tree'

export default {
  name: 'MachineryTypeTree',
  data() {
    return {
      filterText: '',
      treeData: [],
      treeProps: { children: 'children', label: 'name' },
      currentNodeId: undefined
    }
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
      return !value || (data.name && data.name.includes(value))
    },
    handleNodeClick(data) {
      if (this.currentNodeId === data.id) {
        this.$refs.tree.setCurrentKey(undefined)
        this.currentNodeId = undefined
        this.$emit('node-click', undefined)
      } else {
        this.currentNodeId = data.id
        this.$emit('node-click', data)
      }
    },
    async loadTree() {
      const response = await DvMachineryTypeApi.getMachineryTypeSimpleList()
      this.treeData = handleTree(response.data)
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
.tree-filter { margin-bottom: 12px; }
</style>
