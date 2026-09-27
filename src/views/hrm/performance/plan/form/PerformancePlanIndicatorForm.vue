<template>
  <div class="hrm-performance-page">
    <div class="mx-auto max-w-1200px">
      <div v-loading="templateLoading">
        <PerformanceAssessmentConfigEditor
          ref="configEditorRef"
          v-model="assessmentConfig"
          :disabled="disabled"
          :show-dimensions="Boolean(model.assessmentTemplateId)"
          prop-prefix="assessmentConfig."
        >
          <template #after-score-config>
            <el-form-item
              label="考核指标模板"
              prop="assessmentTemplateId"
            >
              <PerformanceAssessmentTemplateSelect
                v-model="model.assessmentTemplateId"
                @change="handleAssessmentTemplateChange"
              />
            </el-form-item>
          </template>
        </PerformanceAssessmentConfigEditor>
        <el-empty
          v-if="!model.assessmentTemplateId"
          :image-size="96"
          description="请选择考核指标模板"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import * as PerformanceAssessmentTemplateApi from '@/api/hrm/performance/config/assessment-template'
import PerformanceAssessmentConfigEditor from '@/views/hrm/performance/config/assessment-template/components/PerformanceAssessmentConfigEditor.vue'
import PerformanceAssessmentTemplateSelect from '@/views/hrm/performance/config/assessment-template/components/PerformanceAssessmentTemplateSelect.vue'
import { cloneAssessmentConfig, createDefaultAssessmentConfig } from '@/views/hrm/utils/performance'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanIndicatorForm' },
  __name: 'PerformancePlanIndicatorForm',
  components: { PerformanceAssessmentConfigEditor, PerformanceAssessmentTemplateSelect },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    disabled: { type: Boolean, required: true },
    'modelValue': { type: null, ...{ required: true }},
    'modelModifiers': {}
  },
  emits: ['update:modelValue'],
  setup(__props, { expose: __expose, emit: __emit }) {
    const model = computed({
      get: () => __props.modelValue,
      set: (value) => __emit('update:modelValue', value)
    }) // 绩效计划表单数据
    const templateLoading = ref(false) // 考核模板的加载中
    const configEditorRef = ref() // 考核配置编辑器 Ref
    const assessmentConfig = computed({
      get: () => model.value.assessmentConfig || createDefaultAssessmentConfig(),
      set: (value) => {
        model.value.assessmentConfig = value
      }
    })
    /** 切换考核模板，并复制为当前计划的指标配置快照 */
    async function handleAssessmentTemplateChange(templateId) {
      model.value.assessmentConfig = createDefaultAssessmentConfig()
      if (!templateId) {
        return
      }
      templateLoading.value = true
      try {
        const { data: template } = await PerformanceAssessmentTemplateApi.getPerformanceAssessmentTemplate(templateId)
        if (model.value.assessmentTemplateId !== templateId) {
          return
        }
        model.value.assessmentConfig = cloneAssessmentConfig(template)
      } finally {
        templateLoading.value = false
      }
    }
    /** 校验指标配置 */
    function validate() {
      return Boolean(model.value.assessmentTemplateId) && Boolean(configEditorRef.value?.validate())
    }
    __expose({ validate }) // 提供 validate 方法，用于校验表单
    const __returned__ = { model, templateLoading, configEditorRef, assessmentConfig, handleAssessmentTemplateChange, validate, PerformanceAssessmentConfigEditor, PerformanceAssessmentTemplateSelect }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
