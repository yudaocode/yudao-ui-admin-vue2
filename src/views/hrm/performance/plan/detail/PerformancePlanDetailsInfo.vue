<template>
  <div class="hrm-performance-page">
    <el-card shadow="never">
      <el-collapse v-model="activeNames">
        <el-collapse-item name="basicInfo">
          <template #title>
            <span class="text-base font-bold">考核设置</span>
          </template>
          <el-descriptions :column="3">
            <el-descriptions-item label="考核模板">
              {{ plan.assessmentTemplateName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="结果模板">
              {{ plan.resultTemplateName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="考核周期">
              {{ formatHrmPerformancePlanCycle(plan) }}
            </el-descriptions-item>
            <el-descriptions-item
              label="结果等级"
              :span="3"
            >
              {{
              plan.resultConfig?.levels
                .map(
                  (level) =>
                    `${level.name}（${level.minScore}-${level.maxScore}，系数 ${level.coefficient}）`
                )
                .join('；') || '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="开始日期">
              {{ formatHrmDate(plan.startTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="结束日期">
              {{ formatHrmDate(plan.endTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="计薪月份">
              {{ plan.paidForMonth || '-' }}
            </el-descriptions-item>
            <el-descriptions-item
              v-if="plan.terminateTime"
              label="终止时间"
            >
              {{ formatDate(plan.terminateTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="指标制定">
              {{ formatHrmPerformanceQuotaSettingType(plan.quotaSettingType) }}
            </el-descriptions-item>
            <el-descriptions-item label="目标确认">
              {{ plan.targetConfirmation ? '需要' : '不需要' }}
            </el-descriptions-item>
            <el-descriptions-item label="同步薪资">
              {{ plan.syncToSalary ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item label="结果审核">
              {{ plan.resultAudit ? '需要' : '不需要' }}
            </el-descriptions-item>
            <el-descriptions-item label="结果确认">
              {{ plan.resultConfirmation ? '需要' : '不需要' }}
            </el-descriptions-item>
            <el-descriptions-item label="申诉超期处理">
              {{ formatHrmPerformanceAppealTimeout(plan) }}
            </el-descriptions-item>
            <el-descriptions-item
              label="考核说明"
              :span="3"
            >
              {{ plan.description || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        <el-collapse-item name="reviewStages">
          <template #title>
            <span class="text-base font-bold">评分流程</span>
          </template>
          <el-table
            :data="plan.reviewStages || []"
            border
          >
            <el-table-column
              align="center"
              label="顺序"
              width="70"
            >
              <template #default="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column
              label="评分阶段"
              prop="name"
              min-width="150"
            />
            <el-table-column
              label="评分人类型"
              min-width="130"
            >
              <template #default="scope">
                {{ formatHrmPerformanceRaterType(scope.row.rater?.type) }}
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="权重"
              width="90"
            >
              <template #default="scope">{{ scope.row.weight || 0 }}%</template>
            </el-table-column>
            <el-table-column
              align="center"
              label="评语必填"
              width="100"
            >
              <template #default="scope">{{ scope.row.requiredSetting ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column
              align="center"
              label="允许驳回"
              width="100"
            >
              <template #default="scope">{{ scope.row.rejectAuthority ? '是' : '否' }}</template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { formatHrmDate, formatHrmPerformanceAppealTimeout, formatHrmPerformancePlanCycle, formatHrmPerformanceQuotaSettingType, formatHrmPerformanceRaterType } from '@/views/hrm/utils/format'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanDetailsInfo' },
  __name: 'PerformancePlanDetailsInfo',
  props: {
    plan: { type: null, required: true }
  },
  setup(__props, { expose: __expose }) {
    __expose()
    const activeNames = ref(['basicInfo', 'reviewStages']) // 默认展开的折叠面板
    const __returned__ = { activeNames, get formatDate() { return formatDate }, get formatHrmDate() { return formatHrmDate }, get formatHrmPerformanceAppealTimeout() { return formatHrmPerformanceAppealTimeout }, get formatHrmPerformancePlanCycle() { return formatHrmPerformancePlanCycle }, get formatHrmPerformanceQuotaSettingType() { return formatHrmPerformanceQuotaSettingType }, get formatHrmPerformanceRaterType() { return formatHrmPerformanceRaterType } }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
