<template>
  <div class="knowledge-comments">
    <el-divider content-position="left">
      {{ commentCount ? '评论（' + commentCount + '）' : '评论' }}
    </el-divider>
    <div v-loading="loading">
      <div class="comment-editor">
        <el-input
          v-model="newContent"
          :rows="2"
          maxlength="2000"
          placeholder="请输入评论内容"
          show-word-limit
          type="textarea"
        />
        <div class="comment-submit">
          <el-button :loading="submitting" type="primary" @click="submitRootComment">
            发表评论
          </el-button>
        </div>
      </div>
      <el-empty v-if="comments.length === 0" :image-size="72" description="暂无评论" />
      <div v-for="comment in comments" :key="comment.id" class="comment-row">
        <el-avatar :size="32" class="knowledge-comment-avatar">
          {{ firstCharacter(comment.userName) }}
        </el-avatar>
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-user">{{ comment.userName }}</span>
            <span>{{ formatDate(comment.createTime) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <el-button
              v-if="comment.userId === loginUserId"
              class="danger-text"
              type="text"
              @click="handleDelete(comment)"
            >删除</el-button>
            <el-button type="text" @click="startReply(comment, comment)">回复</el-button>
          </div>
          <div v-for="reply in comment.children" :key="reply.id" class="reply-row">
            <el-avatar :size="28" class="knowledge-comment-avatar">
              {{ firstCharacter(reply.userName) }}
            </el-avatar>
            <div class="comment-body">
              <div class="comment-meta">
                <span class="comment-user">{{ reply.userName }}</span>
                <span>{{ formatDate(reply.createTime) }}</span>
              </div>
              <div v-if="reply.replyUserName" class="reply-target">
                回复 @{{ reply.replyUserName }}
              </div>
              <div class="comment-content">{{ reply.content }}</div>
              <div class="comment-actions">
                <el-button
                  v-if="reply.userId === loginUserId"
                  class="danger-text"
                  type="text"
                  @click="handleDelete(reply)"
                >删除</el-button>
                <el-button type="text" @click="startReply(comment, reply)">回复</el-button>
              </div>
            </div>
          </div>
          <div v-if="replyMainId === comment.id" class="reply-editor">
            <el-input
              v-model="replyContent"
              :placeholder="'回复 ' + replyUserName"
              maxlength="2000"
              @keyup.enter.native="submitReply"
            />
            <el-button :loading="submitting" type="primary" @click="submitReply">回复</el-button>
            <el-button @click="cancelReply">取消</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as KnowledgeDocumentCommentApi from '@/api/pms/kb/interaction/comment'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'PmsKnowledgeDocumentComment',
  props: {
    documentId: { type: Number, required: true }
  },
  data() {
    return {
      loading: false,
      submitting: false,
      comments: [],
      newContent: '',
      replyMainId: undefined,
      replyUserId: undefined,
      replyUserName: '',
      replyContent: ''
    }
  },
  computed: {
    loginUserId() {
      return this.$store.getters.userId
    },
    commentCount() {
      return this.comments.reduce(
        (count, comment) => count + 1 + ((comment.children && comment.children.length) || 0),
        0
      )
    }
  },
  watch: {
    documentId: {
      immediate: true,
      handler() {
        this.getList()
      }
    }
  },
  methods: {
    formatDate,
    firstCharacter(name) {
      return name ? name.slice(0, 1) : ''
    },
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeDocumentCommentApi
          .getKnowledgeDocumentCommentList(this.documentId)
        this.comments = response.data
      } finally {
        this.loading = false
      }
    },
    async submitRootComment() {
      if (!this.newContent.trim()) {
        this.$modal.msgWarning('请输入评论内容')
        return false
      }
      this.submitting = true
      try {
        await KnowledgeDocumentCommentApi.createKnowledgeDocumentComment({
          documentId: this.documentId,
          content: this.newContent
        })
        this.$modal.msgSuccess('评论成功')
        this.newContent = ''
        await this.getList()
        return true
      } finally {
        this.submitting = false
      }
    },
    startReply(mainComment, targetComment) {
      this.replyMainId = mainComment.id
      this.replyUserId = targetComment.userId
      this.replyUserName = targetComment.userName || ''
      this.replyContent = ''
    },
    cancelReply() {
      this.replyMainId = undefined
      this.replyUserId = undefined
      this.replyUserName = ''
      this.replyContent = ''
    },
    async submitReply() {
      if (!this.replyContent.trim() || !this.replyMainId) {
        this.$modal.msgWarning('请输入回复内容')
        return false
      }
      this.submitting = true
      try {
        await KnowledgeDocumentCommentApi.createKnowledgeDocumentComment({
          documentId: this.documentId,
          mainId: this.replyMainId,
          replyUserId: this.replyUserId,
          content: this.replyContent
        })
        this.$modal.msgSuccess('回复成功')
        this.cancelReply()
        await this.getList()
        return true
      } finally {
        this.submitting = false
      }
    },
    async handleDelete(comment) {
      try {
        await this.$modal.confirm('确认删除这条评论吗？')
        await KnowledgeDocumentCommentApi.deleteKnowledgeDocumentComment(comment.id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消时保留评论。
      }
    }
  }
}
</script>

<style scoped>
.knowledge-comment-avatar {
  flex-shrink: 0;
  color: #fff;
  background: #409eff;
}

.comment-editor {
  margin-bottom: 16px;
}

.comment-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.comment-row,
.reply-row {
  display: flex;
  gap: 12px;
}

.comment-row {
  padding: 16px 0;
  font-size: 14px;
  line-height: 1.6;
  border-bottom: 1px solid #ebeef5;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta,
.comment-actions,
.reply-editor {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-meta,
.reply-target {
  color: #909399;
  font-size: 12px;
}

.comment-user {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.comment-content {
  margin-top: 4px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.comment-actions {
  margin-top: 6px;
  gap: 12px;
}

.comment-actions .el-button {
  margin: 0;
  padding: 0;
}

.reply-row {
  margin-top: 12px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  gap: 10px;
}

.reply-target {
  margin-top: 4px;
}

.reply-editor {
  margin-top: 8px;
  gap: 8px;
}

.reply-editor .el-button {
  margin: 0;
}

.danger-text {
  color: #f56c6c;
}
</style>
