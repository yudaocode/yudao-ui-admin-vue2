<template>
  <el-dialog
    title="修改订单收货地址"
    :visible.sync="dialogVisible"
    width="35%"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      label-width="120px"
    >
      <el-form-item label="收件人">
        <el-input
          v-model="formData.receiverName"
          placeholder="请输入收件人名称"
        />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input
          v-model="formData.receiverMobile"
          placeholder="请输入收件人手机号"
        />
      </el-form-item>
      <el-form-item label="所在地">
        <AreaSelect
          v-model="formData.receiverAreaId"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="详细地址">
        <el-input
          v-model="formData.receiverDetailAddress"
          :rows="3"
          placeholder="请输入收件人详细地址"
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
import { copyValueToTarget } from '@/utils'
import AreaSelect from '@/views/system/area/components/AreaSelect.vue'

export default {
  name: 'OrderUpdateAddressForm',
  components: { AreaSelect },
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
        receiverName: '',
        receiverMobile: '',
        receiverAreaId: null,
        receiverDetailAddress: ''
      }
    },
    open(row) {
      this.resetForm()
      copyValueToTarget(this.formData, row)
      this.dialogVisible = true
    },
    submitForm() {
      this.formLoading = true
      return TradeOrderApi.updateOrderAddress(this.formData)
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
