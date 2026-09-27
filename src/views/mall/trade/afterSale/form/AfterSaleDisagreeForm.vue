<template>
  <el-dialog
    title="拒绝售后"
    :visible.sync="dialogVisible"
    width="45%"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      label-width="80px"
    >
      <el-form-item label="审批备注">
        <el-input
          v-model="formData.auditReason"
          :rows="3"
          placeholder="请输入审批备注"
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as AfterSaleApi from '@/api/mall/trade/afterSale'

export default {
  name: 'AfterSaleDisagreeForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: this.getDefaultFormData()
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        auditReason: ''
      }
    },
    /** 打开弹窗 */
    open(row) {
      this.resetForm()
      this.formData.id = row.id
      this.formData.auditReason = row.auditReason || ''
      this.dialogVisible = true
    },
    /** 提交表单 */
    submitForm() {
      this.formLoading = true
      return AfterSaleApi.disagree(this.formData)
        .then(() => {
          this.$modal.msgSuccess('修改成功')
          this.dialogVisible = false
          this.$emit('success', true)
        })
        .finally(() => {
          this.formLoading = false
        })
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
