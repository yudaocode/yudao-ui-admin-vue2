<template>
  <div class="hrm-performance-page">
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="920px"
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
              label="结果设置名称"
              prop="name"
            >
              <el-input
                v-model.trim="formData.name"
                maxlength="255"
                placeholder="请输入结果设置名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="结果等级"
          prop="levels"
        >
          <PerformanceResultLevelForm
            ref="resultLevelFormRef"
            v-model="formData.levels"
          />
        </el-form-item>
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
import * as PerformanceResultTemplateApi from '@/api/hrm/performance/config/result-template'
import PerformanceResultLevelForm from './components/PerformanceResultLevelForm.vue'
/** 绩效结果模板表单 */
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceResultTemplateForm' },
  __name: 'PerformanceResultTemplateForm',
  components: { PerformanceResultLevelForm },
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
    const formData = ref({
      id: undefined,
      name: '',
      levels: []
    }) // 表单数据
    const formRules = reactive({
      name: [{ required: true, message: '结果设置名称不能为空', trigger: 'blur' }]
    })
    const formRef = ref() // 表单 Ref
    const resultLevelFormRef = ref() // 结果等级表单 Ref
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
          formData.value = (await PerformanceResultTemplateApi.getPerformanceResultTemplate(id)).data
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
      if (!resultLevelFormRef.value?.validate()) {
        return
      }
      // 提交请求
      formLoading.value = true
      try {
        if (formType.value === 'create') {
          await PerformanceResultTemplateApi.createPerformanceResultTemplate(formData.value)
          message.success('新增成功')
        } else {
          await PerformanceResultTemplateApi.updatePerformanceResultTemplate(formData.value)
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
      formData.value = {
        id: undefined,
        name: '',
        levels: [
          { name: 'S', minScore: 85, maxScore: 100, coefficient: 1.2 },
          { name: 'A', minScore: 75, maxScore: 84.99, coefficient: 1 },
          { name: 'B', minScore: 60, maxScore: 74.99, coefficient: 0.8 },
          { name: 'C', minScore: 0, maxScore: 59.99, coefficient: 0.6 }
        ]
      }
            formRef.value?.resetFields()
    }
    const __returned__ = { message, dialogVisible, dialogTitle, formLoading, formType, formData, formRules, formRef, resultLevelFormRef, open, emit, submitForm, resetForm, PerformanceResultLevelForm }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
