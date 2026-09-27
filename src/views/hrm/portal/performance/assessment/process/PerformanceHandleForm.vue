<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="900px"
    append-to-body
  >
    <div v-loading="loading">
      <el-descriptions
        :column="3"
        border
        class="handle-summary"
      >
        <el-descriptions-item label="考核名称">{{ detail.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="被考核人">{{ detail.employeeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ detail.jobNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="当前节点">{{ currentStageName }}</el-descriptions-item>
        <el-descriptions-item label="绩效得分">{{ formatHrmScore(detail.score) }}</el-descriptions-item>
        <el-descriptions-item label="绩效等级">{{ detail.resultLevel || '-' }}</el-descriptions-item>
        <template v-if="mode === 'appeal'">
          <el-descriptions-item
            label="申诉原因"
            :span="3"
          >{{ detail.appealReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="申诉时间">{{ formatHrmDateTime(detail.appealSubmitTime) }}</el-descriptions-item>
          <el-descriptions-item
            label="申诉附件"
            :span="2"
          >
            <div
              v-if="detail.appealFileUrls && detail.appealFileUrls.length"
              class="appeal-files"
            >
              <el-link
                v-for="url in detail.appealFileUrls"
                :key="url"
                type="primary"
                :underline="false"
                @click="openSafeUrl(url)"
              >{{ getFileNameFromUrl(url) }}</el-link>
            </div><span v-else>-</span>
          </el-descriptions-item>
        </template>
      </el-descriptions>
      <el-table
        :data="detail.quotas || []"
        border
        class="quota-table"
        max-height="300"
      >
        <el-table-column
          label="维度"
          prop="dimensionName"
          min-width="120"
        /><el-table-column
          label="指标"
          prop="name"
          min-width="150"
          show-overflow-tooltip
        /><el-table-column
          label="目标值"
          prop="targetValue"
          min-width="120"
          show-overflow-tooltip
        /><el-table-column
          label="实际值"
          prop="actualValue"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="最终分"
          width="90"
          align="center"
        ><template slot-scope="scope">{{ formatHrmScore(scope.row.finalScore) }}</template></el-table-column>
      </el-table>
      <el-form label-width="110px">
        <el-form-item
          v-if="mode === 'result-audit'"
          label="退回评分节点"
        >
          <el-checkbox-group v-model="reviewStageIds">
            <el-checkbox
              v-for="stage in completedReviewStages"
              :key="stage.id"
              :label="stage.id"
            >{{ stage.name || '评分阶段' }}<span v-if="stage.handlerName">（{{ stage.handlerName }}）</span></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item
          v-else
          label="申诉评分节点"
        ><span>{{ appealReviewStageNames || '-' }}</span></el-form-item>
        <el-form-item label="处理意见"><el-input
          v-model="comment"
          :rows="3"
          maxlength="500"
          placeholder="请输入处理意见"
          show-word-limit
          type="textarea"
        /></el-form-item>
      </el-form>
    </div>
    <div slot="footer">
      <el-button
        :disabled="loading"
        @click="dialogVisible = false"
      >取 消</el-button>
      <el-button
        :loading="submitting"
        type="danger"
        @click="submitForm(false)"
      >驳 回</el-button>
      <el-button
        :loading="submitting"
        type="primary"
        @click="submitForm(true)"
      >通 过</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getFileNameFromUrl } from '@/utils/file'
import { openSafeUrl } from '@/utils/url'
import * as PerformanceAssessmentApi from '@/api/hrm/portal/performance/assessment'
import { HrmPerformanceAssessmentStageStatus, HrmPerformanceConfirmationResult } from '@/views/hrm/utils/constants'
import { formatHrmDateTime } from '@/views/hrm/utils/format'
import { formatHrmScore } from '@/views/hrm/portal/utils/format'

export default {
  name: 'HrmPortalPerformanceHandleForm',
  props: { mode: { type: String, required: true, validator: value => ['result-audit', 'appeal'].includes(value) }},
  data() { return { dialogVisible: false, loading: false, submitting: false, detail: {}, reviewStageIds: [], comment: '' } },
  computed: {
    title() { return this.mode === 'appeal' ? '绩效申诉确认' : '绩效结果审核' },
    currentStageName() { return this.detail.currentStage && this.detail.currentStage.name ? this.detail.currentStage.name : '-' },
    completedReviewStages() {
      return (this.detail.reviewStages || []).filter(stage => stage.id != null && stage.status === HrmPerformanceAssessmentStageStatus.PROCESSED)
    },
    appealReviewStageNames() {
      const selectedIds = new Set(this.detail.appealReviewStageIds || [])
      return this.completedReviewStages.filter(stage => selectedIds.has(stage.id)).map(stage => stage.name || '评分阶段').join('、')
    }
  },
  methods: {
    getFileNameFromUrl,
    openSafeUrl,
    formatHrmDateTime,
    formatHrmScore,
    async open(assessmentId, stageId) {
      if (!assessmentId || !stageId) return
      this.dialogVisible = true
      this.loading = true
      this.detail = {}
      this.reviewStageIds = []
      this.comment = ''
      try {
        const response = await PerformanceAssessmentApi.getPerformanceAssessment(assessmentId, stageId)
        this.detail = response.data
        const latestStage = this.completedReviewStages[this.completedReviewStages.length - 1]
        this.reviewStageIds = latestStage && latestStage.id ? [latestStage.id] : []
      } finally {
        this.loading = false
      }
    },
    async submitForm(pass) {
      if (!this.detail.id || !this.detail.currentStage || !this.detail.currentStage.id) return
      if (!pass && this.mode === 'result-audit' && !this.reviewStageIds.length) {
        this.$modal.msgWarning('请选择需要退回的评分节点')
        return
      }
      await this.$modal.confirm(`确认${pass ? '通过' : '驳回'}当前${this.title}？`)
      this.submitting = true
      try {
        const data = {
          assessmentId: this.detail.id,
          stageId: this.detail.currentStage.id,
          pass: pass ? HrmPerformanceConfirmationResult.PASS : HrmPerformanceConfirmationResult.REJECT,
          comment: this.comment.trim() || undefined,
          reviewStageIds: !pass && this.mode === 'result-audit' ? this.reviewStageIds : undefined
        }
        if (this.mode === 'appeal') await PerformanceAssessmentApi.handlePerformanceAssessmentAppeal(data)
        else await PerformanceAssessmentApi.handlePerformanceAssessmentResultAudit(data)
        this.$modal.msgSuccess(`${this.title}处理成功`)
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.handle-summary, .quota-table { margin-bottom: 16px; }
.appeal-files { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
