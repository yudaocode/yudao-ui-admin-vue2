<template>
  <el-table
    v-loading="loading"
    :data="list"
    border
    style="width: 100%"
  >
    <el-table-column
      type="index"
      label="序号"
      width="70"
      align="center"
    />
    <template v-if="isSelfTask">
      <el-table-column
        label="考核名称"
        prop="name"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column
        label="考核周期"
        min-width="210"
      ><template slot-scope="scope">{{ formatHrmDate(scope.row.startTime) }} 至 {{ formatHrmDate(scope.row.endTime) }}</template></el-table-column>
      <el-table-column
        label="当前阶段"
        width="130"
        align="center"
      ><template slot-scope="scope">{{ currentStageName(scope.row) }}</template></el-table-column>
      <el-table-column
        label="绩效得分"
        width="110"
        align="center"
      ><template slot-scope="scope">{{ formatHrmScore(scope.row.score) }}</template></el-table-column>
      <el-table-column
        label="绩效等级"
        width="110"
        align="center"
      ><template slot-scope="scope"><el-tag
        v-if="scope.row.resultLevel"
        type="success"
        effect="plain"
      >{{ scope.row.resultLevel }}</el-tag><span v-else>-</span></template></el-table-column>
      <el-table-column
        label="绩效系数"
        width="100"
        align="center"
      ><template slot-scope="scope">{{ scope.row.coefficient == null ? '-' : scope.row.coefficient }}</template></el-table-column>
      <el-table-column
        label="操作"
        fixed="right"
        width="260"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="$emit('detail', scope.row)"
          >详情</el-button>
          <el-button
            v-if="canFillQuota(scope.row)"
            v-hasPermi="['hrm:portal:performance:action']"
            type="text"
            @click="$emit('quota', scope.row.id)"
          >制定指标</el-button>
          <el-button
            v-if="canConfirmResult"
            v-hasPermi="['hrm:portal:performance:action']"
            type="text"
            class="success-button"
            @click="$emit('result-confirm', scope.row.id)"
          >确认结果</el-button>
          <el-button
            v-if="canAppeal(scope.row)"
            v-hasPermi="['hrm:portal:performance:action']"
            type="text"
            class="warning-button"
            @click="$emit('appeal', scope.row.id)"
          >提交申诉</el-button>
        </template>
      </el-table-column>
    </template>
    <template v-else>
      <el-table-column
        label="考核名称"
        prop="name"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column
        label="被考核人"
        min-width="160"
      ><template slot-scope="scope">{{ scope.row.employeeName || '-' }} <span class="job-number">{{ scope.row.jobNumber || '' }}</span></template></el-table-column>
      <el-table-column
        label="当前阶段"
        width="140"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="activeTab === StageType.OTHER_SCORE || activeTab === StageType.RESULT_AUDIT || activeTab === StageType.APPEAL_CONFIRM">
            {{ handlerStageName(scope.row) }}
          </span>
          <dict-tag
            v-else
            :type="DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS"
            :value="scope.row.stageType == null ? 0 : scope.row.stageType"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="activeTab === StageType.TARGET_CONFIRM"
        label="指标数"
        width="100"
        align="center"
      ><template slot-scope="scope">{{ scope.row.quotas ? scope.row.quotas.length : 0 }}</template></el-table-column>
      <el-table-column
        v-else-if="activeTab === StageType.OTHER_SCORE"
        label="评分权重"
        width="100"
        align="center"
      ><template slot-scope="scope">{{ currentReviewWeight(scope.row) }}%</template></el-table-column>
      <el-table-column
        v-else
        label="绩效得分"
        width="100"
        align="center"
      ><template slot-scope="scope">{{ formatHrmScore(scope.row.score) }}</template></el-table-column>
      <el-table-column
        label="操作"
        fixed="right"
        width="110"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            v-if="isPending && activeTab === StageType.TARGET_CONFIRM"
            v-hasPermi="['hrm:portal:performance:action']"
            type="text"
            @click="$emit('target-confirm', scope.row.id, currentStageId(scope.row))"
          >去确认</el-button>
          <el-button
            v-else-if="isPending && activeTab === StageType.OTHER_SCORE"
            v-hasPermi="['hrm:portal:performance:action']"
            type="text"
            @click="$emit('review', scope.row.id, currentReviewStageId(scope.row))"
          >去评分</el-button>
          <el-button
            v-else-if="isPending && activeTab === StageType.RESULT_AUDIT"
            v-hasPermi="['hrm:portal:performance:action']"
            type="text"
            @click="$emit('result-audit', scope.row.id, currentStageId(scope.row))"
          >去审核</el-button>
          <el-button
            v-else-if="isPending && activeTab === StageType.APPEAL_CONFIRM"
            v-hasPermi="['hrm:portal:performance:action']"
            type="text"
            @click="$emit('appeal-handle', scope.row.id, currentStageId(scope.row))"
          >去确认</el-button>
          <el-button
            v-else
            type="text"
            @click="$emit('detail', scope.row)"
          >查看</el-button>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { HrmPerformanceAppealStatus, HrmPerformanceAssessmentStageStatus, HrmPerformanceStageType } from '@/views/hrm/utils/constants'
import { formatHrmDate } from '@/views/hrm/utils/format'
import { formatHrmScore } from '@/views/hrm/portal/utils/format'

export default {
  name: 'HrmPortalPerformanceTaskTable',
  props: {
    activeTab: { type: Number, required: true },
    activeStatus: { type: Number, required: true },
    loading: { type: Boolean, required: true },
    list: { type: Array, required: true }
  },
  data() { return { DICT_TYPE, StageType: HrmPerformanceStageType } },
  computed: {
    isSelfTask() { return this.activeTab === HrmPerformanceStageType.FILL_QUOTA || this.activeTab === HrmPerformanceStageType.RESULT_CONFIRM },
    isPending() { return this.activeStatus === HrmPerformanceAssessmentStageStatus.PENDING },
    canConfirmResult() { return this.activeTab === HrmPerformanceStageType.RESULT_CONFIRM && this.isPending }
  },
  methods: {
    formatHrmDate,
    formatHrmScore,
    currentStageName(row) { return row.currentStage && row.currentStage.name ? row.currentStage.name : '-' },
    handlerStageName(row) {
      if (this.activeTab === HrmPerformanceStageType.OTHER_SCORE) return row.currentReviewStage && row.currentReviewStage.name ? row.currentReviewStage.name : '待评分'
      if (this.activeTab === HrmPerformanceStageType.RESULT_AUDIT || this.activeTab === HrmPerformanceStageType.APPEAL_CONFIRM) return row.currentStage && row.currentStage.name ? row.currentStage.name : '待处理'
      return '-'
    },
    currentStageId(row) { return row.currentStage && row.currentStage.id },
    currentReviewStageId(row) { return row.currentReviewStage && row.currentReviewStage.id },
    currentReviewWeight(row) { return row.currentReviewStage && row.currentReviewStage.weight ? row.currentReviewStage.weight : 0 },
    canFillQuota(row) { return this.activeTab === HrmPerformanceStageType.FILL_QUOTA && this.isPending && row.stageType === HrmPerformanceStageType.FILL_QUOTA },
    canAppeal(row) { return this.activeTab === HrmPerformanceStageType.RESULT_CONFIRM && this.isPending && row.appealStatus !== HrmPerformanceAppealStatus.PENDING }
  }
}
</script>

<style scoped>
.job-number { margin-left: 6px; color: #909399; font-size: 12px; }
.success-button { color: #67c23a; }
.warning-button { color: #e6a23c; }
</style>
