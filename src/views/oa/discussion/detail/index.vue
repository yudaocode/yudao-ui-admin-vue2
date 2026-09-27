<template>
  <div v-loading="loading" class="app-container oa-discussion-detail">
    <template v-if="detail">
      <!-- 主题正文 -->
      <div class="detail-wrap">
        <h1 class="detail-title">{{ detail.title }}</h1>
        <div class="detail-meta">
          <el-avatar :size="36">{{ detail.userName ? detail.userName.slice(0, 1) : '' }}</el-avatar>
          <span class="detail-author">{{ detail.userName }}</span>
          <span>{{ formatDate(detail.createTime) }}</span>
        </div>
        <el-divider class="detail-divider" />
        <div
          v-dompurify-html="detail.content || ''"
          class="oa-discussion-content"
        />
        <!-- 附件 -->
        <div v-if="detail.fileUrls && detail.fileUrls.length" class="detail-files">
          <h3 class="detail-files-title">附件</h3>
          <el-link
            v-for="(url, index) in detail.fileUrls"
            :key="url"
            :href="url"
            target="_blank"
            class="file-link"
          >附件 {{ index + 1 }}</el-link>
        </div>
        <!-- 投票 -->
        <oa-discussion-vote
          v-if="detail.type === OA_DISCUSSION_TYPE.VOTE"
          :detail="detail"
          @success="getDetail()"
        />
        <!-- 点赞统计，名单按需展开 -->
        <div class="detail-actions">
          <el-button type="text" @click="$refs.replyRef.focusReply()">回复</el-button>
          <span class="action-stat">浏览（{{ detail.visitCount || 0 }}）</span>
          <span class="action-stat">回复（{{ detail.replyCount || 0 }}）</span>
          <el-button type="text" :loading="likeLoading" @click="handleDiscussionLike">
            {{ detail.liked ? '取消点赞' : '点赞' }}（{{ detail.likeCount || 0 }}）
          </el-button>
        </div>
        <!-- 点赞人摘要 -->
        <div v-if="detail.likeUserNames && detail.likeUserNames.length" class="like-summary">
          {{ detail.likeUserNames.slice(0, 3).join('、') }}，
          <el-popover trigger="click" title="点赞人" width="260">
            <el-button slot="reference" type="text">共 {{ detail.likeCount || 0 }} 人觉得很赞</el-button>
            <div class="like-names">{{ detail.likeUserNames.join('、') }}</div>
          </el-popover>
        </div>
      </div>
      <!-- 讨论楼层 -->
      <oa-discussion-reply ref="replyRef" :key="detail.id" :detail="detail" @success="getDetail()" />
    </template>
  </div>
</template>

<script>
import * as DiscussionApi from '@/api/oa/discussion'
import * as DiscussionLikeApi from '@/api/oa/discussion/like'
import { formatDate } from '@/utils/formatTime'
import { OA_DISCUSSION_TYPE } from '@/views/oa/utils/constants-collab'
import OaDiscussionReply from './OaDiscussionReply.vue'
import OaDiscussionVote from './OaDiscussionVote.vue'

export default {
  name: 'OaDiscussionDetail',
  components: { OaDiscussionReply, OaDiscussionVote },
  data() {
    return {
      OA_DISCUSSION_TYPE,
      loading: false,
      likeLoading: false,
      detail: undefined
    }
  },
  watch: {
    '$route.params.id': {
      handler(id) {
        if (this.$route.name !== 'OaDiscussionDetail' || !id) return
        this.detail = undefined
        this.loading = true
        // 只有进入页面时记录访问
        this.getDetail(true).finally(() => {
          this.loading = false
        })
      },
      immediate: true
    }
  },
  methods: {
    formatDate,
    /** 查询讨论详情，visit 为 true 时记录访问 */
    getDetail(visit = false) {
      return DiscussionApi.getDiscussion(Number(this.$route.params.id), visit).then(response => {
        this.detail = response.data
      })
    },
    /** 点赞或取消点赞 */
    handleDiscussionLike() {
      if (!this.detail || !this.detail.id || this.likeLoading) return
      this.likeLoading = true
      const request = this.detail.liked
        ? DiscussionLikeApi.deleteDiscussionLike(this.detail.id)
        : DiscussionLikeApi.createDiscussionLike(this.detail.id)
      request.then(() => {
        return this.getDetail()
      }).finally(() => {
        this.likeLoading = false
      })
    }
  }
}
</script>

<style scoped>
.detail-wrap {
  padding: 20px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.detail-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
  line-height: 36px;
  word-break: break-word;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.detail-author {
  color: #303133;
}

.detail-divider {
  margin: 16px 0;
}

.oa-discussion-content {
  font-size: 15px;
  line-height: 28px;
  word-break: break-word;
}

.oa-discussion-content >>> > :first-child {
  margin-top: 0;
}

.oa-discussion-content >>> > :last-child {
  margin-bottom: 0;
}

.oa-discussion-content >>> img {
  max-width: 100%;
  height: auto;
}

.oa-discussion-content >>> table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}

.oa-discussion-content >>> pre {
  overflow-x: auto;
}

.detail-files {
  padding-top: 12px;
  margin-top: 16px;
  border-top: 1px solid #ebeef5;
}

.detail-files-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
}

.file-link {
  margin-right: 16px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  margin-top: 16px;
  border-top: 1px solid #ebeef5;
}

.detail-actions .el-button {
  margin-left: 0;
}

.action-stat {
  font-size: 13px;
  color: #909399;
}

.like-summary {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.like-names {
  word-break: break-word;
}
</style>
