<template>
  <div class="hrm-performance-page">
    <el-select
      v-model="selectValue"
      :clearable="clearable"
      :disabled="disabled"
      :placeholder="placeholder"
      class="w-full"
    >
      <el-option
        v-for="level in levels"
        :key="level"
        :label="formatHrmPerformanceRaterLevel(raterType, level)"
        :value="level"
      />
    </el-select>
  </div>
</template>

<script>
import { computed } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { HRM_PERFORMANCE_RATER_MAX_LEVEL } from '@/views/hrm/utils/constants'
import { formatHrmPerformanceRaterLevel } from '@/views/hrm/utils/format'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceRaterLevelSelect' },
  __name: 'HrmPerformanceRaterLevelSelect',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Number, required: false },
    raterType: { type: Number, required: false },
    disabled: { type: Boolean, required: false, default: false },
    clearable: { type: Boolean, required: false, default: false },
    placeholder: { type: String, required: false, default: '请选择层级' }
  },
  emits: ['update:modelValue', 'change'],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose()
    const props = __props
    const emit = __emit // 定义 modelValue 更新和 change 事件
    const raterType = computed(() => props.raterType) // 评分人类型
    const levels = Array.from({ length: HRM_PERFORMANCE_RATER_MAX_LEVEL }, (_, index) => index + 1) // 评分人层级选项
    const selectValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value)
        emit('change', value)
      }
    })
    const __returned__ = { props, emit, raterType, levels, selectValue, get formatHrmPerformanceRaterLevel() { return formatHrmPerformanceRaterLevel } }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
