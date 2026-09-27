<template>
  <el-drawer
    title="绩效评分"
    :visible.sync="drawerVisible"
    size="880px"
    destroy-on-close
    append-to-body
  >
    <div
      v-loading="loading"
      class="review-body"
    >
      <div class="review-head">
        <div><div class="employee-name">{{ detail.employeeName || '-' }}</div><div class="assessment-name">{{ detail.name || '-' }}</div></div>
        <div class="stage-summary"><el-tag
          type="warning"
          effect="plain"
        >{{ currentStage && currentStage.name ? currentStage.name : '待评分' }}</el-tag><span>权重 {{ currentStage && currentStage.weight ? currentStage.weight : 0 }}%</span></div>
      </div>
      <div
        v-if="detail.reviewStages && detail.reviewStages.length"
        class="review-stages"
      >
        <div
          v-for="stage in detail.reviewStages"
          :key="stage.id"
          class="review-stage-row"
        >
          <div><span>{{ stage.name }}</span><span class="stage-handler">{{ stage.handlerName || '-' }}</span></div>
          <span>{{ stage.weight || 0 }}%</span>
          <el-tag
            v-if="stage.status === StageStatus.PROCESSED"
            type="success"
            effect="plain"
          >已完成</el-tag>
          <el-tag
            v-else-if="stage.status === StageStatus.PENDING"
            type="warning"
            effect="plain"
          >待评分</el-tag>
          <el-tag
            v-else
            type="info"
            effect="plain"
          >未开始</el-tag>
          <span class="stage-score">{{ stage.score == null ? '-' : stage.score }}</span>
        </div>
      </div>
      <el-alert
        v-if="currentStage && currentStage.rejectReason"
        class="review-alert"
        :closable="false"
        type="warning"
        show-icon
        :title="'评分被驳回：' + currentStage.rejectReason"
      />
      <div
        v-if="scorePreview"
        class="score-preview"
        aria-live="polite"
      >
        <div><span>本阶段试算</span><strong>{{ scorePreview.stageScore == null ? '-' : scorePreview.stageScore }} 分</strong><el-tag
          v-if="scorePreview.stageResultLevel"
          size="mini"
          effect="plain"
        >{{ scorePreview.stageResultLevel }}</el-tag></div>
        <div><span>当前累计分</span><strong>{{ scorePreview.cumulativeScore == null ? '-' : scorePreview.cumulativeScore }} 分</strong><el-tag
          v-if="scorePreview.cumulativeResultLevel"
          size="mini"
          type="success"
          effect="plain"
        >{{ scorePreview.cumulativeResultLevel }}</el-tag></div>
      </div>
      <el-alert
        class="score-alert"
        :closable="false"
        type="info"
        show-icon
        :title="scoreRangeTitle"
      />
      <el-table
        :data="detail.quotas || []"
        border
      >
        <el-table-column
          label="维度"
          prop="dimensionName"
          width="110"
          show-overflow-tooltip
        /><el-table-column
          label="指标"
          prop="name"
          min-width="145"
          show-overflow-tooltip
        /><el-table-column
          label="目标值"
          prop="targetValue"
          min-width="125"
          show-overflow-tooltip
        />
        <el-table-column
          label="实际值"
          min-width="125"
        ><template slot-scope="scope"><el-input
          v-model="scope.row.actualValue"
          maxlength="1000"
          placeholder="实际完成情况"
        /></template></el-table-column>
        <el-table-column
          label="评分"
          width="110"
        ><template slot-scope="scope"><el-input-number
          v-model="scope.row.finalScore"
          :min="0"
          :max="detail.upperLimitScore"
          :precision="2"
          :controls="false"
          aria-label="指标评分"
          style="width: 100%"
          @change="schedulePreview"
        /></template></el-table-column>
        <el-table-column
          label="评语"
          min-width="160"
        ><template slot-scope="scope"><el-input
          v-model="scope.row.comment"
          maxlength="1000"
          placeholder="指标评语"
        /></template></el-table-column>
      </el-table>
      <el-input
        v-model="stageComment"
        class="stage-comment"
        type="textarea"
        :rows="3"
        maxlength="2000"
        :placeholder="stageCommentPlaceholder"
        show-word-limit
      />
    </div>
    <div class="drawer-footer">
      <el-button
        v-if="canReject"
        :loading="submitting"
        plain
        type="danger"
        @click="rejectPreviousStage"
      >驳回上一阶段</el-button>
      <el-button @click="drawerVisible = false">取 消</el-button>
      <el-button
        :loading="submitting"
        type="primary"
        @click="submitReview"
      >提交评分</el-button>
    </div>
  </el-drawer>
</template>

