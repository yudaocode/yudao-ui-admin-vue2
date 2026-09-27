<template>
  <div class="hrm-performance-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item
          label="总分计算"
          :prop="`${propPrefix}scoreCalculation`"
        >
          <el-select
            v-model="model.scoreCalculation"
            :disabled="disabled"
            class="!w-1/1"
            placeholder="请选择"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_PERFORMANCE_SCORE_CALCULATION)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item
          label="评分上限类型"
          :prop="`${propPrefix}upperLimitType`"
        >
          <el-select
            v-model="model.upperLimitType"
            :disabled="disabled"
            class="!w-1/1"
            placeholder="请选择"
          >
            <el-option
              label="统一上限"
              :value="HrmPerformanceUpperLimitType.UNIFIED"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item
          label="评分上限"
          :prop="`${propPrefix}upperLimitScore`"
        >
          <el-input-number
            v-model="model.upperLimitScore"
            :disabled="disabled"
            :min="0"
            :precision="2"
            class="!w-1/1"
            placeholder="请输入评分上限"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-alert
      class="mb-16px"
      :closable="false"
      type="info"
      show-icon
      title="总分 = 评分 × 维度权重 × 指标权重，再累加；维度权重合计须为 100%，不可编辑维度的指标权重合计须为 100%，可编辑维度不可超过 100%。"
    />
    <slot name="after-score-config" />

    <template v-if="showDimensions">
      <div class="mb-12px flex items-center justify-between">
        <div>
          <span class="font-600">考核维度</span>
          <span class="ml-16px text-13px text-gray-500">
            当前维度权重合计：
            <span
              :class="
                !model.dimensions?.length
                  ? 'text-gray-500'
                  : isHundred(dimensionWeightTotal)
                    ? 'text-[var(--el-color-success)]'
                    : 'text-[var(--el-color-danger)]'
              "
            >
              {{ model.dimensions?.length ? `${dimensionWeightTotal}%` : '--' }}
            </span>
          </span>
        </div>
        <el-button
          :disabled="disabled"
          type="primary"
          @click="openDimensionForm()"
        >
          <i class="el-icon-plus mr-5px" /> 新增考核维度
        </el-button>
      </div>

      <el-empty
        v-if="!model.dimensions?.length"
        :image-size="80"
        description="暂无考核维度"
      />
      <div
        v-for="(dimension, dimensionIndex) in model.dimensions"
        :key="dimensionIndex"
        class="mb-16px overflow-hidden border border-solid border-[var(--el-border-color)] rounded-4px"
      >
        <div
          class="flex items-center justify-between border-b border-b-solid border-b-[var(--el-border-color)] bg-[var(--el-fill-color-light)] px-16px py-12px"
        >
          <div>
            <div class="flex items-center gap-12px">
              <span class="font-600">{{ dimension.name }}</span>
              <el-tag effect="plain">{{ formatQuotaType(dimension.quotaType) }}</el-tag>
              <span class="text-13px">
                维度权重
                <span class="text-[var(--el-color-warning)]"> {{ dimension.weight || 0 }}% </span>
              </span>
              <el-tag
                v-if="dimension.allowEdit"
                effect="plain"
                type="success"
              >允许员工填写</el-tag>
            </div>
            <div
              v-if="dimension.remark"
              class="mt-6px text-12px text-gray-500"
            >
              {{ dimension.remark }}
            </div>
          </div>
          <div class="shrink-0">
            <el-button
              :disabled="disabled"

              type="text"
              @click="openDimensionForm(dimensionIndex)"
            >
              编辑
            </el-button>
            <el-button
              :disabled="disabled"

              type="text"
              @click="removeDimension(dimensionIndex)"
            >
              删除
            </el-button>
          </div>
        </div>
        <div class="p-16px">
          <div class="mb-12px flex items-center justify-between">
            <span class="text-13px text-gray-500">
              指标权重合计：
              <span
                :class="
                  isHundred(getQuotaWeightTotal(dimension))
                    ? 'text-[var(--el-color-success)]'
                    : 'text-[var(--el-color-danger)]'
                "
              >
                {{ getQuotaWeightTotal(dimension) }}%
              </span>
            </span>
            <el-button
              :disabled="disabled"
              @click="addQuota(dimensionIndex)"
            >
              <i class="el-icon-plus mr-5px" /> 新增指标项
            </el-button>
          </div>
          <el-table
            :data="dimension.quotas"
            border
            empty-text="暂无考核指标"
          >
            <el-table-column
              label="指标名称"
              min-width="150"
            >
              <template #default="scope">
                <el-input
                  v-model="scope.row.name"
                  :disabled="disabled"
                  maxlength="50"
                  placeholder="请输入指标名称"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="指标说明"
              min-width="190"
            >
              <template #default="scope">
                <el-input
                  v-model="scope.row.illustrate"
                  :autosize="{ minRows: 1, maxRows: 3 }"
                  :disabled="disabled"
                  maxlength="200"
                  placeholder="请输入指标说明"
                  resize="none"
                  type="textarea"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="考核标准"
              min-width="190"
            >
              <template #default="scope">
                <el-input
                  v-model="scope.row.standard"
                  :autosize="{ minRows: 1, maxRows: 3 }"
                  :disabled="disabled"
                  maxlength="200"
                  placeholder="请输入考核标准"
                  resize="none"
                  type="textarea"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="指标权重"
              width="130"
            >
              <template #default="scope">
                <div class="flex items-center gap-6px">
                  <el-input-number
                    v-model="scope.row.weight"
                    :controls="false"
                    :disabled="disabled"
                    :max="100"
                    :min="0"
                    :precision="2"
                    class="!w-1/1"
                  />
                  <span class="text-gray-500">%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="评分方式"
              width="130"
            >
              <template #default="scope">
                <el-select
                  v-model="scope.row.scoreType"
                  :disabled="disabled"
                  class="!w-1/1"
                >
                  <el-option
                    label="直接输入"
                    :value="HrmPerformanceQuotaScoreType.DIRECT_INPUT"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="80"
            >
              <template #default="scope">
                <el-button
                  :disabled="disabled"

                  type="text"
                  @click="removeQuota(dimensionIndex, scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <PerformanceAssessmentDimensionForm
        ref="dimensionFormRef"
        @confirm="handleDimensionConfirm"
      />
    </template>
  </div>
