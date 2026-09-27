<template>
  <Dialog v-model="dialogVisible" :title="formData.id ? '编辑工时' : '登记工时'" width="520px" append-to-body>
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="96px">
      <el-form-item label="投入工时" prop="actualHours">
        <el-input-number v-model="formData.actualHours" style="width: 100%" :min="1" @change="handleActualHoursChange" />
      </el-form-item>
      <el-form-item label="剩余工时" prop="remainingHours">
        <el-input-number v-model="formData.remainingHours" style="width: 100%" :min="0" />
      </el-form-item>
      <el-form-item label="工时说明" prop="description">
        <el-input v-model="formData.description" :rows="4" maxlength="500" placeholder="请输入本次工作内容" show-word-limit type="textarea" />
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script>
import * as WorkLogApi from '@/api/pms/pm/workitem/worklog'
import Dialog from '@/components/Dialog'

export default {
  name: 'PmsWorkItemWorkLogForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      currentRemainingHours: 0,
      formData: { workItemId: 0, actualHours: 1, remainingHours: 0, description: '' },
      formRules: { actualHours: [{ required: true, message: '请输入投入工时', trigger: 'blur' }] }
    }
  },
  methods: {
    async open(workItemId, id, remainingHours = 0) {
      this.dialogVisible = true
      this.resetForm()
      this.currentRemainingHours = remainingHours
      this.formData.workItemId = workItemId
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      if (!id) {
        this.formData.remainingHours = Math.max(remainingHours - this.formData.actualHours, 0)
        return
      }
      this.formLoading = true
      try {
        const response = await WorkLogApi.getWorkItemWorkLog(id)
        this.formData = response.data
      } finally {
        this.formLoading = false
      }
    },
    handleActualHoursChange(actualHours) {
      if (this.formData.id) return
      this.formData.remainingHours = Math.max(this.currentRemainingHours - (actualHours == null ? 0 : actualHours), 0)
    },
    async submitForm() {
      if (!this.$refs.formRef || this.formLoading) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formData.id) {
          await WorkLogApi.updateWorkItemWorkLog(this.formData)
          this.$message.success('更新成功')
        } else {
          await WorkLogApi.createWorkItemWorkLog(this.formData)
          this.$message.success('登记成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = { workItemId: 0, actualHours: 1, remainingHours: 0, description: '' }
    }
  }
}
</script>