<script>
import * as PerformanceAssessmentApi from '@/api/hrm/portal/performance/assessment'
import { HrmPerformanceAssessmentStageStatus, HrmPerformanceRaterType } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmPortalPerformanceReviewForm',
  data() {
    return {
      StageStatus: HrmPerformanceAssessmentStageStatus,
      drawerVisible: false,
      loading: false,
      submitting: false,
      detail: {},
      stageComment: '',
      scorePreview: undefined,
      previewTimer: undefined
    }
  },
  computed: {
    currentStage() { return this.detail.currentReviewStage },
    canReject() {
      const stage = this.currentStage
      return Boolean(stage && stage.rejectAuthority === true && (this.detail.reviewStages || []).some(item => item.status === HrmPerformanceAssessmentStageStatus.PROCESSED && Number(item.sort || 0) < Number(stage.sort || 0)))
    },
    scoreRangeTitle() { return `单项评分范围为 0～${this.detail.upperLimitScore == null ? '-' : this.detail.upperLimitScore} 分，最多保留两位小数；总分按评分、维度权重和指标权重计算。` },
    stageCommentPlaceholder() { return this.currentStage && this.currentStage.raterType === 4 ? '自评说明' : '评分说明' }
  },
  watch: {
    drawerVisible(visible) { document.body.classList.toggle('hrm-performance-review-open', visible) }
  },
  beforeDestroy() {
    document.body.classList.remove('hrm-performance-review-open')
    if (this.previewTimer) clearTimeout(this.previewTimer)
  },
  methods: {
    async open(assessmentId, stageId) {
      if (!assessmentId || !stageId) return
      this.drawerVisible = true
      this.loading = true
      this.stageComment = ''
      this.scorePreview = undefined
      if (this.previewTimer) clearTimeout(this.previewTimer)
      try {
        const response = await PerformanceAssessmentApi.getPerformanceAssessment(assessmentId, stageId)
        const detail = response.data
        this.detail = detail
        this.stageComment = detail.currentReviewStage && detail.currentReviewStage.comment ? detail.currentReviewStage.comment : ''
        const scoreMap = new Map(((detail.currentReviewStage && detail.currentReviewStage.quotaScoreList) || []).map(score => [score.assessmentQuotaId, score.score]))
        ;(detail.quotas || []).forEach(quota => this.$set(quota, 'finalScore', scoreMap.get(quota.id)))
        this.schedulePreview()
      } finally {
        this.loading = false
      }
    },
    async previewScore() {
      const stage = this.currentStage
      const quotaList = this.detail.quotas || []
      if (!this.detail.id || !stage || !stage.id || !quotaList.length || quotaList.some(quota => quota.finalScore === undefined || quota.finalScore === null)) {
        this.scorePreview = undefined
        return
      }
      try {
        const response = await PerformanceAssessmentApi.previewPerformanceAssessmentScore({
          assessmentId: this.detail.id,
          reviewStageId: stage.id,
          quotas: quotaList
        })
        this.scorePreview = response.data
      } catch {
        this.scorePreview = undefined
      }
    },
    schedulePreview() {
      if (this.previewTimer) clearTimeout(this.previewTimer)
      this.previewTimer = setTimeout(() => {
        this.previewTimer = undefined
        this.previewScore()
      }, 250)
    },
    async rejectPreviousStage() {
      const stage = this.currentStage
      if (!this.detail.id || !stage || !stage.id) return
      let result
      try {
        result = await this.$prompt('请输入驳回原因', '驳回上一评分阶段')
      } catch (error) {
        return
      }
      const reason = result.value && result.value.trim()
      if (!reason) {
        this.$modal.msgWarning('驳回原因不能为空')
        return
      }
      this.submitting = true
      try {
        await PerformanceAssessmentApi.rejectPerformanceAssessmentReviewStage({ assessmentId: this.detail.id, reviewStageId: stage.id, reason })
        this.$modal.msgSuccess('上一评分阶段已驳回')
        this.drawerVisible = false
        this.$emit('success')
      } finally {
        this.submitting = false
      }
    },
    async submitReview() {
      const stage = this.currentStage
      if (!this.detail.id || !stage || !stage.id) return
      const quotaList = this.detail.quotas || []
      if (!quotaList.length || quotaList.some(quota => quota.finalScore === undefined || quota.finalScore === null)) {
        this.$modal.msgError('请完成全部指标评分')
        return
      }
      if (stage.requiredSetting && !this.stageComment.trim()) {
        this.$modal.msgError('请填写本阶段评语')
        return
      }
      this.submitting = true
      try {
        const comment = this.stageComment.trim()
        await PerformanceAssessmentApi.scorePerformanceAssessment({
          assessmentId: this.detail.id,
          reviewStageId: stage.id,
          comment,
          selfComment: stage.raterType === HrmPerformanceRaterType.SELF ? comment : undefined,
          reviewerComment: stage.raterType === HrmPerformanceRaterType.SELF ? undefined : comment,
          quotas: quotaList
        })
        this.$modal.msgSuccess('当前阶段评分已提交')
        this.drawerVisible = false
        this.$emit('success')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.review-body { min-width: 0; padding: 0 20px 72px; }
.review-head, .stage-summary, .score-preview, .score-preview > div { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.review-head { align-items: flex-start; margin-bottom: 16px; }
.employee-name { color: #303133; font-size: 20px; font-weight: 600; }
.assessment-name, .stage-handler { margin-top: 4px; color: #909399; font-size: 13px; }
.stage-summary { gap: 8px; white-space: nowrap; }
.review-stages { margin-bottom: 16px; border-top: 1px solid #ebeef5; }
.review-stage-row { display: grid; grid-template-columns: minmax(180px, 1fr) 70px 80px 70px; min-height: 52px; align-items: center; border-bottom: 1px solid #ebeef5; }
.review-stage-row > div:first-child { display: flex; flex-direction: column; }
.stage-score { text-align: right; }
.review-alert { margin-bottom: 16px; }
.score-preview { min-height: 48px; margin-bottom: 16px; padding: 8px 0; border-top: 1px solid #ebeef5; border-bottom: 1px solid #ebeef5; gap: 20px; }
.score-preview > div { gap: 8px; }.score-preview span { color: #909399; font-size: 13px; }
.score-alert { margin-bottom: 12px; }
.stage-comment { margin-top: 16px; }
.drawer-footer { position: absolute; right: 0; bottom: 0; left: 0; padding: 12px 20px; border-top: 1px solid #ebeef5; background: #fff; text-align: right; }
:global(body.hrm-performance-review-open .el-backtop) { display: none; }
</style>
