<template>
  <Dialog title="新增反馈" v-model="dialogVisible" width="600px" @closed="resetForm">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="formData.status" style="width: 100%">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="反馈内容" prop="content">
        <el-input
          v-model="formData.content"
          :rows="5"
          maxlength="1000"
          placeholder="请输入任务反馈"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button :loading="formLoading" @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as TaskApi from '@/api/oa/task'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OA_TASK_STATUS } from '@/views/oa/utils/constants-collab'

export default {
  name: 'OaTaskFeedbackForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: {
        taskId: 0,
        publisher: false,
        status: OA_TASK_STATUS.NEW,
        content: ''
      },
      formRules: {
        status: [{ required: true, message: '任务状态不能为空', trigger: 'change' }]
      },
      statusOptions: [...getIntDictOptions(DICT_TYPE.OA_TASK_STATUS)]
    }
  },
  methods: {
    /** 打开反馈表单 */
    open(task, mode) {
      const status = (mode === 'published' ? task.status : task.receiverStatus) || OA_TASK_STATUS.NEW
      if (task.canceled || (mode !== 'published' && status >= OA_TASK_STATUS.SUBMITTED)) return
      this.formData = { taskId: task.id, publisher: mode === 'published', status, content: '' }
      this.statusOptions =
        mode === 'published'
          ? [...getIntDictOptions(DICT_TYPE.OA_TASK_STATUS)]
          : getIntDictOptions(DICT_TYPE.OA_TASK_STATUS).filter(
            item => item.value >= OA_TASK_STATUS.NEW && item.value <= OA_TASK_STATUS.SUBMITTED
          )
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        // 保存成功后关闭弹窗，并通知详情刷新；失败时保留输入内容
        this.formLoading = true
        TaskApi.feedbackTask(this.formData).then(() => {
          this.$modal.msgSuccess('反馈成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = { taskId: 0, publisher: false, status: OA_TASK_STATUS.NEW, content: '' }
    }
  }
}
</script>
