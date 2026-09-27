<template>
  <div class="hrm-performance-page">
    <el-card
      v-loading="loading"
      shadow="never"
    >
      <div class="mb-20px flex items-center gap-12px">
        <el-button
          title="返回"
          type="text"
          @click="close"
        >
          <i class="el-icon-arrow-left" />
        </el-button>
        <span class="text-20px font-600">员工考核详情</span>
      </div>
      <div class="mb-24px flex items-center justify-between gap-24px">
        <div class="flex min-w-0 items-center gap-12px">
          <el-avatar :size="48">{{ detail.employeeName?.slice(0, 1) }}</el-avatar>
          <div class="min-w-0">
            <div class="flex items-center gap-8px">
              <span class="truncate text-20px font-600">{{ detail.name || '-' }}</span>
              <dict-tag
                v-if="detail.status != null"
                :type="DICT_TYPE.HRM_PERFORMANCE_PLAN_STATUS"
                :value="detail.status"
              />
            </div>
            <div class="mt-6px text-[var(--el-text-color-secondary)]">
              {{ detail.employeeName || '-' }} · {{ detail.jobNumber || '-' }}
            </div>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-32px text-center">
          <div>
            <div class="text-13px text-[var(--el-text-color-secondary)]">绩效得分</div>
            <div class="mt-4px text-24px font-600">{{ detail.score ?? '-' }}</div>
          </div>
          <div>
            <div class="text-13px text-[var(--el-text-color-secondary)]">考核结果</div>
            <div class="mt-4px text-18px font-600">
              {{ detail.resultLevel || '-' }}
              <span
                v-if="detail.coefficient != null"
                class="text-13px font-400"
              >
                （系数 {{ detail.coefficient }}）
              </span>
            </div>
          </div>
        </div>
      </div>

      <el-descriptions
        :column="4"
        border
      >
        <el-descriptions-item label="考核周期">
          {{ formatHrmPerformanceCycleType(detail.cycleType) }}
        </el-descriptions-item>
        <el-descriptions-item label="周期范围">{{ detail.cycle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ detail.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ detail.postName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="聘用形式">
          <dict-tag
            v-if="detail.employeeType != null"
            :type="DICT_TYPE.HRM_EMPLOYEE_TYPE"
            :value="detail.employeeType"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="当前阶段">
          <dict-tag
            v-if="detail.stageType != null"
            :type="DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS"
            :value="detail.stageType"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="当前处理人">
          {{ detail.currentHandlerName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="考核时间">
          {{ formatHrmDateRange(detail.startTime, detail.endTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-28px">
        <div class="mb-22px border-l-3 border-[var(--el-color-primary)] pl-10px text-16px font-600">
          考核流程
        </div>
        <el-steps
          v-if="stageList.length"
          :active="activeStage"
          align-center
          finish-status="success"
          process-status="process"
        >
          <el-step
            v-for="stage in stageList"
            :key="stage.id"
            :title="stage.name || '-'"
          >
            <template #description>
              <div class="mt-4px">{{ stage.handlerName || '系统' }}</div>
              <dict-tag
                class="mt-4px"
                :type="DICT_TYPE.HRM_PERFORMANCE_ASSESSMENT_STAGE_STATUS"
                :value="stage.status ?? 0"
              />
            </template>
          </el-step>
        </el-steps>
        <el-empty
          v-else-if="!loading"
          :image-size="72"
          description="暂无考核流程"
        />
      </div>

      <el-tabs
        v-model="activeTab"
        class="mt-24px"
      >
        <el-tab-pane
          label="考核评分"
          name="score"
        >
          <div class="mb-12px border-l-3 border-[var(--el-color-primary)] pl-10px text-16px font-600">
            考核评分明细
          </div>
          <el-table
            v-loading="loading"
            :data="scoreRows"
            border
            :span-method="spanScoreCell"
          >
            <el-table-column
              label="维度"
              prop="dimensionName"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              label="指标"
              prop="quotaName"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column
              label="指标说明"
              prop="description"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              label="考核标准"
              prop="standard"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              label="目标值"
              prop="targetValue"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              label="实际值"
              prop="actualValue"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              label="权重"
              align="center"
              width="90"
            >
              <template #default="scope">{{ scope.row.weight ?? 0 }}%</template>
            </el-table-column>
            <el-table-column
              label="评分人"
              prop="raterName"
              min-width="110"
              show-overflow-tooltip
            />
            <el-table-column
              label="评分"
              align="center"
              prop="score"
              width="90"
            />
            <el-table-column
              label="评语"
              prop="comment"
              min-width="180"
              show-overflow-tooltip
            />
          </el-table>

          <template v-if="hasAssessmentComment">
            <div
              class="mb-12px mt-24px border-l-3 border-[var(--el-color-primary)] pl-10px text-16px font-600"
            >
              考核评语
            </div>
            <el-descriptions
              :column="3"
              border
            >
              <el-descriptions-item label="自评说明">{{
                detail.selfComment || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="评分说明">
                {{ detail.reviewerComment || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="结果说明">
                {{ detail.resultComment || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-tab-pane>
        <el-tab-pane
          label="考核记录"
          name="record"
        >
          <PerformanceProcessRecordTimeline
            :loading="recordLoading"
            :records="processRecordList"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, unref, getCurrentInstance } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import * as PerformanceAssessmentApi from '@/api/hrm/performance/assessment'
import { HrmPerformanceAssessmentStageStatus, HrmPerformancePlanStatus } from '@/views/hrm/utils/constants'
import { formatHrmDateRange, formatHrmPerformanceCycleType } from '@/views/hrm/utils/format'
import PerformanceProcessRecordTimeline from '../components/PerformanceProcessRecordTimeline.vue'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceAssessmentDetail' },
  __name: 'index',
  components: { PerformanceProcessRecordTimeline },
  setup(__props, { expose: __expose }) {
    __expose()
    const route = getCurrentInstance().proxy.$route // 当前路由
    const __router = getCurrentInstance().proxy.$router
    const currentRoute = __router.currentRoute
    const push = (...args) => __router.push(...args) // 路由操作
    const __store = getCurrentInstance().proxy.$store
    const delView = (view) => __store.dispatch('tagsView/delView', view) // 页签操作
    const assessmentId = Number(route.params.id) // 考核编号
    const employeeId = Number(route.query.employeeId) // 员工编号
    const planId = Number(route.query.planId) // 绩效计划编号
    const archived = route.query.archived === 'true' // 是否已归档
    const loading = ref(false) // 加载中
    const recordLoading = ref(false) // 流程记录加载中
    const detail = ref({}) // 详情数据
    const processRecordList = ref([]) // 流程记录列表
    const activeTab = ref('score') // 当前页签
    const stageList = computed(() => [...(detail.value.stages || [])].sort((first, second) => (first.sort || 0) - (second.sort || 0)))
    const activeStage = computed(() => {
      if (detail.value.status === HrmPerformancePlanStatus.ARCHIVED) {
        return stageList.value.length
      }
      const index = stageList.value.findIndex((stage) => stage.status !== HrmPerformanceAssessmentStageStatus.PROCESSED)
      return index >= 0 ? index : stageList.value.length
    })
    const scoreRows = computed(() => (detail.value.quotas || []).flatMap((quota) => buildQuotaScoreRows(quota)))
    const hasAssessmentComment = computed(() => !!detail.value.selfComment || !!detail.value.reviewerComment || !!detail.value.resultComment)
    /** 关闭员工考核详情 */
    function close() {
      delView(unref(currentRoute))
      if (planId) {
        push({
          name: 'HrmPerformancePlanDetail',
          params: { id: planId },
          query: { tab: 'employees' }
        })
        return
      }
      if (employeeId) {
        push({
          name: 'HrmPerformanceAssessmentEmployee',
          params: { employeeId }
        })
        return
      }
      push('/hrm/performance/assessment')
    }
    /** 查询员工考核详情 */
    async function getDetail() {
      if (!assessmentId) {
        return
      }
      loading.value = true
      recordLoading.value = true
      try {
        const [assessmentResponse, recordsResponse] = archived
          ? await Promise.all([
            PerformanceAssessmentApi.getPerformanceAssessmentArchive(assessmentId),
            PerformanceAssessmentApi.getPerformanceAssessmentArchiveProcessRecordList(assessmentId)
          ])
          : await Promise.all([
            PerformanceAssessmentApi.getPerformanceAssessment(assessmentId),
            PerformanceAssessmentApi.getPerformanceAssessmentProcessRecordList(assessmentId)
          ])
        detail.value = assessmentResponse.data
        processRecordList.value = recordsResponse.data
      } finally {
        loading.value = false
        recordLoading.value = false
      }
    }
    /** 构建指标评分明细 */
    function buildQuotaScoreRows(quota) {
      const scoreStages = (detail.value.reviewStages || []).filter((stage) => stage.quotaScoreList?.some((score) => score.assessmentQuotaId === quota.id))
      if (!scoreStages.length) {
        return [buildScoreRow(quota)]
      }
      return scoreStages.map((stage) => {
        const quotaScore = stage.quotaScoreList?.find((score) => score.assessmentQuotaId === quota.id)
        return buildScoreRow(quota, stage, quotaScore?.score, quotaScore?.comment)
      })
    }
    /** 构建一行指标评分 */
    function buildScoreRow(quota, stage, score, comment) {
      return {
        key: `${quota.id || 0}-${stage?.id || 0}`,
        dimensionId: quota.dimensionId,
        quotaId: quota.id,
        dimensionName: quota.dimensionName,
        quotaName: quota.name,
        description: quota.description,
        standard: quota.standard,
        targetValue: quota.targetValue,
        actualValue: quota.actualValue,
        weight: quota.weight,
        raterName: stage?.handlerName,
        score: score ?? quota.finalScore,
        comment: comment || quota.comment
      }
    }
    /** 合并相同维度和指标的评分单元格 */
    function spanScoreCell({ row, columnIndex, rowIndex }) {
      if (columnIndex === 0) {
        return getRowSpan(rowIndex, (item) => item.dimensionId === row.dimensionId)
      }
      if (columnIndex >= 1 && columnIndex <= 6) {
        return getRowSpan(rowIndex, (item) => item.quotaId === row.quotaId)
      }
      return { rowspan: 1, colspan: 1 }
    }
    /** 获得连续相同数据的合并行数 */
    function getRowSpan(rowIndex, matcher) {
      if (rowIndex > 0 && matcher(scoreRows.value[rowIndex - 1])) {
        return { rowspan: 0, colspan: 0 }
      }
      let rowspan = 1
      while (rowIndex + rowspan < scoreRows.value.length &&
                matcher(scoreRows.value[rowIndex + rowspan])) {
        rowspan += 1
      }
      return { rowspan, colspan: 1 }
    }
    /** 初始化 */
    onMounted(() => {
      getDetail()
    })
    const __returned__ = { route, currentRoute, push, delView, assessmentId, employeeId, planId, archived, loading, recordLoading, detail, processRecordList, activeTab, stageList, activeStage, scoreRows, hasAssessmentComment, close, getDetail, buildQuotaScoreRows, buildScoreRow, spanScoreCell, getRowSpan, get DICT_TYPE() { return DICT_TYPE }, get formatHrmDateRange() { return formatHrmDateRange }, get formatHrmPerformanceCycleType() { return formatHrmPerformanceCycleType }, PerformanceProcessRecordTimeline }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
