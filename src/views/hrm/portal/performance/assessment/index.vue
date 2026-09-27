<template>
  <div v-if="accessible">
    <el-card shadow="never">
      <PerformanceTaskTabs
        :active-tab.sync="activeTab"
        :active-status.sync="activeStatus"
        :keyword.sync="keyword"
        :task-count="taskCount"
        :status-tabs="statusTabs"
        @query="handleQuery"
        @main-change="handleMainTabChange"
        @status-change="handleStatusTabChange"
      />
      <PerformanceTaskTable
        :active-tab="activeTab"
        :active-status="activeStatus"
        :loading="loading"
        :list="list"
        @detail="openDetail"
        @quota="openQuota"
        @result-confirm="confirmResult"
        @appeal="openAppeal"
        @target-confirm="openTargetConfirm"
        @review="openReview"
        @result-audit="openResultAudit"
        @appeal-handle="openAppealHandle"
      />
      <Pagination
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>
    <PerformanceAssessmentDetail ref="detailRef" />
    <PerformanceQuotaForm
      ref="quotaFormRef"
      @success="loadData"
    />
    <PerformanceTargetConfirmForm
      ref="targetConfirmFormRef"
      @success="loadData"
    />
    <PerformanceReviewForm
      ref="reviewFormRef"
      @success="loadData"
    />
    <PerformanceAppealForm
      ref="appealFormRef"
      @success="loadData"
    />
    <PerformanceHandleForm
      ref="resultAuditFormRef"
      mode="result-audit"
      @success="loadData"
    />
    <PerformanceHandleForm
      ref="appealHandleFormRef"
      mode="appeal"
      @success="loadData"
    />
  </div>
</template>

<script>
import * as PerformanceAssessmentApi from '@/api/hrm/portal/performance/assessment'
import { HrmPerformanceAssessmentStageStatus, HrmPerformanceStageType } from '@/views/hrm/utils/constants'
import { checkHrmPortalAccess } from '@/views/hrm/portal/utils/access'
import PerformanceAssessmentDetail from './detail/index.vue'
import PerformanceTaskTable from './PerformanceTaskTable.vue'
import PerformanceTaskTabs from './PerformanceTaskTabs.vue'
import PerformanceAppealForm from './process/PerformanceAppealForm.vue'
import PerformanceHandleForm from './process/PerformanceHandleForm.vue'
import PerformanceTargetConfirmForm from './process/PerformanceTargetConfirmForm.vue'
import PerformanceQuotaForm from './review/PerformanceQuotaForm.vue'
import PerformanceReviewForm from './review/PerformanceReviewForm.vue'

function emptyTaskCount() {
  return {
    fillPendingCount: 0,
    fillCompletedCount: 0,
    targetPendingCount: 0,
    targetCompletedCount: 0,
    reviewPendingCount: 0,
    reviewCompletedCount: 0,
    resultAuditPendingCount: 0,
    resultAuditCompletedCount: 0,
    resultConfirmationPendingCount: 0,
    resultConfirmationCompletedCount: 0,
    resultConfirmationAppealedCount: 0,
    appealPendingCount: 0,
    appealCompletedCount: 0
  }
}

