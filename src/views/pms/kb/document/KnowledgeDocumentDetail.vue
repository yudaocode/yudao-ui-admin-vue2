<template>
  <div>
    <div class="document-header">
      <div class="document-heading">
        <div class="document-title">{{ document.title }}</div>
        <div class="document-meta">
          <span v-if="document.creatorUserName">{{ document.creatorUserName }} 创建于</span>
          <span>{{ formatDate(document.createTime) }}</span>
          <el-tag size="small" :type="getKnowledgeDocumentStatusTagType(document.status)">
            {{ getKnowledgeDocumentStatusName(document.status) }}
          </el-tag>
        </div>
        <div v-if="labels.length" class="document-labels">
          <span
            v-for="label in labels"
            :key="label.id"
            :style="{
              color: label.color,
              borderColor: label.color,
              backgroundColor: label.color + '14'
            }"
            class="document-label"
          >{{ label.name }}</span>
        </div>
      </div>
      <div class="document-actions">
        <el-button
          v-if="canEditKnowledgeContent(document.currentUserLevel)"
          v-hasPermi="['pms:kb:library:update']"
          size="small"
          @click="$emit('update')"
        ><i class="el-icon-edit" />编辑</el-button>
        <el-button
          v-if="canManage"
          v-hasPermi="['pms:kb:library:update']"
          size="small"
          @click="$emit('permission')"
        ><i class="el-icon-user" />协作</el-button>
        <el-button size="small" @click="$emit('collect')">
          <i :class="document.favoriteStatus ? 'el-icon-star-on' : 'el-icon-star-off'" />
          {{ document.favoriteStatus ? '已关注' : '关注' }}
        </el-button>
        <el-button
          v-if="canEditKnowledgeContent(document.currentUserLevel)"
          v-hasPermi="['pms:kb:library:update']"
          size="small"
          type="primary"
          @click="$emit('share')"
        ><i class="el-icon-share" />分享</el-button>
        <el-dropdown
          v-if="canEditKnowledgeContent(document.currentUserLevel)"
          @command="handleMoreCommand"
        >
          <el-button icon="el-icon-more" size="small" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="canManage"
              v-hasPermi="['pms:kb:library:update']"
              command="move"
            >移动</el-dropdown-item>
            <el-dropdown-item
              v-if="canDeleteKnowledgeContent(document.currentUserLevel)"
              v-hasPermi="['pms:kb:library:delete']"
              command="delete"
              divided
            >删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div
      v-if="document.type === PmsKnowledgeDocumentType.RICH_TEXT"
      v-dompurify-html="document.content || '<p>暂无内容</p>'"
      class="pms-knowledge-rich-text"
    ></div>
    <div v-else>
      <template v-if="document.content">
        <div class="file-meta">
          <el-tag type="info">{{ document.fileType || '文件' }}</el-tag>
          <span v-if="document.fileSize !== undefined" class="secondary-text">
            {{ formatKnowledgeFileSize(document.fileSize) }}
          </span>
          <el-link
            v-if="document.downloadStatus"
            :href="document.content"
            target="_blank"
            type="primary"
          >下载文件</el-link>
          <span v-else class="secondary-text">当前角色仅可在线预览</span>
        </div>
        <file-preview
          :downloadable="document.downloadStatus"
          :file-name="document.title"
          :file-type="document.fileType"
          :url="document.previewUrl || document.content"
        />
      </template>
      <el-empty v-else description="文件未上传" />
    </div>
    <div
      v-if="document.type === PmsKnowledgeDocumentType.RICH_TEXT"
      class="like-row"
    >
      <el-button
        type="text"
        :class="{ 'is-liked': document.likeStatus }"
        @click="$emit('like')"
      >
        <svg-icon
          :icon-class="document.likeStatus
            ? 'ant-design:like-filled'
            : 'ant-design:like-outlined'"
        />
        {{ document.likeStatus ? '取消点赞' : '点赞' }}
      </el-button>
      <span v-if="likeSummary">{{ likeSummary }}</span>
      <el-avatar
        v-for="user in likeUsers.slice(0, 5)"
        :key="user.id"
        :size="22"
        :src="user.avatar"
      >{{ firstCharacter(user.nickname) }}</el-avatar>
    </div>
    <knowledge-document-comment
      v-if="document.type === PmsKnowledgeDocumentType.RICH_TEXT"
      :document-id="document.id"
    />
  </div>
