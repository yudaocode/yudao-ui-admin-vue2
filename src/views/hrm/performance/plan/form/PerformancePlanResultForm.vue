<template>
  <div class="hrm-performance-page">
    <div class="mx-auto max-w-1100px">
      <el-form-item
        label="考核结果模板"
        prop="resultTemplateId"
      >
        <el-select
          v-model="model.resultTemplateId"
          class="!w-1/1"
          filterable
          placeholder="请选择考核结果模板"
          @change="handleResultTemplateChange"
        >
          <el-option
            v-for="template in resultTemplateOptions"
            :key="template.id"
            :label="template.name"
            :value="template.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="同步到薪资"
        prop="syncToSalary"
      >
        <el-switch v-model="syncToSalary" />
      </el-form-item>
      <el-form-item
        v-if="model.syncToSalary"
        label="参与计薪月份"
        prop="paidForMonth"
        required
      >
        <el-date-picker
          v-model="model.paidForMonth"
          class="!w-1/1"
          placeholder="请选择参与计薪月份"
          type="month"
          value-format="yyyy-MM"
        />
      </el-form-item>
      <el-form-item
        label="结果等级"
        prop="resultConfig"
      >
        <PerformanceResultLevelForm
          ref="resultLevelFormRef"
          v-model="resultLevels"
          :disabled="props.disabled"
        />
      </el-form-item>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import PerformanceResultLevelForm from '../../config/result-template/components/PerformanceResultLevelForm.vue'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanResultForm' },
  __name: 'PerformancePlanResultForm',
  components: { PerformanceResultLevelForm },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    disabled: { type: Boolean, required: true },
    resultTemplateList: { type: Array, required: true },
    'modelValue': { type: null, ...{ required: true }},
    'modelModifiers': {}
  },
  emits: ['update:modelValue'],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props
    const model = computed({
      get: () => __props.modelValue,
      set: (value) => __emit('update:modelValue', value)
    }) // 绩效计划表单数据
    const resultLevelFormRef = ref() // 结果等级表单 Ref
    const resultTemplateOptions = computed(() => props.resultTemplateList.filter((template) => template.id !== undefined))
    const resultLevels = computed({
      get: () => model.value.resultConfig?.levels || [],
      set: (value) => {
        model.value.resultConfig = {
          name: model.value.resultConfig?.name || '',
          levels: value
        }
      }
    })
    const syncToSalary = computed({
      get: () => Boolean(model.value.syncToSalary),
      set: (value) => {
        model.value.syncToSalary = value
        if (!value) {
          model.value.paidForMonth = ''
        }
      }
    })
    /** 切换结果模板 */
    function handleResultTemplateChange(resultTemplateId) {
      const resultTemplate = props.resultTemplateList.find((template) => template.id === resultTemplateId)
      model.value.resultConfig = resultTemplate
        ? {
          name: resultTemplate.name,
          levels: resultTemplate.levels.map((level) => ({ ...level }))
        }
        : { name: '', levels: [] }
    }
    /** 校验结果等级 */
    function validate() {
      return resultLevelFormRef.value?.validate()
    }
    __expose({ validate }) // 提供 validate 方法，用于校验表单
    const __returned__ = { props, model, resultLevelFormRef, resultTemplateOptions, resultLevels, syncToSalary, handleResultTemplateChange, validate, PerformanceResultLevelForm }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