</template>

<script>
import { Message, MessageBox } from 'element-ui'
import { ref, computed } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { HrmPerformanceQuotaScoreType, HrmPerformanceQuotaType, HrmPerformanceUpperLimitType } from '@/views/hrm/utils/constants'
import { getQuotaWeightTotal, isHundred, validateAssessmentConfig } from '@/views/hrm/utils/performance'
import PerformanceAssessmentDimensionForm from '../PerformanceAssessmentDimensionForm.vue'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceAssessmentConfigEditor' },
  __name: 'PerformanceAssessmentConfigEditor',
  components: { PerformanceAssessmentDimensionForm },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    disabled: { type: Boolean, required: false, default: false },
    propPrefix: { type: String, required: false, default: '' },
    showDimensions: { type: Boolean, required: false, default: true },
    'modelValue': { type: null, ...{ required: true }},
    'modelModifiers': {}
  },
  emits: ['update:modelValue'],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props
    const message = {
      success: (text) => Message.success(text),
      warning: (text) => Message.warning(text),
      error: (text) => Message.error(text),
      confirm: (text) => MessageBox.confirm(text, '提示', { type: 'warning' }),
      delConfirm: (text = '是否确认删除所选数据项？') =>
        MessageBox.confirm(text, '提示', { type: 'warning' })
    } // 消息弹窗
    const model = computed({
      get: () => __props.modelValue,
      set: (value) => __emit('update:modelValue', value)
    }) // 考核配置
    const disabled = computed(() => props.disabled) // 是否禁用
    const propPrefix = computed(() => props.propPrefix) // 校验字段前缀
    const showDimensions = computed(() => props.showDimensions) // 是否展示维度
    const dimensionFormRef = ref() // 维度表单 Ref
    const currentDimensionIndex = ref() // 当前维度下标
    const dimensionWeightTotal = computed(() => (model.value.dimensions || []).reduce((total, dimension) => total + Number(dimension.weight || 0), 0))
    /** 校验考核配置 */
    function validate() {
      const errorMessage = validateAssessmentConfig(model.value)
      if (errorMessage) {
        message.warning(errorMessage)
        return false
      }
      return true
    }
    /** 格式化指标类型 */
    function formatQuotaType(quotaType) {
      return quotaType === HrmPerformanceQuotaType.BEHAVIOR ? '行为态度指标' : '业绩指标'
    }
    /** 打开考核维度表单 */
    function openDimensionForm(index) {
      currentDimensionIndex.value = index
            dimensionFormRef.value?.open(index === undefined ? undefined : model.value.dimensions?.[index])
    }
    /** 保存考核维度 */
    function handleDimensionConfirm(dimension) {
      var _a;
      (_a = model.value).dimensions || (_a.dimensions = [])
      if (currentDimensionIndex.value === undefined) {
        model.value.dimensions.push(dimension)
        return
      }
      model.value.dimensions.splice(currentDimensionIndex.value, 1, dimension)
    }
    /** 删除考核维度 */
    function removeDimension(index) {
            model.value.dimensions?.splice(index, 1)
    }
    /** 添加考核指标 */
    function addQuota(dimensionIndex) {
      const dimension = model.value.dimensions?.[dimensionIndex]
      if (!dimension) {
        return
      }
      dimension.quotas || (dimension.quotas = [])
      dimension.quotas.push({
        name: '',
        illustrate: '',
        standard: '',
        weight: undefined,
        scoreType: HrmPerformanceQuotaScoreType.DIRECT_INPUT
      })
    }
    /** 删除考核指标 */
    function removeQuota(dimensionIndex, quotaIndex) {
            model.value.dimensions?.[dimensionIndex]?.quotas?.splice(quotaIndex, 1)
    }
    __expose({ validate }) // 提供 validate 方法，用于校验表单
    const __returned__ = { props, message, model, disabled, propPrefix, showDimensions, dimensionFormRef, currentDimensionIndex, dimensionWeightTotal, validate, formatQuotaType, openDimensionForm, handleDimensionConfirm, removeDimension, addQuota, removeQuota, get DICT_TYPE() { return DICT_TYPE }, get getIntDictOptions() { return getIntDictOptions }, get HrmPerformanceQuotaScoreType() { return HrmPerformanceQuotaScoreType }, get HrmPerformanceUpperLimitType() { return HrmPerformanceUpperLimitType }, get getQuotaWeightTotal() { return getQuotaWeightTotal }, get isHundred() { return isHundred }, PerformanceAssessmentDimensionForm }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
