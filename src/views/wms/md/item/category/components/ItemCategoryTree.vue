<template>
  <div class="wms-category-tree">
    <el-input
      v-model="filterText"
      clearable
      :placeholder="filterPlaceholder"
      prefix-icon="el-icon-search"
      @clear="clearFilter"
    />
    <el-tree
      ref="tree"
      :data="categoryList"
      :props="defaultProps"
      node-key="id"
      highlight-current
      default-expand-all
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script>
import { handleTree } from '@/utils/ruoyi'
import { ItemCategoryApi } from '@/api/wms/md/item/category'

export default {
  name: 'WmsItemCategoryTree',
  props: { filterPlaceholder: { type: String, default: '请输入分类名称' }},
  data() {
    return {
      filterText: '',
      categoryList: [],
      currentNodeId: null,
      defaultProps: { label: 'name', children: 'children' }
    }
  },
  watch: {
    filterText(value) {
      this.$refs.tree && this.$refs.tree.filter(value)
    }
  },
  created() {
    this.loadTree()
  },
  methods: {
    loadTree() {
      return ItemCategoryApi.getItemCategorySimpleList()
        .then((response) => {
          this.categoryList = handleTree(response.data, 'id', 'parentId')
        })
    },
    filterNode(value, data) {
      return !value || String(data.name || '').includes(value)
    },
    clearFilter() {
      this.filterText = ''
    },
    handleNodeClick(row) {
      if (this.currentNodeId === row.id) {
        this.currentNodeId = null
        this.$refs.tree.setCurrentKey(null)
        this.$emit('node-click', undefined)
      } else {
        this.currentNodeId = row.id
        this.$emit('node-click', row.id)
      }
    },
    reset() {
      this.currentNodeId = null
      this.filterText = ''
      this.$refs.tree && this.$refs.tree.setCurrentKey(null)
    },
    setCurrent(categoryId) {
      this.currentNodeId = categoryId
      this.$refs.tree && this.$refs.tree.setCurrentKey(categoryId)
    }
  }
}
</script>

<style scoped>
.wms-category-tree {
  height: 100%;
}
.wms-category-tree .el-input {
  margin-bottom: 12px;
}
</style>