export default {
  name: 'HrmPortalPerformanceAssessment',
  components: {
    PerformanceAssessmentDetail,
    PerformanceTaskTable,
    PerformanceTaskTabs,
    PerformanceAppealForm,
    PerformanceHandleForm,
    PerformanceTargetConfirmForm,
    PerformanceQuotaForm,
    PerformanceReviewForm
  },
  data() {
    return {
      accessible: false,
      loading: false,
      activeTab: HrmPerformanceStageType.FILL_QUOTA,
      activeStatus: HrmPerformanceAssessmentStageStatus.PENDING,
      keyword: '',
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10 },
      taskCount: emptyTaskCount()
    }
  },
  computed: {
    statusTabs() {
      const pending = HrmPerformanceAssessmentStageStatus.PENDING
      const processed = HrmPerformanceAssessmentStageStatus.PROCESSED
      const appealed = HrmPerformanceAssessmentStageStatus.APPEALED
      if (this.activeTab === HrmPerformanceStageType.FILL_QUOTA) {
        return [
          { label: '待填写', name: pending, count: this.taskCount.fillPendingCount },
          { label: '已填写', name: processed, count: this.taskCount.fillCompletedCount }
        ]
      }
      if (this.activeTab === HrmPerformanceStageType.TARGET_CONFIRM) {
        return [
          { label: '待确认', name: pending, count: this.taskCount.targetPendingCount },
          { label: '已确认', name: processed, count: this.taskCount.targetCompletedCount }
        ]
      }
      if (this.activeTab === HrmPerformanceStageType.OTHER_SCORE) {
        return [
          { label: '待评分', name: pending, count: this.taskCount.reviewPendingCount },
          { label: '已评分', name: processed, count: this.taskCount.reviewCompletedCount }
        ]
      }
      if (this.activeTab === HrmPerformanceStageType.RESULT_AUDIT) {
        return [
          { label: '待审核', name: pending, count: this.taskCount.resultAuditPendingCount },
          { label: '已审核', name: processed, count: this.taskCount.resultAuditCompletedCount }
        ]
      }
      if (this.activeTab === HrmPerformanceStageType.RESULT_CONFIRM) {
        return [
          { label: '待确认结果', name: pending, count: this.taskCount.resultConfirmationPendingCount },
          { label: '已确认', name: processed, count: this.taskCount.resultConfirmationCompletedCount },
          { label: '已申诉', name: appealed, count: this.taskCount.resultConfirmationAppealedCount }
        ]
      }
      return [
        { label: '待确认', name: pending, count: this.taskCount.appealPendingCount },
        { label: '已确认', name: processed, count: this.taskCount.appealCompletedCount }
      ]
    }
  },
  async activated() {
    this.accessible = await checkHrmPortalAccess(this.$router)
    if (!this.accessible) return
    await this.loadData()
  },
  methods: {
    openDetail(row) { this.$refs.detailRef.open(row, this.activeTab) },
    openQuota(id) { this.$refs.quotaFormRef.open(id) },
    openAppeal(id) { this.$refs.appealFormRef.open(id) },
    openTargetConfirm(assessmentId, stageId) { this.$refs.targetConfirmFormRef.open(assessmentId, stageId) },
    openReview(assessmentId, stageId) { this.$refs.reviewFormRef.open(assessmentId, stageId) },
    openResultAudit(assessmentId, stageId) { this.$refs.resultAuditFormRef.open(assessmentId, stageId) },
    openAppealHandle(assessmentId, stageId) { this.$refs.appealHandleFormRef.open(assessmentId, stageId) },
    async confirmResult(id) {
      if (!id) return
      try {
        await this.$modal.confirm('确认当前绩效结果？确认后将进入后续流程。')
      } catch (error) {
        return
      }
      await PerformanceAssessmentApi.confirmPerformanceAssessmentResult({ assessmentId: id, pass: 1, comment: '结果确认' })
      this.$modal.msgSuccess('绩效结果已确认')
      await this.loadData()
    },
    getTaskPage(params) {
      if (this.activeTab === HrmPerformanceStageType.FILL_QUOTA) return PerformanceAssessmentApi.getPerformanceAssessmentFillQuotaTaskPage(params)
      if (this.activeTab === HrmPerformanceStageType.TARGET_CONFIRM) return PerformanceAssessmentApi.getPerformanceAssessmentTargetConfirmationTaskPage(params)
      if (this.activeTab === HrmPerformanceStageType.OTHER_SCORE) return PerformanceAssessmentApi.getPerformanceAssessmentReviewTaskPage(params)
      if (this.activeTab === HrmPerformanceStageType.RESULT_AUDIT) return PerformanceAssessmentApi.getPerformanceAssessmentResultAuditTaskPage(params)
      if (this.activeTab === HrmPerformanceStageType.RESULT_CONFIRM) return PerformanceAssessmentApi.getPerformanceAssessmentResultConfirmationTaskPage(params)
      return PerformanceAssessmentApi.getPerformanceAssessmentAppealTaskPage(params)
    },
    async getList() {
      this.loading = true
      try {
        const response = await this.getTaskPage({
          ...this.queryParams,
          search: this.keyword.trim() || undefined,
          stageStatus: this.activeStatus
        })
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async getTaskCount() {
      const response = await PerformanceAssessmentApi.getPerformanceAssessmentTaskCount(this.keyword.trim() || undefined)
      this.taskCount = response.data
    },
    loadData() { return Promise.all([this.getList(), this.getTaskCount()]) },
    handleQuery() { this.queryParams.pageNo = 1; return this.loadData() },
    handleMainTabChange() {
      this.activeStatus = HrmPerformanceAssessmentStageStatus.PENDING
      this.queryParams.pageNo = 1
      return this.loadData()
    },
    handleStatusTabChange() { this.queryParams.pageNo = 1; return this.getList() }
  }
}
</script>
