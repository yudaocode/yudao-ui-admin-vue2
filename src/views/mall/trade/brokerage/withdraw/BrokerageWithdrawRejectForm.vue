<template>
  <el-dialog
    title="审核"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        label="驳回原因"
        prop="auditReason"
      >
        <el-input
          v-model="formData.auditReason"
          type="textarea"
          :rows="4"
          placeholder="请输入驳回原因"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { rejectBrokerageWithdraw } from '@/api/mall/trade/brokerage/withdraw'

export default {
  name: 'BrokerageWithdrawRejectForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: this.getDefaultFormData(),
      formRules: {
        auditReason: [{ required: true, message: '驳回原因不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        auditReason: undefined
      }
    },
    /** 打开弹窗 */
    open(id) {
      this.resetForm()
      this.formData.id = id
      this.dialogVisible = true
    },
    /** 提交表单 */
    submitForm() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve) => {
        this.$refs.form.validate((valid) => {
          if (!valid) {
            resolve(false)
            return
          }
          this.formLoading = true
          rejectBrokerageWithdraw(this.formData)
            .then(() => {
              this.$modal.msgSuccess('驳回成功')
              this.dialogVisible = false
              this.$emit('success')
              return true
            })
            .catch(() => false)
            .finally(() => {
              this.formLoading = false
            })
            .then(resolve)
        })
      })
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    /** 重置表单 */
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
