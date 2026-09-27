<template>
  <div class="hrm-performance-page">
    <div class="mx-auto max-w-1100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="考核计划名称"
            prop="name"
          >
            <el-input
              v-model="model.name"
              maxlength="50"
              placeholder="请输入考核计划名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="周期类型"
            prop="cycleType"
          >
            <el-select
              v-model="model.cycleType"
              class="!w-1/1"
              placeholder="请选择周期类型"
              @change="handleCycleTypeChange"
            >
              <el-option
                v-for="item in HrmPerformanceCycleTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="考核周期"
        prop="cycle"
      >
        <el-date-picker
          v-if="model.cycleType === HrmPerformanceCycleType.MONTH"
          v-model="model.cycle"
          class="!w-1/1"
          placeholder="请选择月份"
          type="month"
          value-format="yyyy-MM"
        />
        <div
          v-else-if="model.cycleType === HrmPerformanceCycleType.QUARTER"
          class="grid w-1/1 grid-cols-2 gap-12px"
        >
          <el-date-picker
            v-model="model.cycle"
            class="!w-1/1"
            placeholder="请选择年份"
            type="year"
            value-format="yyyy"
          />
          <el-select
            v-model="model.quarter"
            class="!w-1/1"
            placeholder="请选择季度"
          >
            <el-option
              label="第一季度"
              :value="1"
            />
            <el-option
              label="第二季度"
              :value="2"
            />
            <el-option
              label="第三季度"
              :value="3"
            />
            <el-option
              label="第四季度"
              :value="4"
            />
          </el-select>
        </div>
        <el-date-picker
          v-else-if="model.cycleType !== HrmPerformanceCycleType.OTHER"
          v-model="model.cycle"
          class="!w-1/1"
          placeholder="请选择年份"
          type="year"
          value-format="yyyy"
        />
        <el-date-picker
          v-else
          v-model="customDateRange"
          class="!w-1/1"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item
        label="考核范围"
        prop="scopes"
      >
        <PerformancePlanScopeForm v-model="scopes" />
      </el-form-item>
      <el-form-item
        label="考核说明"
        prop="description"
      >
        <el-input
          v-model="model.description"
          :rows="4"
          maxlength="200"
          placeholder="请输入考核说明"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { HrmPerformanceCycleType, HrmPerformanceCycleTypeOptions } from '@/views/hrm/utils/constants'
import PerformancePlanScopeForm from './PerformancePlanScopeForm.vue'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanBasicForm' },
  __name: 'PerformancePlanBasicForm',
  components: { PerformancePlanScopeForm },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    'modelValue': { type: null, ...{
      required: true
    }},
    'modelModifiers': {},
    'customDateRange': { type: Array, ...{
      required: true
    }},
    'customDateRangeModifiers': {}
  },
  emits: ['update:modelValue', 'update:customDateRange'],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose()
    const model = computed({
      get: () => __props.modelValue,
      set: (value) => __emit('update:modelValue', value)
    })
    const customDateRange = computed({
      get: () => __props.customDateRange,
      set: (value) => __emit('update:customDateRange', value)
    })
    const scopes = computed({
      get: () => model.value.scopes || [],
      set: (value) => (model.value.scopes = value)
    })
    /** 切换考核周期类型 */
    function handleCycleTypeChange() {
      model.value.cycle = ''
      model.value.quarter = model.value.cycleType === HrmPerformanceCycleType.QUARTER ? 1 : undefined
      customDateRange.value = []
    }
    const __returned__ = { model, customDateRange, scopes, handleCycleTypeChange, get HrmPerformanceCycleType() { return HrmPerformanceCycleType }, get HrmPerformanceCycleTypeOptions() { return HrmPerformanceCycleTypeOptions }, PerformancePlanScopeForm }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
