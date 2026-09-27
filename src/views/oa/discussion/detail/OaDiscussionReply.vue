<template>
  <div class="reply-wrap">
    <!-- 回复标题和筛选 -->
    <div class="reply-toolbar">
      <h3 class="reply-title">回复 {{ detail.replyCount || 0 }}</h3>
      <div class="reply-filters">
        <el-select v-model="replyScope" style="width: 120px" size="small" @change="handleReplyScopeChange">
          <el-option label="查看所有" value="all" />
          <el-option label="只看楼主" value="owner" />
          <el-option label="只看我的" value="mine" />
        </el-select>
        <el-select v-model="replySortOrder" style="width: 120px" size="small" @change="handleReplySortChange">
          <el-option label="时间升序" value="asc" />
          <el-option label="时间降序" value="desc" />
        </el-select>
      </div>
    </div>
    <!-- 发表主回复 -->
    <div v-if="replyVisible" class="reply-editor">
      <el-input
        ref="replyInputRef"
        v-model="replyContent"
        type="textarea"
        :rows="3"
        maxlength="255"
        show-word-limit
        placeholder="分享你的看法，参与讨论"
      />
      <div class="reply-actions">
        <el-button size="small" :disabled="submitLoading" @click="handleCancelReply">取消</el-button>
        <el-button
          type="primary"
          size="small"
          :loading="submitLoading"
          :disabled="!replyContent.trim()"
          @click="submitReply()"
        >发表回复</el-button>
      </div>
    </div>
    <!-- 主回复按楼层分页 -->
    <div v-loading="replyLoading">
      <div
        v-for="(reply, index) in replyList"
        :key="reply.id"
        class="reply-floor"
      >
        <div class="floor-header">
          <el-avatar :size="36">{{ reply.userName ? reply.userName.slice(0, 1) : '' }}</el-avatar>
          <div>
            <span class="floor-author">{{ reply.userName }}</span>
            <el-tag
              v-if="reply.userId === detail.userId"
              size="small"
              effect="plain"
              class="owner-tag"
            >楼主</el-tag>
            <div class="floor-time">{{ formatDate(reply.createTime) }}</div>
          </div>
        </div>
        <div class="floor-content">{{ reply.content }}</div>
        <!-- 楼层操作与楼层编号 -->
        <div class="floor-toolbar">
          <div class="floor-ops">
            <el-button type="text" @click="handleReply(reply, reply.id)">回复</el-button>
            <el-button type="text" @click="handleReplyLike(reply)">
              {{ reply.liked ? '取消点赞' : '点赞' }}（{{ reply.likeCount || 0 }}）
            </el-button>
            <el-button
              v-if="getChildReplies(reply).length"
              type="text"
              :aria-expanded="!!expandedReplies[reply.id]"
              @click="$set(expandedReplies, reply.id, !expandedReplies[reply.id])"
            >{{ expandedReplies[reply.id] ? '收起评论' : '展开评论' }}（{{ getChildReplies(reply).length }}）</el-button>
            <el-button
              v-if="detail.userId === currentUserId || isSuperAdmin"
              type="text"
              class="danger-text"
              @click="handleDeleteReply(reply.id)"
            >删除</el-button>
          </div>
          <span class="floor-number">{{ (replyQueryParams.pageNo - 1) * replyQueryParams.pageSize + index + 1 }} 楼</span>
        </div>
        <!-- 点赞摘要，完整名单按需查看 -->
        <div v-if="reply.likeUserNames && reply.likeUserNames.length" class="like-summary">
          {{ reply.likeUserNames.slice(0, 3).join('、') }}，
          <el-popover trigger="click" title="点赞人" width="260">
            <el-button slot="reference" type="text">共 {{ reply.likeCount || 0 }} 人觉得很赞</el-button>
            <div class="like-names">{{ reply.likeUserNames.join('、') }}</div>
          </el-popover>
        </div>
        <!-- 楼层内评论使用紧凑列表 -->
        <div
          v-if="expandedReplies[reply.id] && getChildReplies(reply).length"
          class="child-replies"
        >
          <div
            v-for="child in getChildReplies(reply)"
            :key="child.id"
            class="child-reply"
          >
            <div class="child-main">
              <el-avatar :size="24">{{ child.userName ? child.userName.slice(0, 1) : '' }}</el-avatar>
              <div class="child-content">
                <span class="child-author">{{ child.userName }}：</span>
                <span v-if="child.replyUserName" class="child-reply-to">
                  @{{ child.replyUserName }}
                </span>
                <span class="child-text">{{ child.content }}</span>
              </div>
            </div>
            <div class="child-ops">
              <span class="child-time">{{ formatDate(child.createTime) }}</span>
              <el-button type="text" @click="handleReply(child, reply.id)">回复</el-button>
              <el-button
                v-if="detail.userId === currentUserId || isSuperAdmin"
                type="text"
                class="danger-text"
                @click="handleDeleteReply(child.id)"
              >删除</el-button>
            </div>
          </div>
        </div>
        <!-- 在所选楼层内回复，保持实际被回复人 -->
        <div v-if="replyTarget && replyRootId === reply.id" class="inline-reply">
          <el-input
            v-model="inlineContent"
            type="textarea"
            :rows="2"
            maxlength="255"
            show-word-limit
            :placeholder="'回复 ' + replyTarget.userName"
          />
          <div class="reply-actions">
            <el-button size="small" :disabled="submitLoading" @click="handleCancelReply">取消</el-button>
            <el-button
              type="primary"
              size="small"
              :loading="submitLoading"
              :disabled="!inlineContent.trim()"
              @click="submitReply(replyTarget)"
            >发表回复</el-button>
          </div>
        </div>
      </div>
      <el-empty
        v-if="!replyLoading && replyList.length === 0"
        description="暂无回复"
        :image-size="60"
      />
      <pagination
        v-if="replyTotal > 0"
        :total="replyTotal"
        :page.sync="replyQueryParams.pageNo"
        :limit.sync="replyQueryParams.pageSize"
        @pagination="getReplyList"
      />
    </div>
  </div>