</template>

<script>
import * as KnowledgeDocumentApi from '@/api/pms/kb/content/document'
import { FilePreview } from '@/components/FilePreview'
import { formatDate } from '@/utils/formatTime'
import KnowledgeDocumentComment from './KnowledgeDocumentComment.vue'
import { PmsKnowledgeContentLevel, PmsKnowledgeDocumentType } from '@/views/pms/kb/utils/constants'
import { canDeleteKnowledgeContent, canEditKnowledgeContent } from '@/views/pms/kb/utils/permission'
import {
  getKnowledgeDocumentStatusName,
  getKnowledgeDocumentStatusTagType,
  formatKnowledgeFileSize
} from '@/views/pms/kb/utils/format'

export default {
  name: 'PmsKnowledgeDocumentDetail',
  components: { FilePreview, KnowledgeDocumentComment },
  props: {
    document: { type: Object, required: true },
    labels: { type: Array, default: () => [] }
  },
  data() {
    return { PmsKnowledgeDocumentType }
  },
  computed: {
    canManage() {
      return this.document.currentUserLevel === PmsKnowledgeContentLevel.MANAGE
    },
    loginUserId() {
      return this.$store.getters.userId
    },
    likeUsers() {
      return this.document.likeUsers || []
    },
    likeSummary() {
      const likeUsers = this.likeUsers.filter(user => user.nickname)
      if (this.document.likeStatus) {
        const otherCount = likeUsers.filter(user => user.id !== this.loginUserId).length
        return otherCount > 0 ? '您和其他 ' + otherCount + ' 人' : '您赞了该文档'
      }
      return likeUsers.length > 0 ? likeUsers.length + ' 人赞了该文档' : ''
    }
  },
  methods: {
    canDeleteKnowledgeContent,
    canEditKnowledgeContent,
    formatDate,
    formatKnowledgeFileSize,
    getKnowledgeDocumentStatusName,
    getKnowledgeDocumentStatusTagType,
    firstCharacter(name) {
      return name ? name.slice(0, 1) : ''
    },
    async handleMoreCommand(command) {
      if (command === 'delete') {
        await this.handleDelete()
        return
      }
      if (command === 'move') this.$emit('move')
    },
    async handleDelete() {
      try {
        await this.$modal.confirm('确认删除文档“' + this.document.title + '”及其子文档吗？')
        await KnowledgeDocumentApi.deleteKnowledgeDocument(this.document.id)
        this.$modal.msgSuccess('删除成功')
        this.$emit('delete')
      } catch (error) {
        // 用户取消时不删除。
      }
    }
  }
}
</script>

<style lang="scss">
.pms-knowledge-rich-text {
  display: flow-root;
  padding: 0 0 4px;
  color: #303133;
  font-size: 14px;
  overflow-wrap: anywhere;

  h1 {
    margin: 20px 0 14px;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.4;
  }

  h2 {
    margin: 18px 0 10px;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  }

  h3 {
    margin: 14px 0 8px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }

  p {
    margin: 0 0 12px;
    line-height: 1.75;
  }

  > :first-child {
    margin-top: 0;
  }

  img {
    max-width: 100%;
    height: auto;
  }
}
</style>

<style scoped>
.document-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 0 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  gap: 24px;
}

.document-heading {
  min-width: 0;
}

.document-title {
  overflow: hidden;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-meta,
.document-labels,
.document-actions,
.file-meta,
.like-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.document-meta {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  gap: 10px;
}

.document-labels {
  margin-top: 10px;
}

.document-label {
  padding: 1px 6px;
  font-size: 12px;
  line-height: 18px;
  border: 1px solid;
  border-radius: 4px;
}

.document-actions {
  flex-shrink: 0;
}

.document-actions .el-button {
  margin: 0;
}

.file-meta {
  justify-content: flex-end;
  margin-bottom: 12px;
}

.secondary-text,
.like-row {
  color: #909399;
  font-size: 12px;
}

.like-row {
  margin-top: 12px;
  gap: 10px;
}

.like-row .el-button {
  margin: 0;
  padding: 0;
  color: #909399;
}

.like-row .el-button.is-liked {
  color: #409eff;
}

@media (max-width: 1100px) {
  .document-header {
    flex-direction: column;
  }
}
</style>
