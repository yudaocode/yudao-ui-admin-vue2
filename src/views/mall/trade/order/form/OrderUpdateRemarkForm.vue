<template>
  <el-dialog
    title="商家备注"
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
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          :rows="3"
          placeholder="请输入订单备注"
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
import * as TradeOrderApi from '@/api/mall/trade/order'

export default {
  name: 'OrderUpdateRemarkForm',
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
        remark: ''
      }
    },
    open(row) {
      this.resetForm()
      this.formData.id = row.id
      this.formData.remark = row.remark || ''
      this.dialogVisible = true
    },
    submitForm() {
      this.formLoading = true
      return TradeOrderApi.updateOrderRemark(this.formData)
        .then(() => {
          this.$modal.msgSuccess('修改成功')
          this.dialogVisible = false
          this.$emit('success', true)
        })
        .finally(() => {
          this.formLoading = false
        })
    },
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
