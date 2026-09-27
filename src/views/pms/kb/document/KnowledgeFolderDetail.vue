<template>
  <div>
    <div class="folder-header">
      <div>
        <div class="folder-title"><i class="el-icon-folder" />{{ folder.title }}</div>
        <div class="folder-meta">
          创建于 {{ formatDate(folder.createTime) }} · 子文件夹
          {{ folder.childFolderCount == null ? 0 : folder.childFolderCount }} 个 · 文档
          {{ folder.documentCount == null ? 0 : folder.documentCount }} 篇
        </div>
      </div>
      <div class="folder-actions">
        <el-button
          v-if="canManage"
          v-hasPermi="['pms:kb:library:update']"
          size="small"
          @click="$emit('permission')"
        ><i class="el-icon-user" />协作</el-button>
        <el-button size="small" @click="$emit('collect')">
          <i :class="folder.favoriteStatus ? 'el-icon-star-on' : 'el-icon-star-off'" />
          {{ folder.favoriteStatus ? '已关注' : '关注' }}
        </el-button>
        <el-dropdown
          v-if="canEditKnowledgeContent(folder.currentUserLevel)"
          @command="handleMoreCommand"
        >
          <el-button icon="el-icon-more" size="small" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-hasPermi="['pms:kb:library:update']" command="update">
              重命名
            </el-dropdown-item>
            <el-dropdown-item
              v-if="canManage"
              v-hasPermi="['pms:kb:library:update']"
              command="move"
            >移动</el-dropdown-item>
            <el-dropdown-item
              v-if="canDeleteKnowledgeContent(folder.currentUserLevel)"
              v-hasPermi="['pms:kb:library:delete']"
              command="delete"
              divided
            >删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="content-title">文件夹内容</div>
    <el-table
      v-if="children.length"
      :data="children"
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
    <el-empty v-else description="该文件夹暂无内容" />
  </div>
</template>

<script>
import * as KnowledgeFolderApi from '@/api/pms/kb/content/folder'
import { PmsKnowledgeContentLevel } from '@/views/pms/kb/utils/constants'
import { canDeleteKnowledgeContent, canEditKnowledgeContent } from '@/views/pms/kb/utils/permission'
import { formatDate } from '@/utils/formatTime'
import { getKnowledgeTreeNodeIcon, getKnowledgeTreeNodeTypeName } from './types'

export default {
  name: 'PmsKnowledgeFolderDetail',
  props: {
    folder: { type: Object, required: true },
    children: { type: Array, default: () => [] }
  },
  computed: {
    canManage() {
      return this.folder.currentUserLevel === PmsKnowledgeContentLevel.MANAGE
    }
  },
  methods: {
    canDeleteKnowledgeContent,
    canEditKnowledgeContent,
    formatDate,
    getKnowledgeTreeNodeIcon,
    getKnowledgeTreeNodeTypeName,
    async handleMoreCommand(command) {
      if (command === 'delete') {
        await this.handleDelete()
        return
      }
      if (command === 'update' || command === 'move') this.$emit(command)
    },
    async handleDelete() {
      try {
        await this.$modal.confirm('确认删除文件夹“' + this.folder.title + '”及其全部内容吗？')
        await KnowledgeFolderApi.deleteKnowledgeFolder(this.folder.id)
        this.$modal.msgSuccess('删除成功')
        this.$emit('delete')
      } catch (error) {
        // 用户取消时不删除。
      }
    }
  }
}
</script>

<style scoped>
.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 24px;
  margin-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  gap: 24px;
}

.folder-title {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  gap: 8px;
}

.folder-meta,
.content-type {
  color: #909399;
  font-size: 13px;
}

.folder-meta {
  margin-top: 8px;
}

.folder-actions {
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  gap: 8px;
}

.folder-actions .el-button {
  margin: 0;
}

.content-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}

.content-row {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.content-type {
  font-size: 12px;
}

::v-deep .knowledge-content-table .el-table__row {
  height: 48px;
  font-size: 14px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .folder-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
