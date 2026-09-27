<template>
  <el-card shadow="never" class="vote-card">
    <div slot="header" class="vote-header">
      <span>投票（{{ getDiscussionVoteModeName(detail.voteMultiple) }}）</span>
      <el-tag :type="voteStatusTagType">{{ voteStatusText }}</el-tag>
    </div>
    <div class="vote-time">
      {{ formatDate(detail.voteStartTime) }} 至 {{ formatDate(detail.voteEndTime) }}
    </div>
    <el-checkbox-group v-if="detail.voteMultiple" v-model="selectedOptionIds">
      <div v-for="option in detail.voteOptions" :key="option.id" class="vote-option">
        <el-checkbox :label="option.id" :disabled="voteStatus !== 'ongoing' || !!option.voted">
          {{ option.title }}（{{ option.voteCount || 0 }} 票）
        </el-checkbox>
        <el-progress
          :percentage="getVotePercentage(option)"
          :color="option.color || undefined"
          :stroke-width="8"
        />
        <el-popover
          v-if="option.voterUserNames && option.voterUserNames.length"
          trigger="click"
          title="投票人"
          width="240"
        >
          <el-button slot="reference" type="text">查看投票人</el-button>
          <div class="voter-names">{{ option.voterUserNames.join('、') }}</div>
        </el-popover>
      </div>
    </el-checkbox-group>
    <el-radio-group v-else v-model="selectedOptionId" class="vote-radio-group">
      <div v-for="option in detail.voteOptions" :key="option.id" class="vote-option">
        <el-radio :label="option.id" :disabled="voteDisabled">
          {{ option.title }}（{{ option.voteCount || 0 }} 票）
        </el-radio>
        <el-progress
          :percentage="getVotePercentage(option)"
          :color="option.color || undefined"
          :stroke-width="8"
        />
        <el-popover
          v-if="option.voterUserNames && option.voterUserNames.length"
          trigger="click"
          title="投票人"
          width="240"
        >
          <el-button slot="reference" type="text">查看投票人</el-button>
          <div class="voter-names">{{ option.voterUserNames.join('、') }}</div>
        </el-popover>
      </div>
    </el-radio-group>
    <el-button v-if="!voteDisabled" type="primary" :loading="submitLoading" @click="submitVote">
      提交投票
    </el-button>
    <el-tag v-else-if="hasVoted" type="success">已投票</el-tag>
  </el-card>
</template>

<script>
import * as DiscussionVoteApi from '@/api/oa/discussion/vote'
import { formatDate } from '@/utils/formatTime'
import { getDiscussionVoteModeName } from '@/views/oa/utils/format-collab'

export default {
  name: 'OaDiscussionVote',
  props: {
    detail: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedOptionIds: [],
      selectedOptionId: undefined,
      submitLoading: false
    }
  },
  computed: {
    hasVoted() {
      return (this.detail.voteOptions || []).some(item => item.voted)
    },
    votedOptionIds() {
      return (this.detail.voteOptions || []).filter(item => item.voted).map(item => item.id)
    },
    voteStatus() {
      const now = Date.now()
      const startTime = new Date(this.detail.voteStartTime || 0).getTime()
      const endTime = new Date(this.detail.voteEndTime || 0).getTime()
      if (now < startTime) {
        return 'notStarted'
      }
      return now > endTime ? 'ended' : 'ongoing'
    },
    voteStatusText() {
      return this.voteStatus === 'notStarted' ? '未开始' : this.voteStatus === 'ended' ? '已结束' : '进行中'
    },
    voteStatusTagType() {
      return this.voteStatus === 'ongoing' ? 'success' : this.voteStatus === 'ended' ? 'info' : 'warning'
    },
    voteDisabled() {
      if (this.voteStatus !== 'ongoing') {
        return true
      }
      return this.detail.voteMultiple
        ? this.votedOptionIds.length >= (this.detail.voteOptions || []).length
        : this.hasVoted
    },
    voteCount() {
      return (this.detail.voteOptions || []).reduce((total, item) => total + (item.voteCount || 0), 0)
    }
  },
  watch: {
    detail: {
      handler(discussion) {
        this.selectedOptionIds = (discussion.voteOptions || []).filter(item => item.voted).map(item => item.id)
        this.selectedOptionId = this.selectedOptionIds[0]
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    formatDate,
    getDiscussionVoteModeName,
    /** 获得投票选项百分比 */
    getVotePercentage(option) {
      return this.voteCount > 0 ? Math.round(((option.voteCount || 0) / this.voteCount) * 100) : 0
    },
    /** 提交投票 */
    submitVote() {
      if (!this.detail.id || this.submitLoading) return
      // 校验投票选项
      const optionIds = this.detail.voteMultiple
        ? this.selectedOptionIds.filter(optionId => this.votedOptionIds.indexOf(optionId) === -1)
        : this.selectedOptionId ? [this.selectedOptionId] : []
      if (optionIds.length === 0) {
        this.$modal.msgWarning('请选择投票选项')
        return
      }
      // 提交投票
      this.submitLoading = true
      DiscussionVoteApi.voteDiscussion(this.detail.id, optionIds).then(() => {
        this.$modal.msgSuccess('投票成功')
        // 刷新投票结果
        this.$emit('success')
      }).finally(() => {
        this.submitLoading = false
      })
    }
  }
}
</script>

<style scoped>
.vote-card {
  margin: 16px 0;
}

.vote-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vote-time {
  margin-bottom: 12px;
  font-size: 13px;
  color: #909399;
}

.vote-option {
  margin-bottom: 14px;
}

.vote-radio-group {
  display: block;
}

.voter-names {
  word-break: break-word;
}
</style>
