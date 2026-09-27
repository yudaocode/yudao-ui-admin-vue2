<template>
  <div class="work-item-comment" v-loading="loading">
    <el-divider v-if="showTitle" content-position="left">评论</el-divider>
    <div v-if="editable" class="comment-create">
      <el-avatar class="comment-avatar" :size="34" :src="loginUser.avatar">
        {{ loginUser.nickname ? loginUser.nickname.slice(0, 1) : '' }}
      </el-avatar>
      <div class="comment-main">
        <el-input
          v-model="newContent"
          :rows="3"
          maxlength="2000"
          placeholder="请输入评论内容"
          show-word-limit
          type="textarea"
        />
        <div class="comment-submit">
          <el-button :loading="submitting" type="primary" @click="submitRootComment">发表评论</el-button>
        </div>
      </div>
    </div>
    <el-empty v-if="commentList.length === 0" description="暂无评论" :image-size="72" />
    <div v-for="comment in commentList" :key="comment.id" class="comment-row">
      <el-avatar class="comment-avatar" :size="32">
        {{ comment.userName ? comment.userName.slice(0, 1) : '' }}
      </el-avatar>
      <div class="comment-main">
        <div class="comment-heading">
          <span class="comment-user">{{ comment.userName || '-' }}</span>
          <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
        </div>
        <el-input
          v-if="editingId === comment.id"
          v-model="editingContent"
          class="comment-edit-input"
          :rows="2"
          maxlength="2000"
          type="textarea"
        />
        <div v-else class="comment-content">{{ comment.content }}</div>
        <div v-if="editable" class="comment-actions">
          <template v-if="comment.userId === loginUserId">
            <el-button v-if="editingId !== comment.id" type="text" @click="startEdit(comment)">编辑</el-button>
            <el-button v-else type="text" @click="submitEdit(comment)">保存</el-button>
            <el-button v-if="editingId === comment.id" type="text" @click="cancelEdit">取消</el-button>
            <el-popconfirm
              cancel-button-text="取消"
              confirm-button-text="确定"
              title="确认删除这条评论吗？"
              @confirm="handleDelete(comment)"
            >
              <el-button slot="reference" class="danger-button" type="text">删除</el-button>
            </el-popconfirm>
          </template>
          <el-button type="text" @click="startReply(comment, comment)">回复</el-button>
        </div>

        <div v-for="reply in comment.children || []" :key="reply.id" class="reply-row">
          <el-avatar class="comment-avatar" :size="28">
            {{ reply.userName ? reply.userName.slice(0, 1) : '' }}
          </el-avatar>
          <div class="comment-main">
            <div class="comment-heading">
              <span class="comment-user">{{ reply.userName || '-' }}</span>
              <span class="comment-time">{{ formatDate(reply.createTime) }}</span>
            </div>
            <div v-if="reply.replyUserName" class="reply-target">回复 @{{ reply.replyUserName }}</div>
            <el-input
              v-if="editingId === reply.id"
              v-model="editingContent"
              class="comment-edit-input"
              :rows="2"
              maxlength="2000"
              type="textarea"
            />
            <div v-else class="comment-content reply-content">{{ reply.content }}</div>
            <div v-if="editable" class="comment-actions">
              <template v-if="reply.userId === loginUserId">
                <el-button v-if="editingId !== reply.id" type="text" @click="startEdit(reply)">编辑</el-button>
                <el-button v-else type="text" @click="submitEdit(reply)">保存</el-button>
                <el-button v-if="editingId === reply.id" type="text" @click="cancelEdit">取消</el-button>
                <el-popconfirm
                  cancel-button-text="取消"
                  confirm-button-text="确定"
                  title="确认删除这条评论吗？"
                  @confirm="handleDelete(reply)"
                >
                  <el-button slot="reference" class="danger-button" type="text">删除</el-button>
                </el-popconfirm>
              </template>
              <el-button type="text" @click="startReply(comment, reply)">回复</el-button>
            </div>
          </div>
        </div>

        <div v-if="replyMainId === comment.id" class="reply-create">
          <el-input
            v-model="replyContent"
            :placeholder="`回复 ${replyUserName}`"
            maxlength="2000"
            @keyup.enter.native="submitReply"
          />
          <el-button :loading="submitting" type="primary" @click="submitReply">回复</el-button>
          <el-button @click="cancelReply">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as WorkItemCommentApi from '@/api/pms/pm/workitem/comment'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'PmsWorkItemComment',
  props: {
    workItemId: { type: Number, required: true },
    editable: { type: Boolean, required: true },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      submitting: false,
      commentList: [],
      newContent: '',
      replyMainId: undefined,
      replyUserId: undefined,
      replyUserName: '',
      replyContent: '',
      editingId: undefined,
      editingContent: ''
    }
  },
  computed: {
    loginUser() {
      const getters = this.$store.getters || {}
      return {
        id: getters.userId,
        nickname: getters.nickname || getters.name || '',
        avatar: getters.avatar
      }
    },
    loginUserId() {
      return this.loginUser.id
    }
  },
  watch: {
    workItemId: { immediate: true, handler: 'getCommentList' }
  },
  methods: {
    formatDate,
    async getCommentList() {
      if (!this.workItemId) return
      this.loading = true
      try {
        const response = await WorkItemCommentApi.getWorkItemCommentList(this.workItemId)
        this.commentList = response.data
      } finally {
        this.loading = false
      }
    },
    async submitRootComment() {
      if (!this.newContent.trim()) return this.$message.warning('请输入评论内容')
      this.submitting = true
      try {
        await WorkItemCommentApi.createWorkItemComment({
          ...this.getDefaultCommentData(),
          content: this.newContent
        })
        this.$message.success('评论成功')
        this.newContent = ''
        await this.getCommentList()
        this.$emit('changed')
      } finally {
        this.submitting = false
      }
    },
    startReply(mainComment, targetComment) {
      this.replyMainId = mainComment.id
      this.replyUserId = targetComment.userId
      this.replyUserName = targetComment.userName || '-'
      this.replyContent = ''
    },
    cancelReply() {
      this.replyMainId = undefined
      this.replyUserId = undefined
      this.replyUserName = ''
      this.replyContent = ''
    },
    async submitReply() {
      if (!this.replyContent.trim() || !this.replyMainId) return this.$message.warning('请输入回复内容')
      this.submitting = true
      try {
        await WorkItemCommentApi.createWorkItemComment({
          ...this.getDefaultCommentData(),
          mainId: this.replyMainId,
          replyUserId: this.replyUserId,
          content: this.replyContent
        })
        this.$message.success('回复成功')
        this.cancelReply()
        await this.getCommentList()
        this.$emit('changed')
      } finally {
        this.submitting = false
      }
    },
    startEdit(comment) {
      this.editingId = comment.id
      this.editingContent = comment.content
    },
    cancelEdit() {
      this.editingId = undefined
      this.editingContent = ''
    },
    async submitEdit(comment) {
      if (!this.editingContent.trim()) return this.$message.warning('请输入评论内容')
      await WorkItemCommentApi.updateWorkItemComment({ ...comment, content: this.editingContent })
      this.$message.success('更新成功')
      this.cancelEdit()
      await this.getCommentList()
      this.$emit('changed')
    },
    async handleDelete(comment) {
      await WorkItemCommentApi.deleteWorkItemComment(comment.id)
      this.$message.success('删除成功')
      await this.getCommentList()
      this.$emit('changed')
    },
    getDefaultCommentData() {
      return { workItemId: this.workItemId, content: '' }
    }
  }
}
</script>

<style scoped>
.comment-create, .comment-row, .reply-row, .reply-create { display: flex; gap: 12px; }
.comment-create { align-items: flex-start; margin-bottom: 20px; }
.comment-row { padding: 16px 0; border-bottom: 1px solid #ebeef5; font-size: 14px; line-height: 1.6; }
.comment-avatar { flex-shrink: 0; color: #fff; background: #409eff; }
.comment-main { flex: 1; min-width: 0; }
.comment-submit { display: flex; justify-content: flex-end; margin-top: 8px; }
.comment-heading { display: flex; align-items: center; gap: 10px; }
.comment-user { font-weight: 500; }
.comment-time, .reply-target { color: #909399; font-size: 12px; }
.comment-content { margin-top: 6px; white-space: pre-wrap; word-break: break-all; }
.comment-edit-input { margin: 8px 0; }
.comment-actions { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
.comment-actions .el-button { margin-left: 0; }
.reply-row { margin-top: 12px; padding: 12px 16px; border-radius: 4px; background: #f5f7fa; }
.reply-target, .reply-content { margin-top: 4px; }
.reply-create { margin-top: 10px; gap: 8px; }
.danger-button { color: #f56c6c; }
</style>
