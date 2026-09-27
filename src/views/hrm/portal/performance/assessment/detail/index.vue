<template>
  <el-drawer
    title="绩效详情"
    :visible.sync="drawerVisible"
    size="760px"
    append-to-body
  >
    <div
      v-loading="loading"
      class="detail-body"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="绩效详情"
          name="detail"
        >
          <el-descriptions
            v-if="assessment"
            :column="2"
            border
          >
            <el-descriptions-item
              label="考核名称"
              :span="2"
            >{{ assessment.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="开始日期">{{ formatHrmDate(assessment.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="结束日期">{{ formatHrmDate(assessment.endTime) }}</el-descriptions-item>
            <el-descriptions-item label="当前阶段"><dict-tag
              :type="DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS"
              :value="assessment.stageType == null ? 0 : assessment.stageType"
            /></el-descriptions-item>
            <el-descriptions-item label="绩效得分">{{ formatHrmScore(assessment.score) }}</el-descriptions-item>
            <el-descriptions-item label="绩效等级">{{ assessment.resultLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="绩效系数">{{ assessment.coefficient == null ? '-' : assessment.coefficient }}</el-descriptions-item>
            <el-descriptions-item
              label="归档时间"
              :span="2"
            >{{ formatHrmDateTime(assessment.archiveTime) }}</el-descriptions-item>
            <el-descriptions-item label="指标确认人">{{ assessment.targetConfirmationEmployeeName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="指标确认结果">
              <el-tag
                v-if="assessment.targetConfirmationResult === 1"
                type="success"
                effect="plain"
              >已通过</el-tag>
              <el-tag
                v-else-if="assessment.targetConfirmationResult === 0"
                type="danger"
                effect="plain"
              >已退回</el-tag><span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item
              label="自评说明"
              :span="2"
            >{{ assessment.selfComment || '-' }}</el-descriptions-item>
            <el-descriptions-item
              label="评分说明"
              :span="2"
            >{{ assessment.reviewerComment || '-' }}</el-descriptions-item>
            <el-descriptions-item
              label="结果说明"
              :span="2"
            >{{ assessment.resultComment || '-' }}</el-descriptions-item>
            <el-descriptions-item
              label="结果确认时间"
              :span="2"
            >{{ formatHrmDateTime(assessment.resultConfirmationTime) }}</el-descriptions-item>
            <el-descriptions-item
              label="指标确认意见"
              :span="2"
            >{{ assessment.targetConfirmationComment || '-' }}</el-descriptions-item>
            <el-descriptions-item label="申诉状态"><dict-tag
              :type="DICT_TYPE.HRM_PERFORMANCE_APPEAL_STATUS"
              :value="assessment.appealStatus == null ? 0 : assessment.appealStatus"
            /></el-descriptions-item>
            <el-descriptions-item label="申诉提交时间">{{ formatHrmDateTime(assessment.appealSubmitTime) }}</el-descriptions-item>
            <el-descriptions-item label="申诉完成时间">{{ formatHrmDateTime(assessment.appealTime) }}</el-descriptions-item>
            <el-descriptions-item
              label="申诉原因"
              :span="2"
            >{{ assessment.appealReason || '-' }}</el-descriptions-item>
            <el-descriptions-item
              label="申诉附件"
              :span="2"
            >
              <div
                v-if="assessment.appealFileUrls && assessment.appealFileUrls.length"
                class="detail-files"
              >
                <el-link
                  v-for="url in assessment.appealFileUrls"
                  :key="url"
                  type="primary"
                  :underline="false"
                  @click="openSafeUrl(url)"
                >{{ getFileNameFromUrl(url) }}</el-link>
              </div><span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item
              label="申诉审批意见"
              :span="2"
            >{{ assessment.appealComment || '-' }}</el-descriptions-item>
          </el-descriptions>
          <template v-if="assessment && assessment.quotas && assessment.quotas.length">
            <div class="section-title">绩效指标</div>
            <el-table
              :data="assessment.quotas"
              border
            >
              <el-table-column
                label="维度"
                prop="dimensionName"
                min-width="120"
              /><el-table-column
                label="指标"
                prop="name"
                min-width="160"
              /><el-table-column
                label="考核标准"
                prop="standard"
                min-width="200"
              />
              <el-table-column
                label="权重"
                width="80"
                align="center"
              ><template slot-scope="scope">{{ scope.row.weight || 0 }}%</template></el-table-column>
              <el-table-column
                label="最终得分"
                width="90"
                align="center"
              ><template slot-scope="scope">{{ formatHrmScore(scope.row.finalScore) }}</template></el-table-column>
            </el-table>
          </template>
          <template v-if="assessment && assessment.reviewStages && assessment.reviewStages.length">
            <div class="section-title">评分流程</div>
            <el-table
              :data="assessment.reviewStages"
              border
            >
              <el-table-column
                label="评分阶段"
                prop="name"
                min-width="130"
              /><el-table-column
                label="评分人"
                prop="handlerName"
                min-width="120"
              />
              <el-table-column
                label="权重"
                width="80"
                align="center"
              ><template slot-scope="scope">{{ scope.row.weight || 0 }}%</template></el-table-column>
              <el-table-column
                label="阶段得分"
                width="90"
                align="center"
              ><template slot-scope="scope">{{ formatHrmScore(scope.row.score) }}</template></el-table-column>
              <el-table-column
                label="评语"
                prop="comment"
                min-width="160"
              />
            </el-table>
          </template>
        </el-tab-pane>
        <el-tab-pane
          label="流程记录"
          name="record"
        ><PerformanceProcessRecordTimeline
          :records="recordList"
          :loading="loading"
        /></el-tab-pane>
      </el-tabs>
    </div>
  </el-drawer>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { getFileNameFromUrl } from '@/utils/file'
import { openSafeUrl } from '@/utils/url'
import { getPerformanceAssessment, getPerformanceAssessmentProcessRecordList } from '@/api/hrm/portal/performance/assessment'
import { HrmPerformanceStageType } from '@/views/hrm/utils/constants'
import { formatHrmDate, formatHrmDateTime } from '@/views/hrm/utils/format'
import { formatHrmScore } from '@/views/hrm/portal/utils/format'
import PerformanceProcessRecordTimeline from './PerformanceProcessRecordTimeline.vue'

export default {
  name: 'HrmPortalPerformanceAssessmentDetail',
  components: { PerformanceProcessRecordTimeline },
  data() { return { DICT_TYPE, drawerVisible: false, loading: false, activeTab: 'detail', assessment: undefined, recordList: [] } },
  methods: {
    getFileNameFromUrl,
    openSafeUrl,
    formatHrmDate,
    formatHrmDateTime,
    formatHrmScore,
    async open(row, taskType) {
      if (!row.id) return
      let stageId
      if (taskType !== undefined) {
        stageId = taskType === HrmPerformanceStageType.OTHER_SCORE
          ? row.currentReviewStage && row.currentReviewStage.id
          : row.currentStage && row.currentStage.id
        if (!stageId) {
          this.$modal.msgError('绩效任务阶段不存在')
          return
        }
      }
      this.drawerVisible = true
      this.activeTab = 'detail'
      this.loading = true
      try {
        const responses = await Promise.all([
          getPerformanceAssessment(row.id, stageId),
          getPerformanceAssessmentProcessRecordList(row.id, stageId)
        ])
        this.assessment = responses[0].data
        this.recordList = responses[1].data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.detail-body { padding: 0 20px 30px; }
.detail-files { display: flex; flex-direction: column; align-items: flex-start; }
.section-title { margin: 20px 0 12px; color: #303133; font-size: 16px; font-weight: 600; }
</style>
