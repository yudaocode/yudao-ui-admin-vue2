<template>
  <div v-loading="loading || commentLoading" class="comment-list">
    <div class="comment-header">
      <span class="comment-title">流程评论</span>
      <span class="comment-count">共 {{ comments.length }} 条</span>
    </div>
    <el-empty v-if="comments.length === 0" description="暂无评论" />
    <div v-else class="comment-timeline">
      <div
        v-for="(comment, index) in comments"
        :key="comment.id"
        class="comment-item"
      >
        <div v-if="index < comments.length - 1" class="comment-line" />
        <div
          class="comment-icon"
          :style="{ backgroundColor: getCommentColor(comment.type) }"
        >
          {{ getCommentText(comment.type) }}
        </div>
        <div class="comment-content">
          <div class="comment-row">
            <div class="comment-user">
              <el-avatar v-if="comment.user && comment.user.avatar" :size="28" :src="comment.user.avatar" />
              <el-avatar v-else :size="28">
                {{ getUserInitial(comment.user) }}
              </el-avatar>
              <span>{{ getUserName(comment.user) }}</span>
            </div>
            <dict-tag :type="DICT_TYPE.BPM_COMMENT_TYPE" :value="comment.type" />
            <div v-if="comment.task && comment.task.name" class="comment-task">
              <i class="el-icon-connection" />
              <span>任务</span>
              <strong>{{ comment.task.name }}</strong>
            </div>
            <span class="comment-time">{{ parseTime(comment.createTime) }}</span>
          </div>
          <div class="comment-message">{{ comment.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DICT_TYPE, getDictData } from '@/utils/dict'
import { getCommentListByProcessInstanceId } from '@/api/bpm/comment'

export default {
  name: 'ProcessInstanceCommentList',
  props: {
    id: {
      type: [String, Number],
      default: undefined
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      DICT_TYPE,
      commentLoading: false, // 评论列表的加载中
      comments: [], // 评论列表
      listRequestId: 0,
      commentColorMap: {
        primary: '#409eff',
        success: '#67c23a',
        warning: '#e6a23c',
        danger: '#f56c6c',
        error: '#f56c6c',
        info: '#909399',
        default: '#909399'
      } // 评论类型颜色映射
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.getList()
      }
    }
  },
  methods: {
    /** 查询评论列表 */
    async getList() {
      const requestId = ++this.listRequestId
      const processInstanceId = this.id
      if (!processInstanceId) {
        this.comments = []
        return
      }
      this.commentLoading = true
      try {
        const response = await getCommentListByProcessInstanceId(processInstanceId)
        if (requestId === this.listRequestId && processInstanceId === this.id) {
          this.comments = response.data || []
        }
      } finally {
        if (requestId === this.listRequestId) {
          this.commentLoading = false
        }
      }
    },
    /** 获得评论类型简称 */
    getCommentText(type) {
      const dict = getDictData(DICT_TYPE.BPM_COMMENT_TYPE, type)
      return ((dict && dict.label) || '评论').slice(0, 1)
    },
    /** 获得评论类型颜色 */
    getCommentColor(type) {
      const dict = getDictData(DICT_TYPE.BPM_COMMENT_TYPE, type)
      const colorType = (dict && dict.colorType) || 'primary'
      return (dict && dict.cssClass) || this.commentColorMap[colorType] || this.commentColorMap.primary
    },
    /** 获得评论人名称 */
    getUserName(user) {
      return (user && user.nickname) || '系统'
    },
    /** 获得评论人首字 */
    getUserInitial(user) {
      return this.getUserName(user).slice(0, 1)
    }
  }
}
</script>

<style scoped>
.comment-list {
  min-height: 360px;
  padding: 24px 28px;
}

.comment-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.comment-title {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.comment-count {
  color: #909399;
  font-size: 14px;
}

.comment-timeline {
  padding: 24px 0 0 8px;
}

.comment-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding-bottom: 28px;
}

.comment-line {
  position: absolute;
  top: 32px;
  bottom: 0;
  left: 16px;
  width: 1px;
  background: #e4e7ed;
}

.comment-icon {
  z-index: 1;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  color: #fff;
  font-weight: 600;
  line-height: 32px;
  text-align: center;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgb(0 0 0 / 12%);
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-row {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 32px;
}

.comment-user {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  color: #303133;
  font-weight: 600;
}

.comment-task {
  display: inline-flex;
  max-width: 420px;
  height: 26px;
  gap: 6px;
  align-items: center;
  padding: 0 8px;
  overflow: hidden;
  color: #606266;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
}

.comment-task i,
.comment-task span {
  flex-shrink: 0;
  color: #409eff;
}

.comment-task strong {
  overflow: hidden;
  color: #303133;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-time {
  flex-shrink: 0;
  margin-left: auto;
  color: #909399;
  font-size: 13px;
}

.comment-message {
  padding: 12px 14px;
  margin-top: 8px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  background: #f7f8fa;
  border-radius: 4px;
}
</style>
