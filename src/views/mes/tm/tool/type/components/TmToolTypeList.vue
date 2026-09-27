<template>
  <div class="tm-tool-type-list">
    <el-input
      v-model="filterText"
      clearable
      prefix-icon="el-icon-search"
      placeholder="搜索分类"
    />
    <el-tree
      ref="tree"
      :data="listData"
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
import { TmToolTypeApi } from '@/api/mes/tm/tool/type'

export default {
  name: 'TmToolTypeList',
  data() {
    return {
      filterText: '',
      listData: [],
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
    this.loadList()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return Boolean(data.name && data.name.includes(value))
    },
    handleNodeClick(data) {
      if (this.currentNodeId === data.id) {
        this.clearCurrent()
        this.$emit('node-click', undefined)
        return
      }
      this.currentNodeId = data.id
      this.$emit('node-click', data)
    },
    loadList() {
      return TmToolTypeApi.getToolTypeSimpleList().then((response) => {
        this.listData = response.data
      })
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
.tm-tool-type-list .el-input { margin-bottom: 12px; }
.tm-tool-type-list .el-tree { background: transparent; }
</style>
