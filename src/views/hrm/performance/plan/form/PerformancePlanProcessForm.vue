<template>
  <div class="hrm-performance-page">
    <div class="mx-auto max-w-1200px">
      <div class="process-section-title">指标制定</div>
      <el-form-item
        label="指标制定"
        prop="quotaSettingType"
      >
        <el-radio-group
          v-model="model.quotaSettingType"
          @change="handleQuotaSettingChange"
        >
          <el-radio-button :label="HrmPerformanceQuotaSettingType.SYSTEM">系统制定</el-radio-button>
          <el-radio-button :label="HrmPerformanceQuotaSettingType.EMPLOYEE">员工制定</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <template v-if="model.quotaSettingType === HrmPerformanceQuotaSettingType.EMPLOYEE">
        <el-form-item
          label="目标确认"
          prop="targetConfirmation"
        >
          <el-switch
            v-model="model.targetConfirmation"
            @change="handleTargetConfirmationChange"
          />
        </el-form-item>
        <el-row
          v-if="model.targetConfirmation"
          :gutter="20"
        >
          <el-col :span="12">
            <el-form-item
              label="确认人"
              prop="targetConfirmationStage"
            >
              <el-select
                v-model="targetConfirmationStage.type"
                :disabled="props.disabled"
                class="!w-1/1"
                placeholder="请选择确认人"
                @change="handleTargetConfirmerTypeChange"
              >
                <el-option
                  v-for="item in HrmPerformanceRaterTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认范围">
              <HrmPerformanceRaterLevelSelect
                v-if="
                  targetConfirmationStage.type === HrmPerformanceRaterType.SUPERIOR ||
                    targetConfirmationStage.type === HrmPerformanceRaterType.DEPT_LEADER
                "
                v-model="targetConfirmationStage.level"
                :rater-type="targetConfirmationStage.type"
                :disabled="props.disabled"
                class="!w-1/1"
              />
              <HrmEmployeeSelect
                v-else-if="targetConfirmationStage.type === HrmPerformanceRaterType.SPECIFIED"
                v-model="targetConfirmationStage.employeeId"
                :disabled="props.disabled"
                placeholder="请选择员工"
              />
              <span
                v-else-if="targetConfirmationStage.type === HrmPerformanceRaterType.SELF"
                class="text-gray-500"
              >
                当前被考核员工
              </span>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <div class="process-section-title">考核评分流程</div>
      <el-form-item
        label="评分流程"
        prop="reviewStages"
      >
        <div class="w-1/1">
          <div class="mb-8px flex min-h-40px items-center justify-between">
            <div
              :class="
                Math.abs(reviewWeightTotal - 100) < 0.001
                  ? 'text-[var(--el-color-success)]'
                  : 'text-[var(--el-color-danger)]'
              "
              class="font-600"
            >
              权重合计 {{ reviewWeightTotal }}%
            </div>
            <div>
              <el-button
                :disabled="props.disabled || hasSelfStage"
                plain
                @click="addReviewStage(HrmPerformanceRaterType.SELF)"
              >
                <i class="el-icon-plus mr-5px" />新增自评
              </el-button>
              <el-button
                :disabled="props.disabled"
                plain
                @click="addReviewStage(HrmPerformanceRaterType.SUPERIOR)"
              >
                <i class="el-icon-plus mr-5px" />新增他评
              </el-button>
            </div>
          </div>
          <el-table
            :data="model.reviewStages"
            border
          >
            <el-table-column
              label="评分人"
              min-width="145"
            >
              <template #default="scope">
                <el-select
                  v-model="scope.row.rater.type"
                  aria-label="评分人类型"
                  :disabled="props.disabled"
                  class="!w-1/1"
                  @change="handleRaterTypeChange(scope.row)"
                >
                  <el-option
                    label="被考核人"
                    :value="HrmPerformanceRaterType.SELF"
                  />
                  <el-option
                    label="上级"
                    :value="HrmPerformanceRaterType.SUPERIOR"
                  />
                  <el-option
                    label="部门负责人"
                    :value="HrmPerformanceRaterType.DEPT_LEADER"
                  />
                  <el-option
                    label="指定评分人"
                    :value="HrmPerformanceRaterType.SPECIFIED"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="评分人范围"
              min-width="190"
            >
              <template #default="scope">
                <HrmPerformanceRaterLevelSelect
                  v-if="
                    scope.row.rater.type === HrmPerformanceRaterType.SUPERIOR ||
                      scope.row.rater.type === HrmPerformanceRaterType.DEPT_LEADER
                  "
                  v-model="scope.row.rater.level"
                  :rater-type="scope.row.rater.type"
                  aria-label="评分人层级"
                  :disabled="props.disabled"
                  class="!w-1/1"
                />
                <HrmEmployeeSelect
                  v-else-if="scope.row.rater.type === HrmPerformanceRaterType.SPECIFIED"
                  v-model="scope.row.rater.employeeId"
                  :disabled="props.disabled"
                  placeholder="请选择评分人"
                />
                <span
                  v-else
                  class="text-gray-500"
                >当前被考核员工</span>
              </template>
            </el-table-column>
            <el-table-column
              label="评分权重"
              width="125"
            >
              <template #default="scope">
                <div class="flex items-center gap-6px">
                  <el-input-number
                    v-model="scope.row.weight"
                    :controls="false"
                    :disabled="props.disabled"
                    :max="100"
                    :min="0.01"
                    :precision="2"
                    aria-label="评分权重"
                    class="!w-1/1"
                  />
                  <span class="text-gray-500">%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="评分方式"
              min-width="160"
            >
              <template #default="scope">
                <el-select
                  v-model="scope.row.scoringType"
                  aria-label="评分方式"
                  :disabled="props.disabled"
                  class="!w-1/1"
                >
                  <el-option
                    label="按指标评分"
                    :value="HrmPerformanceReviewScoringType.QUOTA"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="可见内容"
              min-width="145"
            >
              <template #default="scope">
                <el-select
                  v-model="scope.row.visibleContent"
                  aria-label="可见内容"
                  :disabled="props.disabled"
                  class="!w-1/1"
                >
                  <el-option
                    label="全部评分"
                    :value="HrmPerformanceReviewVisibleContent.ALL"
                  />
                  <el-option
                    label="仅自己"
                    :value="HrmPerformanceReviewVisibleContent.SELF"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="评语必填"
              align="center"
              width="95"
            >
              <template #default="scope">
                <el-switch
                  v-model="scope.row.requiredSetting"
                  aria-label="评语必填"
                  :disabled="props.disabled"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="允许驳回"
              align="center"
              width="95"
            >
              <template #default="scope">
                <el-switch
                  v-model="scope.row.rejectAuthority"
                  :disabled="props.disabled || scope.row.rater.type === HrmPerformanceRaterType.SELF"
                  aria-label="允许驳回"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="72"
            >
              <template #default="scope">
                <el-button
                  :disabled="props.disabled"

                  title="删除评分阶段"
                  type="text"
                  @click="removeReviewStage(scope.$index)"
                >
                  <i class="el-icon-delete" />
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>

      <div class="process-section-title">
        <span>结果审核</span>
        <span class="process-section-tip">
          审核驳回后，员工重新提交评分；已通过的审核层级保留，从驳回层级继续处理。
        </span>
      </div>
      <el-form-item
        label="启用结果审核"
        prop="resultAudit"
      >
        <el-switch
          v-model="resultAudit"
          :disabled="props.disabled"
        />
      </el-form-item>
      <el-form-item
        v-if="model.resultAudit"
        label="审核节点"
        prop="resultAuditStages"
      >
        <PerformancePlanHandlerStageForm
          v-model="resultAuditStages"
          :disabled="props.disabled"
        />
      </el-form-item>

      <div class="process-section-title">
        <span>结果确认</span>
        <span class="process-section-tip">
          员工确认考核结果；如有异议，可发起申诉，并由配置的申诉节点逐级处理。
        </span>
      </div>
      <el-form-item
        label="启用结果确认"
        prop="resultConfirmation"
      >
        <el-switch
          v-model="resultConfirmation"
          :disabled="props.disabled"
        />
      </el-form-item>
      <template v-if="model.resultConfirmation">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="超期天数"
              prop="appealTimeoutDays"
            >
              <el-input-number
                v-model="model.appealTimeoutDays"
                :disabled="props.disabled"
                :max="100"
                :min="1"
                :precision="0"
                class="!w-1/1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="超期处理"
              prop="appealTimeoutAction"
            >
              <el-select
                v-model="model.appealTimeoutAction"
                :disabled="props.disabled"
                class="!w-1/1"
              >
                <el-option
                  label="未审批自动拒绝"
                  :value="HrmPerformanceAppealTimeoutAction.REJECT"
                />
                <el-option
                  label="未审批自动通过"
                  :value="HrmPerformanceAppealTimeoutAction.APPROVE"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      <el-form-item
        v-if="model.resultConfirmation"
        label="申诉节点"
        prop="appealStages"
      >
        <PerformancePlanHandlerStageForm
          v-model="appealStages"
          :disabled="props.disabled"
        />
      </el-form-item>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import HrmPerformanceRaterLevelSelect from '@/views/hrm/performance/components/HrmPerformanceRaterLevelSelect.vue'
