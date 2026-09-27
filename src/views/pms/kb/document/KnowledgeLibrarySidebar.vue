<template>
  <div class="knowledge-sidebar">
    <div
      class="sidebar-entry"
      :class="{ active: activeView === 'home' }"
      @click="$emit('home')"
    >
      <i class="el-icon-s-home" />
      <span>主页</span>
    </div>
    <div class="directory-header">
      <span>目录</span>
      <el-dropdown
        v-if="canCreateFolder || canCreateDocument"
        v-hasPermi="['pms:kb:library:update']"
        trigger="click"
        @command="$emit('create', $event)"
      >
        <el-button icon="el-icon-plus" type="text" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="canCreateDocument" command="document">创建文档</el-dropdown-item>
          <el-dropdown-item v-if="canCreateFolder" command="folder">创建文件夹</el-dropdown-item>
          <el-dropdown-item v-if="canCreateDocument" command="upload">上传文件</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-tree
      v-if="treeData.length"
      ref="tree"
      :current-node-key="currentNodeKey"
      :data="treeData"
      :default-expanded-keys="defaultExpandedNodeKeys"
      class="knowledge-sidebar-tree"
      highlight-current
      node-key="key"
      @node-click="$emit('node-click', $event)"
    >
      <span slot-scope="{ data }" class="tree-node">
        <svg-icon :icon-class="getKnowledgeTreeNodeIcon(data)" />
        <span class="tree-node-label">{{ data.label }}</span>
        <el-dropdown
          v-if="canEditKnowledgeContent(data.currentUserLevel) ||
            canDeleteKnowledgeContent(data.currentUserLevel)"
          trigger="click"
          @command="handleNodeCommand(data, $event)"
        >
          <el-button class="node-more" icon="el-icon-more" type="text" @click.stop />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="data.kind === 'folder' && canEditKnowledgeContent(data.currentUserLevel)"
              v-hasPermi="['pms:kb:library:update']"
              command="create-document"
            >新建文档</el-dropdown-item>
            <el-dropdown-item
              v-if="data.kind === 'folder' && canEditKnowledgeContent(data.currentUserLevel)"
              v-hasPermi="['pms:kb:library:update']"
              command="create-folder"
            >新建文件夹</el-dropdown-item>
            <el-dropdown-item
              v-if="data.kind === 'folder' && canEditKnowledgeContent(data.currentUserLevel)"
              v-hasPermi="['pms:kb:library:update']"
              command="upload"
            >上传文件</el-dropdown-item>
            <el-dropdown-item
              v-if="canEditKnowledgeContent(data.currentUserLevel)"
              v-hasPermi="['pms:kb:library:update']"
              command="rename"
            >重命名</el-dropdown-item>
            <el-dropdown-item
              v-if="canManageKnowledgeContent(data.currentUserLevel)"
              v-hasPermi="['pms:kb:library:update']"
              command="move"
            >移动</el-dropdown-item>
            <el-dropdown-item
              v-if="canDeleteKnowledgeContent(data.currentUserLevel)"
              v-hasPermi="['pms:kb:library:delete']"
              command="delete"
              divided
            >删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </span>
    </el-tree>
    <el-empty v-else :image-size="72" description="暂无目录或文档" />
    <div v-if="writeStatus">
      <div
        v-hasPermi="['pms:kb:library:delete']"
        class="sidebar-entry"
        :class="{ active: activeView === 'recycle' }"
        @click="$emit('recycle')"
      >
        <i class="el-icon-delete" />
        最近删除
      </div>
    </div>
  </div>
</template>

<script>
import { getKnowledgeTreeNodeIcon } from './types'
import {
  canDeleteKnowledgeContent,
  canEditKnowledgeContent,
  canManageKnowledgeContent
} from '@/views/pms/kb/utils/permission'

export default {
  name: 'PmsKnowledgeLibrarySidebar',
  props: {
    treeData: { type: Array, default: () => [] },
    currentNodeKey: { type: String, default: undefined },
    activeView: { type: String, required: true },
    writeStatus: { type: Boolean, default: false },
    canCreateFolder: { type: Boolean, default: false },
    canCreateDocument: { type: Boolean, default: false }
  },
  computed: {
    defaultExpandedNodeKeys() {
      return this.currentNodeKey ? [this.currentNodeKey] : []
    }
  },
  watch: {
    currentNodeKey: 'setCurrentNode',
    treeData: { deep: true, handler: 'setCurrentNode' }
  },
  methods: {
    canDeleteKnowledgeContent,
    canEditKnowledgeContent,
    canManageKnowledgeContent,
    getKnowledgeTreeNodeIcon,
    setCurrentNode() {
      this.$nextTick(() => {
        if (this.$refs.tree) this.$refs.tree.setCurrentKey(this.currentNodeKey, true)
      })
    },
    handleNodeCommand(data, command) {
      this.$emit('node-action', data, command)
    }
  }
}
</script>

<style scoped>
.knowledge-sidebar {
  padding: 8px 4px 16px 16px;
  font-size: 14px;
}

.sidebar-entry,
.directory-header {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 8px;
  border-radius: 4px;
  gap: 6px;
}

.sidebar-entry {
  cursor: pointer;
}

.sidebar-entry:hover,
.sidebar-entry.active {
  color: #409eff;
  background: #f5f7fa;
}

.directory-header {
  justify-content: space-between;
  font-weight: 600;
}

.knowledge-sidebar-tree {
  padding-right: 8px;
  background: transparent;
}

.tree-node {
  display: flex;
  align-items: center;
  width: calc(100% - 4px);
  min-width: 0;
  gap: 6px;
}

.tree-node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-more {
  width: 24px;
  height: 24px;
  padding: 0;
  opacity: 0;
}

.tree-node:hover .node-more {
  opacity: 1;
}

::v-deep .el-tree-node__content {
  height: 40px;
  padding-right: 4px;
  border-radius: 4px;
}

::v-deep .el-tree-node.is-current > .el-tree-node__content {
  color: #409eff;
  background: #f5f7fa;
}
</style>
