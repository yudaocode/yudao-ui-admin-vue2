<template>
  <el-dialog title="新增备忘" :visible.sync="dialogVisible" width="520px" append-to-body>
    <el-form ref="form" :model="formData" :rules="formRules" label-width="84px">
      <el-form-item label="提醒时间" prop="reminderTime">
        <el-date-picker
          v-model="formData.reminderTime"
          type="datetime"
          value-format="timestamp"
          class="width-full"
        />
      </el-form-item>
      <el-form-item label="备忘内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          :maxlength="1024"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button :loading="submitting" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createEmployeePersonalNote } from '@/api/hrm/employee/personal-note'

export default {
  name: 'HrmHomePersonalNoteForm',
  data() {
    return {
      dialogVisible: false,
      submitting: false,
      formData: {
        content: '',
        reminderTime: new Date().getTime()
      },
      formRules: {
        reminderTime: [{ required: true, message: '提醒时间不能为空', trigger: 'change' }],
        content: [{ required: true, message: '备忘内容不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    /** 打开新增备忘表单 */
    open(date) {
      const dateParts = date.split('-').map(Number)
      const now = new Date()
      this.formData.content = ''
      this.formData.reminderTime = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2],
        now.getHours(),
        now.getMinutes(),
        0
      ).getTime()
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    /** 提交新增备忘 */
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      this.submitting = true
      try {
        await createEmployeePersonalNote(this.formData)
        this.$modal.msgSuccess('新增备忘成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.width-full { width: 100%; }
</style>
