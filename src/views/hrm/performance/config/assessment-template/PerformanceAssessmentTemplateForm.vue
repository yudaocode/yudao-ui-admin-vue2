<template>
  <div class="hrm-performance-page">
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="1120px"
      append-to-body
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="112px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="考核模板名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                maxlength="50"
                placeholder="请输入考核模板名称"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="考核指标说明"
          prop="illustrate"
        >
          <el-input
            v-model="formData.illustrate"
            :rows="3"
            maxlength="200"
            placeholder="请输入考核指标说明"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
        <PerformanceAssessmentConfigEditor
          ref="configEditorRef"
          v-model="formData"
        />
      </el-form>
      <template #footer>
        <el-button
          :disabled="formLoading"
          type="primary"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Message, MessageBox } from 'element-ui'
import { ref, reactive } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import * as PerformanceAssessmentTemplateApi from '@/api/hrm/performance/config/assessment-template'
import { HrmPerformanceScoreCalculation, HrmPerformanceUpperLimitType } from '@/views/hrm/utils/constants'
import PerformanceAssessmentConfigEditor from './components/PerformanceAssessmentConfigEditor.vue'
/** 绩效考核模板表单 */
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceAssessmentTemplateForm' },
  __name: 'PerformanceAssessmentTemplateForm',
  components: { PerformanceAssessmentConfigEditor },
  emits: ['success'],
  setup(__props, { expose: __expose, emit: __emit }) {
    const message = {
      success: (text) => Message.success(text),
      warning: (text) => Message.warning(text),
      error: (text) => Message.error(text),
      confirm: (text) => MessageBox.confirm(text, '提示', { type: 'warning' }),
      delConfirm: (text = '是否确认删除所选数据项？') =>
        MessageBox.confirm(text, '提示', { type: 'warning' })
    } // 消息弹窗
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
    const formType = ref('') // 表单的类型：create - 新增；update - 修改
    const formData = ref(createDefaultFormData()) // 表单数据
    const formRules = reactive({
      name: [
        { required: true, message: '考核模板名称不能为空', trigger: 'blur' },
        { max: 50, message: '考核模板名称不能超过 50 个字符', trigger: 'blur' }
      ],
      illustrate: [{ max: 200, message: '考核指标说明不能超过 200 个字符', trigger: 'blur' }],
      scoreCalculation: [{ required: true, message: '总分计算不能为空', trigger: 'change' }],
      upperLimitType: [{ required: true, message: '评分上限类型不能为空', trigger: 'change' }],
      upperLimitScore: [{ required: true, message: '评分上限不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    const configEditorRef = ref() // 考核配置编辑器 Ref
    /** 打开弹窗 */
    async function open(type, id) {
      dialogVisible.value = true
      dialogTitle.value = { create: '新增', update: '编辑' }[type] || '编辑'
      formType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          // 获取表单数据
          formData.value = (await PerformanceAssessmentTemplateApi.getPerformanceAssessmentTemplate(id)).data
        } finally {
          formLoading.value = false
        }
      }
    }
    __expose({ open }) // 提供 open 方法，用于打开组件
    const emit = __emit // 定义组件事件
    /** 提交表单 */
    async function submitForm() {
      // 校验表单
      await formRef.value?.validate()
      if (!configEditorRef.value?.validate()) {
        return
      }
      // 提交请求
      formLoading.value = true
      try {
        if (formType.value === 'create') {
          await PerformanceAssessmentTemplateApi.createPerformanceAssessmentTemplate(formData.value)
          message.success('新增成功')
        } else {
          await PerformanceAssessmentTemplateApi.updatePerformanceAssessmentTemplate(formData.value)
          message.success('修改成功')
        }
        dialogVisible.value = false
        // 发送操作成功的事件
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    /** 重置表单 */
    function resetForm() {
      formData.value = createDefaultFormData()
            formRef.value?.resetFields()
    }
    /** 创建默认表单数据 */
    function createDefaultFormData() {
      return {
        id: undefined,
        name: '',
        illustrate: '',
        scoreCalculation: HrmPerformanceScoreCalculation.WEIGHTED,
        upperLimitType: HrmPerformanceUpperLimitType.UNIFIED,
        upperLimitScore: 100,
        dimensions: []
      }
    }
    const __returned__ = { message, dialogVisible, dialogTitle, formLoading, formType, formData, formRules, formRef, configEditorRef, open, emit, submitForm, resetForm, createDefaultFormData, PerformanceAssessmentConfigEditor }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
