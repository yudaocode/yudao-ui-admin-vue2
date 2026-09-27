<template>
  <div class="hrm-performance-page">
    <div class="w-full">
      <div class="mb-12px flex items-center justify-between gap-16px">
        <span class="text-13px text-[var(--el-text-color-secondary)]">
          分数区间须从 0 到 100 连续且不重叠；绩效系数不小于 0，分数和系数最多保留两位小数。
        </span>
        <el-button
          plain
          :disabled="disabled"
          @click="addLevel"
        >
          <i class="el-icon-plus mr-5px" />新增结果等级
        </el-button>
      </div>
      <el-table
        :data="modelValue"
        border
        empty-text="暂无结果等级"
      >
        <el-table-column
          label="等级"
          min-width="140"
        >
          <template #default="scope">
            <el-input
              v-model.trim="scope.row.name"
              :disabled="disabled"
              maxlength="255"
              placeholder="请输入等级"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="最低分数"
          width="150"
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.minScore"
              :disabled="disabled"
              :min="0"
              :max="100"
              :precision="2"
              :controls="false"
              class="!w-1/1"
              placeholder="0~100"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="最高分数"
          width="150"
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.maxScore"
              :disabled="disabled"
              :min="0"
              :max="100"
              :precision="2"
              :controls="false"
              class="!w-1/1"
              placeholder="0~100"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="绩效系数"
          width="150"
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.coefficient"
              :disabled="disabled"
              :min="0"
              :precision="2"
              :controls="false"
              class="!w-1/1"
              placeholder="请输入系数"
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
              title="删除结果等级"
              :disabled="disabled"
              @click="removeLevel(scope.$index)"
            >
              <i class="el-icon-delete" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { Message, MessageBox } from 'element-ui'
import { defineComponent as _defineComponent } from 'vue'
import { isValidPerformanceCoefficient, isValidPerformanceScore, isSameNumber } from '@/views/hrm/utils/performance'
/** 绩效结果等级表单 */
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceResultLevelForm' },
  __name: 'PerformanceResultLevelForm',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Array, required: true },
    disabled: { type: Boolean, required: false, default: false }
  },
  emits: ['update:modelValue'],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props
    const emit = __emit // 定义 modelValue 更新事件
    const message = {
      success: (text) => Message.success(text),
      warning: (text) => Message.warning(text),
      error: (text) => Message.error(text),
      confirm: (text) => MessageBox.confirm(text, '提示', { type: 'warning' }),
      delConfirm: (text = '是否确认删除所选数据项？') =>
        MessageBox.confirm(text, '提示', { type: 'warning' })
    } // 消息弹窗
    /** 校验结果等级名称和连续分数区间 */
    function validate() {
      if (!props.modelValue.length) {
        message.warning('至少需要一个结果等级')
        return false
      }
      const names = new Set()
      for (const level of props.modelValue) {
        const name = level.name?.trim()
        if (!name) {
          message.warning('等级名称不能为空')
          return false
        }
        if (names.has(name)) {
          message.warning(`等级名称（${name}）重复`)
          return false
        }
        names.add(name)
        if (!isValidPerformanceScore(level.minScore) || !isValidPerformanceScore(level.maxScore)) {
          message.warning(`等级（${name}）的分数必须在 0 到 100 之间，并最多保留两位小数`)
          return false
        }
        if (level.minScore > level.maxScore) {
          message.warning(`等级（${name}）的最低分数不能大于最高分数`)
          return false
        }
        if (!isValidPerformanceCoefficient(level.coefficient)) {
          message.warning(`等级（${name}）的绩效系数不能小于 0，并最多保留两位小数`)
          return false
        }
      }
      const sortedLevels = [...props.modelValue].sort((left, right) => left.minScore - right.minScore)
      if (!isSameNumber(sortedLevels[0].minScore, 0)) {
        message.warning('结果等级必须覆盖 0 分')
        return false
      }
      for (let index = 1; index < sortedLevels.length; index++) {
        if (!isSameNumber(sortedLevels[index].minScore, sortedLevels[index - 1].maxScore + 0.01)) {
          message.warning('结果等级分数区间必须连续且不能重叠')
          return false
        }
      }
      if (!isSameNumber(sortedLevels[sortedLevels.length - 1].maxScore, 100)) {
        message.warning('结果等级必须覆盖 100 分')
        return false
      }
      return true
    }
    __expose({ validate }) // 提供 validate 方法，用于校验表单
    /** 新增结果等级 */
    function addLevel() {
      emit('update:modelValue', [
        ...props.modelValue,
        { name: '', minScore: 0, maxScore: 0, coefficient: 1 }
      ])
    }
    /** 删除结果等级 */
    function removeLevel(index) {
      emit('update:modelValue', props.modelValue.filter((_, levelIndex) => levelIndex !== index))
    }
    const __returned__ = { props, emit, message, validate, addLevel, removeLevel }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
