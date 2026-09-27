<template>
  <div>
    <div class="library-home-header">
      <div class="library-summary">
        <div class="library-name">{{ library ? library.name : '' }}</div>
        <div class="library-description">
          {{ library && library.description ? library.description : '暂无简介' }}
        </div>
      </div>
      <el-button class="search-button" type="primary" @click="$emit('search')">
        <i class="el-icon-search" />搜索文档
      </el-button>
      <el-dropdown @command="handleMoreCommand">
        <el-button>更多</el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="collect">
            {{ library && library.favoriteStatus ? '取消关注' : '关注' }}
          </el-dropdown-item>
          <el-dropdown-item
            v-if="writeStatus && library && library.adminStatus"
            v-hasPermi="['pms:kb:library:update']"
            command="member"
          >成员管理</el-dropdown-item>
          <el-dropdown-item v-if="library && library.exitStatus" command="exit" divided>
            退出知识库
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-tabs v-model="activeTab" class="content-tabs" @tab-click="handleTabChange">
      <el-tab-pane label="全部文档" name="all" />
      <el-tab-pane label="我关注的" name="favorite" />
    </el-tabs>
    <div v-loading="favoriteLoading">
      <el-table
        v-if="displayNodes.length"
        :data="displayNodes"
        :show-header="false"
        class="knowledge-content-table"
        @row-click="$emit('node-click', $event)"
      >
        <el-table-column min-width="240">
          <template slot-scope="scope">
            <div class="content-row">
              <svg-icon :icon-class="getKnowledgeTreeNodeIcon(scope.row)" />
              <span>{{ scope.row.label }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="right" width="100">
          <template slot-scope="scope">
            <span class="content-type">{{ getKnowledgeTreeNodeTypeName(scope.row) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-else
        :description="activeTab === 'favorite' ? '暂无关注内容' : '暂无目录或文档'"
      />
    </div>
  </div>
</template>

<script>
import { PmsKnowledgeObjectType } from '@/views/pms/kb/utils/constants'
import { getKnowledgeTreeNodeIcon, getKnowledgeTreeNodeTypeName } from './types'

export default {
  name: 'PmsKnowledgeLibraryHome',
  props: {
    library: { type: Object, default: undefined },
    treeData: { type: Array, default: () => [] },
    favoriteItems: { type: Array, default: () => [] },
    favoriteLoading: { type: Boolean, default: false },
    writeStatus: { type: Boolean, default: false }
  },
  data() {
    return { activeTab: 'all' }
  },
  computed: {
    displayNodes() {
      if (this.activeTab === 'all') return this.treeData
      return this.favoriteItems
        .filter(item => [
          PmsKnowledgeObjectType.FOLDER,
          PmsKnowledgeObjectType.DOCUMENT,
          PmsKnowledgeObjectType.FILE
        ].includes(item.type))
        .map(item => ({
          key: (item.type === PmsKnowledgeObjectType.FOLDER ? 'folder-' : 'document-') +
            item.entityId,
          entityId: item.entityId,
          kind: item.type === PmsKnowledgeObjectType.FOLDER ? 'folder' : 'document',
          label: item.name,
          type: item.type,
          children: []
        }))
    }
  },
  methods: {
    getKnowledgeTreeNodeIcon,
    getKnowledgeTreeNodeTypeName,
    handleMoreCommand(command) {
      this.$emit(command)
    },
    handleTabChange(tab) {
      this.$emit('tab-change', tab.name === 'favorite' ? 'favorite' : 'all')
    }
  }
}
</script>

<style scoped>
.library-home-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 24px;
}

.library-summary {
  flex: 1;
  min-width: 0;
}

.library-name {
  overflow: hidden;
  font-size: 20px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.library-description {
  max-width: 720px;
  margin-top: 10px;
  padding: 12px 16px;
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-button {
  margin-left: auto;
}

.content-tabs {
  margin-bottom: 12px;
}

.content-row {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.content-type {
  color: #909399;
  font-size: 12px;
}

::v-deep .knowledge-content-table .el-table__row {
  height: 48px;
  font-size: 14px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .library-home-header {
    flex-direction: column;
  }

  .search-button {
    margin-left: 0;
  }
}
</style>
