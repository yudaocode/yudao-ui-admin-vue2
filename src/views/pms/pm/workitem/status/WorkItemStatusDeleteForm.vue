<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body title="迁移并删除状态" width="480px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="待删除状态">{{ formData.statusName }}</el-form-item>
      <el-form-item label="迁移到" prop="transferStatusId">
        <el-select v-model="formData.transferStatusId" style="width: 100%" placeholder="请选择目标状态">
          <el-option
            v-for="status in statusList"
            :key="status.id"
            :label="status.name"
            :value="status.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import * as WorkItemStatusApi from '@/api/pms/pm/workitem/status'

export default {
  name: 'PmsWorkItemStatusDeleteForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: { id: undefined, statusName: '', transferStatusId: undefined },
      formRules: {
        transferStatusId: [{ required: true, message: '迁移目标状态不能为空', trigger: 'change' }]
      },
      statusList: []
    }
  },
  methods: {
    async open(id) {
      this.dialogVisible = true
      this.resetForm()
      this.formLoading = true
      try {
        const statusResponse = await WorkItemStatusApi.getWorkItemStatus(id)
        const status = statusResponse.data
        const listResponse = await WorkItemStatusApi.getWorkItemStatusList(status.projectId, status.workItemType)
        this.statusList = listResponse.data.filter(item => item.id !== id)
        this.formData = {
          id: status.id,
          statusName: status.name,
          transferStatusId: this.statusList.length ? this.statusList[0].id : undefined
        }
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      if (!this.$refs.formRef) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        await WorkItemStatusApi.deleteWorkItemStatus(this.formData.id, this.formData.transferStatusId)
        this.$message.success('状态已删除，工作项迁移完成')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = { id: undefined, statusName: '', transferStatusId: undefined }
      this.statusList = []
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.resetFields())
    }
  }
}
</script>
