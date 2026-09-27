<template>
  <div class="hrm-performance-page">
    <div class="w-full">
      <el-table
        :data="modelValue"
        border
      >
        <el-table-column
          label="处理人"
          min-width="150"
        >
          <template #default="scope">
            <el-select
              v-model="scope.row.type"
              class="!w-1/1"
              placeholder="请选择处理人"
              :disabled="disabled"
              @change="handleHandlerTypeChange(scope.row)"
            >
              <el-option
                v-for="item in HrmPerformanceHandlerTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          label="处理人范围"
          min-width="220"
        >
          <template #default="scope">
            <HrmPerformanceRaterLevelSelect
              v-if="
                scope.row.type === HrmPerformanceRaterType.SUPERIOR ||
                  scope.row.type === HrmPerformanceRaterType.DEPT_LEADER
              "
              v-model="scope.row.level"
              class="!w-1/1"
              :rater-type="scope.row.type"
              :disabled="disabled"
            />
            <HrmEmployeeSelect
              v-else
              v-model="scope.row.employeeId"
              placeholder="请选择处理员工"
              :disabled="disabled"
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

              type="text"
              title="删除处理节点"
              :disabled="disabled || modelValue.length <= 1"
              @click="removeStage(scope.$index)"
            >
              <i class="el-icon-delete" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button
        class="mt-12px"
        plain
        :disabled="disabled || modelValue.length >= 3"
        @click="addStage"
      >
        <i class="el-icon-plus mr-5px" />新增处理节点
      </el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent as _defineComponent } from 'vue'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import HrmPerformanceRaterLevelSelect from '@/views/hrm/performance/components/HrmPerformanceRaterLevelSelect.vue'
import { HrmPerformanceHandlerTypeOptions, HrmPerformanceRaterType } from '@/views/hrm/utils/constants'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanHandlerStageForm' },
  __name: 'PerformancePlanHandlerStageForm',
  components: { HrmEmployeeSelect, HrmPerformanceRaterLevelSelect },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Array, required: true },
    disabled: { type: Boolean, required: false, default: false }
  },
  emits: ['update:modelValue'],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose()
    const props = __props
    const emit = __emit // 定义 modelValue 更新事件
    /** 新增处理阶段 */
    function addStage() {
      emit('update:modelValue', [
        ...props.modelValue,
        { type: HrmPerformanceRaterType.SUPERIOR, level: 1 }
      ])
    }
    /** 删除处理阶段 */
    function removeStage(index) {
      emit('update:modelValue', props.modelValue.filter((_, stageIndex) => stageIndex !== index))
    }
    /** 处理人类型变化操作 */
    function handleHandlerTypeChange(stage) {
      stage.level =
                stage.type === HrmPerformanceRaterType.SUPERIOR ||
                    stage.type === HrmPerformanceRaterType.DEPT_LEADER
                  ? 1
                  : undefined
      stage.employeeId = undefined
    }
    const __returned__ = { props, emit, addStage, removeStage, handleHandlerTypeChange, HrmEmployeeSelect, HrmPerformanceRaterLevelSelect, get HrmPerformanceHandlerTypeOptions() { return HrmPerformanceHandlerTypeOptions }, get HrmPerformanceRaterType() { return HrmPerformanceRaterType } }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