</template>

<script>
import * as DiscussionLikeApi from '@/api/oa/discussion/like'
import * as DiscussionReplyApi from '@/api/oa/discussion/reply'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaDiscussionReply',
  props: {
    detail: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      inlineContent: '',
      submitLoading: false,
      replyLoading: false,
      replyList: [],
      replyTotal: 0,
      replyContent: '',
      replyVisible: false,
      replyRootId: undefined,
      expandedReplies: {},
      replyTarget: undefined,
      replyScope: 'all',
      replySortOrder: 'asc',
      replyQueryParams: {
        pageNo: 1,
        pageSize: 10,
        discussionId: undefined,
        userId: undefined,
        sortingFields: [{ field: 'createTime', order: 'asc' }]
      }
    }
  },
  computed: {
    currentUserId() {
      return this.$store.getters.userId
    },
    isSuperAdmin() {
      return (this.$store.getters.roles || []).includes('super_admin')
    }
  },
  created() {
    this.replyQueryParams.discussionId = this.detail.id
    this.getReplyList()
  },
  methods: {
    formatDate,
    /** 定位到主回复输入框 */
    focusReply() {
      this.handleCancelReply()
      this.replyVisible = true
      this.$nextTick(() => {
        const input = this.$refs.replyInputRef
        if (input && input.$el) {
          input.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          input.focus()
        }
      })
    },
    /** 取消回复，收起输入框并清空内容 */
    handleCancelReply() {
      this.replyVisible = false
      this.replyContent = ''
      this.replyTarget = undefined
      this.replyRootId = undefined
      this.inlineContent = ''
    },
    getReplyList() {
      if (!this.replyQueryParams.discussionId) return Promise.resolve()
      this.replyLoading = true
      return DiscussionReplyApi.getDiscussionReplyPage(this.replyQueryParams).then(response => {
        const data = response.data
        this.replyList = data.list
        this.replyTotal = data.total
      }).finally(() => {
        this.replyLoading = false
      })
    },
    /** 回复查看范围切换操作 */
    handleReplyScopeChange() {
      this.replyQueryParams.userId =
        this.replyScope === 'owner'
          ? this.detail.userId
          : this.replyScope === 'mine'
            ? this.currentUserId
            : undefined
      this.replyQueryParams.pageNo = 1
      return this.getReplyList()
    },
    /** 回复时间排序切换操作 */
    handleReplySortChange() {
      this.replyQueryParams.sortingFields = [{ field: 'createTime', order: this.replySortOrder }]
      this.replyQueryParams.pageNo = 1
      return this.getReplyList()
    },
    /** 点赞回复 */
    handleReplyLike(reply) {
      // 发起点赞或取消点赞
      const request = reply.liked
        ? DiscussionLikeApi.deleteDiscussionLike(undefined, reply.id)
        : DiscussionLikeApi.createDiscussionLike(undefined, reply.id)
      return request.then(() => {
        // 刷新回复列表
        return this.getReplyList()
      })
    },
    /** 设置回复对象 */
    handleReply(reply, rootId) {
      this.handleCancelReply()
      this.replyRootId = rootId
      this.inlineContent = ''
      this.replyTarget = reply
    },
    /** 获得楼层内的回复，保持父子关系顺序 */
    getChildReplies(reply) {
      return (reply.children || []).flatMap(child => [child, ...this.getChildReplies(child)])
    },
    /** 发表主回复或楼层内回复 */
    submitReply(target) {
      if (this.submitLoading) return Promise.resolve()
      this.submitLoading = true
      // 提交回复
      return DiscussionReplyApi.createDiscussionReply({
        discussionId: this.detail.id,
        parentId: target ? target.id : 0,
        content: target ? this.inlineContent : this.replyContent
      }).then(() => {
        this.$modal.msgSuccess('回复成功')
        // 清空对应输入框并刷新楼层
        if (target) {
          // 发表成功后展开所属楼层，便于查看刚提交的评论
          this.$set(this.expandedReplies, this.replyRootId, true)
          this.inlineContent = ''
          this.replyTarget = undefined
        } else {
          this.replyContent = ''
          this.replyVisible = false
          this.replyQueryParams.pageNo = 1
        }
        return this.getReplyList()
      }).then(() => {
        this.$emit('success')
      }).finally(() => {
        this.submitLoading = false
      })
    },
    /** 删除回复及其子回复 */
    handleDeleteReply(id) {
      return this.$modal.confirm('是否确认删除回复编号为“' + id + '”的数据项？').then(() => {
        return DiscussionReplyApi.deleteDiscussionReply(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.replyTarget = undefined
        return this.getReplyList()
      }).then(() => {
        // 删除最后一层后返回上一页
        if (!this.replyList.length && this.replyQueryParams.pageNo > 1) {
          this.replyQueryParams.pageNo--
          return this.getReplyList()
        }
      }).then(() => {
        this.$emit('success')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.reply-wrap {
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.reply-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: #f5f7fa;
}

.reply-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.reply-filters {
  display: flex;
  gap: 8px;
}

.reply-editor {
  margin-bottom: 12px;
}

.reply-actions {
  margin-top: 8px;
  text-align: right;
}

.reply-floor {
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
}

.floor-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.floor-author {
  font-weight: 500;
}

.owner-tag {
  margin-left: 8px;
}

.floor-time {
  margin-top: 2px;
  font-size: 12px;
  color: #909399;
}

.floor-content {
  margin: 8px 0;
  line-height: 28px;
  white-space: pre-wrap;
  word-break: break-word;
}

.floor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.floor-ops {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.floor-ops .el-button {
  margin-left: 0;
}

.floor-number {
  flex-shrink: 0;
  font-size: 12px;
  color: #909399;
}

.like-summary {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.like-names {
  word-break: break-word;
  line-height: 28px;
}

.child-replies {
  padding-left: 12px;
  margin-top: 8px;
  border-left: 1px solid #ebeef5;
}

.child-reply {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px 12px;
  padding: 8px 0;
  border-top: 1px solid #ebeef5;
}

.child-main {
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.child-content {
  min-width: 0;
  font-size: 13px;
  line-height: 24px;
  word-break: break-word;
}

.child-author {
  color: #409eff;
}

.child-reply-to {
  margin-right: 4px;
  color: #909399;
}

.child-text {
  white-space: pre-wrap;
}

.child-ops {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.child-ops .el-button {
  margin-left: 0;
}

.child-time {
  font-size: 12px;
  color: #909399;
}

.inline-reply {
  margin-top: 8px;
}

.danger-text {
  color: #f56c6c;
}
</style>
