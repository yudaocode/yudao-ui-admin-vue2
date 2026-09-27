<template>
  <div class="hrm-performance-page">
    <el-select
      v-model="selectValue"
      :clearable="clearable"
      :disabled="disabled"
      :filterable="filterable"
      :loading="loading"
      :placeholder="placeholder"
      class="w-full"
    >
      <el-option
        v-for="template in templateOptions"
        :key="template.id"
        :label="template.name"
        :value="template.id"
      />
    </el-select>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import * as PerformanceAssessmentTemplateApi from '@/api/hrm/performance/config/assessment-template'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceAssessmentTemplateSelect' },
  __name: 'PerformanceAssessmentTemplateSelect',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Number, required: false },
    disabled: { type: Boolean, required: false, default: false },
    clearable: { type: Boolean, required: false, default: true },
    filterable: { type: Boolean, required: false, default: true },
    placeholder: { type: String, required: false, default: '请选择考核指标模板' }
  },
  emits: ['update:modelValue', 'change'],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose()
    const props = __props
    const emit = __emit // 定义 modelValue 更新和 change 事件
    const loading = ref(false) // 选项的加载中
    const templateList = ref([]) // 模板列表
    const selectedTemplate = ref() // 当前回显的停用模板
    const templateOptions = computed(() => {
      const options = templateList.value.filter((template) => template.id !== undefined)
      const currentTemplate = selectedTemplate.value
      if (currentTemplate?.id === undefined ||
                options.some((template) => template.id === currentTemplate.id)) {
        return options
      }
      return [
        currentTemplate,
        ...options
      ]
    })
    const selectValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value)
        emit('change', value)
      }
    })
    /** 补充当前选中的考核模板，支持已停用模板回显 */
    async function ensureSelectedTemplate() {
      const templateId = props.modelValue
      selectedTemplate.value = undefined
      if (templateId == null || templateList.value.some((template) => template.id === templateId)) {
        return
      }
      const { data: template } = await PerformanceAssessmentTemplateApi.getPerformanceAssessmentTemplate(templateId)
      if (props.modelValue === templateId && template?.id === templateId) {
        selectedTemplate.value = template
      }
    }
    /** 获得考核模板选项 */
    async function getTemplateList() {
      loading.value = true
      try {
        templateList.value =
                    (await PerformanceAssessmentTemplateApi.getPerformanceAssessmentTemplateSimpleList()).data
        await ensureSelectedTemplate()
      } finally {
        loading.value = false
      }
    }
    /** 监听选中考核模板变化 */
    watch(() => props.modelValue, () => {
      ensureSelectedTemplate()
    })
    /** 初始化 */
    onMounted(() => {
      getTemplateList()
    })
    const __returned__ = { props, emit, loading, templateList, selectedTemplate, templateOptions, selectValue, ensureSelectedTemplate, getTemplateList }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
