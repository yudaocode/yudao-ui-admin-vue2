<template>
  <div class="hrm-performance-page">
    <div v-loading="loading">
      <div class="flex items-start justify-between gap-16px">
        <div class="flex min-w-0 items-start gap-10px">
          <el-button
            title="返回"
            type="text"
            @click="$emit('back')"
          >
            <i class="el-icon-arrow-left" />
          </el-button>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-10px">
              <span class="break-all text-xl font-bold">{{ plan.name || '-' }}</span>
              <dict-tag
                v-if="plan.status != null"
                :type="DICT_TYPE.HRM_PERFORMANCE_PLAN_STATUS"
                :value="plan.status"
              />
              <dict-tag
                v-if="plan.stageType != null"
                :type="DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS"
                :value="plan.stageType"
              />
            </div>
            <div class="mt-6px text-sm text-[var(--el-text-color-secondary)]">
              计划编号：{{ plan.id || '-' }}
            </div>
          </div>
        </div>
        <div>
          <slot />
        </div>
      </div>
      <el-card
        shadow="never"
        class="mt-10px"
      >
        <el-descriptions
          :column="5"
          direction="vertical"
        >
          <el-descriptions-item label="考核周期">
            {{ formatHrmPerformancePlanCycle(plan) }}
          </el-descriptions-item>
          <el-descriptions-item label="起止日期">
            {{ formatHrmDateRange(plan.startTime, plan.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="考核模板">
            {{ plan.assessmentTemplateName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="参评人数">{{ plan.employeeCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="完成人数">{{ plan.finishedCount || 0 }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script>
import { defineComponent as _defineComponent } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import { formatHrmDateRange, formatHrmPerformancePlanCycle } from '@/views/hrm/utils/format'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanDetailsHeader' },
  __name: 'PerformancePlanDetailsHeader',
  props: {
    plan: { type: null, required: true },
    loading: { type: Boolean, required: true }
  },
  emits: ['back'],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose()
    const emit = __emit // 定义 back 事件
    const __returned__ = { emit, get DICT_TYPE() { return DICT_TYPE }, get formatHrmDateRange() { return formatHrmDateRange }, get formatHrmPerformancePlanCycle() { return formatHrmPerformancePlanCycle } }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
