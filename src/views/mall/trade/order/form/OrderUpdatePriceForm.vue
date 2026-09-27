<template>
  <el-dialog
    title="订单调价"
    :visible.sync="dialogVisible"
    width="25%"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      label-width="100px"
    >
      <el-form-item label="应付金额(总)">
        <el-input
          v-model="formData.payPrice"
          disabled
        />
      </el-form-item>
      <el-form-item label="订单调价">
        <el-input-number
          v-model="formData.adjustPrice"
          :precision="2"
          :step="0.1"
          class="price-input"
        />
        <el-tag
          class="price-tip"
          type="warning"
        >订单调价。 正数，加价；负数，减价</el-tag>
      </el-form-item>
      <el-form-item label="调价后">
        <el-input
          v-model="formData.newPayPrice"
          disabled
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
import { convertToInteger, floatToFixed2, formatToFraction } from '@/utils'

export default {
  name: 'OrderUpdatePriceForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: this.getDefaultFormData()
    }
  },
  watch: {
    'formData.adjustPrice'(adjustPrice) {
      const numMatch = this.formData.payPrice.match(/\d+(\.\d+)?/)
      if (numMatch) {
        const payPriceNum = parseFloat(numMatch[0])
        this.formData.newPayPrice = (payPriceNum + adjustPrice).toFixed(2) + '元'
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        adjustPrice: 0,
        payPrice: '',
        newPayPrice: ''
      }
    },
    open(row) {
      this.resetForm()
      this.formData.id = row.id
      this.formData.adjustPrice = Number(formatToFraction(row.adjustPrice))
      this.formData.payPrice = floatToFixed2(row.payPrice) + '元'
      this.formData.newPayPrice = this.formData.payPrice
      this.dialogVisible = true
    },
    submitForm() {
      this.formLoading = true
      const data = {
        id: this.formData.id,
        adjustPrice: convertToInteger(this.formData.adjustPrice)
      }
      return TradeOrderApi.updateOrderPrice(data)
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
.price-input {
  width: 100%;
}

.price-tip {
  margin-left: 10px;
}

.dialog-footer {
  text-align: right;
}
</style>
