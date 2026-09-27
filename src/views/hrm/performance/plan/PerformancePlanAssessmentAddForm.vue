<template>
  <div class="hrm-performance-page">
    <el-dialog
      :visible.sync="dialogVisible"
      title="添加参评员工"
      width="620px"
      append-to-body
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item
          label="参评员工"
          prop="employeeIds"
        >
          <HrmEmployeeSelect
            v-model="formData.employeeIds"
            multiple
            :selectable="isEmployeeSelectable"
            placeholder="请选择未加入当前计划的员工"
            title="选择参评员工"
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
import { ref } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import * as PerformanceAssessmentApi from '@/api/hrm/performance/assessment'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanAssessmentAddForm' },
  __name: 'PerformancePlanAssessmentAddForm',
  components: { HrmEmployeeSelect },
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
    const dialogVisible = ref(false) // 弹窗是否展示
    const formLoading = ref(false) // 表单加载中
    const formRef = ref() // 表单 Ref
    const planId = ref() // 绩效计划编号
    const selectableEmployeeIds = ref(new Set()) // 可选员工编号
    const formData = ref({
      employeeIds: []
    })
    const formRules = {
      employeeIds: [{ required: true, message: '请选择参评员工', trigger: 'change' }]
    }
    /** 打开弹窗 */
    async function open(id) {
      dialogVisible.value = true
      formLoading.value = true
      planId.value = id
      formData.value.employeeIds = []
            formRef.value?.resetFields()
            try {
              // 获取可添加员工编号
              selectableEmployeeIds.value = new Set((await PerformanceAssessmentApi.getPerformancePlanUnassignedEmployeeIdList(id)).data)
            } finally {
              formLoading.value = false
            }
    }
    __expose({ open }) // 提供 open 方法，用于打开组件
    /** 判断员工是否允许加入当前计划 */
    function isEmployeeSelectable(employee) {
      return !!employee.id && selectableEmployeeIds.value.has(employee.id)
    }
    const emit = __emit // 定义组件事件
    /** 提交表单 */
    async function submitForm() {
      // 校验表单
      await formRef.value?.validate()
      if (!planId.value) {
        return
      }
      // 提交请求
      formLoading.value = true
      try {
        await PerformanceAssessmentApi.addPerformancePlanEmployees({
          planId: planId.value,
          employeeIds: formData.value.employeeIds
        })
        message.success('参评员工添加成功')
        dialogVisible.value = false
        // 发送操作成功的事件
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    const __returned__ = { message, dialogVisible, formLoading, formRef, planId, selectableEmployeeIds, formData, formRules, open, isEmployeeSelectable, emit, submitForm, HrmEmployeeSelect }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