import { HrmPerformanceAppealTimeoutAction, HrmPerformanceQuotaSettingType, HrmPerformanceRaterType, HrmPerformanceRaterTypeOptions, HrmPerformanceReviewScoringType, HrmPerformanceReviewVisibleContent } from '@/views/hrm/utils/constants'
import PerformancePlanHandlerStageForm from './PerformancePlanHandlerStageForm.vue'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanProcessForm' },
  __name: 'PerformancePlanProcessForm',
  components: { HrmEmployeeSelect, HrmPerformanceRaterLevelSelect, PerformancePlanHandlerStageForm },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    disabled: { type: Boolean, required: true },
    'modelValue': { type: null, ...{ required: true }},
    'modelModifiers': {}
  },
  emits: ['update:modelValue'],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose()
    const props = __props
    const model = computed({
      get: () => __props.modelValue,
      set: (value) => __emit('update:modelValue', value)
    }) // 绩效计划表单数据
    const targetConfirmationStage = computed(() => model.value.targetConfirmationStage || {}) // 目标确认阶段
    const reviewWeightTotal = computed(() => Number((model.value.reviewStages || [])
      .reduce((total, stage) => total + Number(stage.weight || 0), 0)
      .toFixed(2)))
    const hasSelfStage = computed(() => (model.value.reviewStages || []).some((stage) => stage.rater?.type === HrmPerformanceRaterType.SELF))
    const resultAuditStages = computed({
      get: () => model.value.resultAuditStages || [],
      set: (value) => (model.value.resultAuditStages = value)
    })
    const appealStages = computed({
      get: () => model.value.appealStages || [],
      set: (value) => (model.value.appealStages = value)
    })
    const resultAudit = computed({
      get: () => Boolean(model.value.resultAudit),
      set: (value) => {
        model.value.resultAudit = value
        if (value && !model.value.resultAuditStages?.length) {
          model.value.resultAuditStages = [createDefaultHandlerStage()]
        }
      }
    })
    const resultConfirmation = computed({
      get: () => Boolean(model.value.resultConfirmation),
      set: (value) => {
        model.value.resultConfirmation = value
        if (value && !model.value.appealStages?.length) {
          model.value.appealStages = [createDefaultHandlerStage()]
        }
      }
    })
    /** 创建默认处理节点 */
    function createDefaultHandlerStage() {
      return {
        type: HrmPerformanceRaterType.DEPT_LEADER,
        level: 1
      }
    }
    /** 切换指标制定方式 */
    function handleQuotaSettingChange() {
      if (model.value.quotaSettingType === HrmPerformanceQuotaSettingType.EMPLOYEE) {
        return
      }
      clearTargetConfirmation()
    }
    /** 切换目标确认 */
    function handleTargetConfirmationChange(value) {
      model.value.targetConfirmation = Boolean(value)
      model.value.targetConfirmationStage = value
        ? { type: HrmPerformanceRaterType.SUPERIOR, level: 1 }
        : undefined
    }
    /** 切换目标确认人类型 */
    function handleTargetConfirmerTypeChange() {
      const stage = model.value.targetConfirmationStage
      if (!stage) {
        return
      }
      stage.level =
                stage.type === HrmPerformanceRaterType.SUPERIOR ||
                    stage.type === HrmPerformanceRaterType.DEPT_LEADER
                  ? 1
                  : undefined
      stage.employeeId = undefined
    }
    /** 清空目标确认配置 */
    function clearTargetConfirmation() {
      model.value.targetConfirmation = false
      model.value.targetConfirmationStage = undefined
    }
    /** 添加评分阶段 */
    function addReviewStage(raterType) {
      const reviewStages = model.value.reviewStages || []
      reviewStages.push({
        rater: {
          type: raterType,
          level: raterType === HrmPerformanceRaterType.SUPERIOR ||
                        raterType === HrmPerformanceRaterType.DEPT_LEADER
            ? 1
            : undefined
        },
        weight: 0,
        scoringType: HrmPerformanceReviewScoringType.QUOTA,
        visibleContent: HrmPerformanceReviewVisibleContent.ALL,
        requiredSetting: false,
        rejectAuthority: raterType !== HrmPerformanceRaterType.SELF
      })
      model.value.reviewStages = reviewStages
    }
    /** 删除评分阶段 */
    function removeReviewStage(index) {
            model.value.reviewStages?.splice(index, 1)
    }
    /** 切换评分人类型 */
    function handleRaterTypeChange(stage) {
      if (!stage.rater) {
        return
      }
      stage.rater.level =
                stage.rater.type === HrmPerformanceRaterType.SUPERIOR ||
                    stage.rater.type === HrmPerformanceRaterType.DEPT_LEADER
                  ? 1
                  : undefined
      stage.rater.employeeId = undefined
      if (stage.rater.type === HrmPerformanceRaterType.SELF) {
        stage.rejectAuthority = false
      }
    }
    const __returned__ = { props, model, targetConfirmationStage, reviewWeightTotal, hasSelfStage, resultAuditStages, appealStages, resultAudit, resultConfirmation, createDefaultHandlerStage, handleQuotaSettingChange, handleTargetConfirmationChange, handleTargetConfirmerTypeChange, clearTargetConfirmation, addReviewStage, removeReviewStage, handleRaterTypeChange, HrmEmployeeSelect, HrmPerformanceRaterLevelSelect, get HrmPerformanceAppealTimeoutAction() { return HrmPerformanceAppealTimeoutAction }, get HrmPerformanceQuotaSettingType() { return HrmPerformanceQuotaSettingType }, get HrmPerformanceRaterType() { return HrmPerformanceRaterType }, get HrmPerformanceRaterTypeOptions() { return HrmPerformanceRaterTypeOptions }, get HrmPerformanceReviewScoringType() { return HrmPerformanceReviewScoringType }, get HrmPerformanceReviewVisibleContent() { return HrmPerformanceReviewVisibleContent }, PerformancePlanHandlerStageForm }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style scoped>
.process-section-title {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: 10px;
  margin: 8px 0 16px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  border-left: 3px solid #409eff;
}

.process-section-title:not(:first-child) {
  margin-top: 28px;
}

.process-section-tip {
  color: #909399;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
}
</style>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
