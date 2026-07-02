<template>
  <div class="dept-tree-select">
    <el-input
      v-model="filterText"
      class="dept-tree-filter"
      clearable
      :placeholder="filterPlaceholder"
      prefix-icon="el-icon-search"
    />
    <el-scrollbar class="dept-tree-scroll">
      <el-tree
        ref="tree"
        :data="deptList"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :props="defaultProps"
        default-expand-all
        highlight-current
        node-key="id"
        @node-click="handleNodeClick"
      />
    </el-scrollbar>
  </div>
</template>

<script>
import { listSimpleDepts } from '@/api/system/dept'
import { handleTree } from '@/utils/ruoyi'

export default {
  name: 'DeptTreeSelect',
  props: {
    filterPlaceholder: {
      type: String,
      default: '请输入部门名称'
    }
  },
  data() {
    return {
      filterText: '',
      deptList: [],
      currentNodeId: undefined,
      defaultProps: {
        children: 'children',
        label: 'name'
      }
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
    async loadTree() {
      const response = await listSimpleDepts()
      this.deptList = handleTree(response.data || [], 'id')
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    handleNodeClick(node) {
      if (this.currentNodeId === node.id) {
        this.reset()
        this.$emit('node-click', undefined)
        return
      }
      this.currentNodeId = node.id
      this.$emit('node-click', node.id)
    },
    reset() {
      this.currentNodeId = undefined
      this.filterText = ''
      this.$refs.tree && this.$refs.tree.setCurrentKey(null)
    },
    setCurrent(deptId) {
      this.currentNodeId = deptId
      this.$refs.tree && this.$refs.tree.setCurrentKey(deptId)
    }
  }
}
</script>

<style scoped>
.dept-tree-select {
  height: 100%;
}

.dept-tree-filter {
  padding: 12px;
  box-sizing: border-box;
}

.dept-tree-scroll {
  height: calc(100% - 56px);
}
</style>
