<template>
  <el-dialog
    title="订单发货"
    :visible.sync="dialogVisible"
    width="25%"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      label-width="80px"
    >
      <el-form-item label="发货方式">
        <el-radio-group v-model="expressType">
          <el-radio
            border
            label="express"
          >快递物流</el-radio>
          <el-radio
            border
            label="none"
          >无需发货</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="expressType === 'express'">
        <el-form-item label="物流公司">
          <el-select
            v-model="formData.logisticsId"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in deliveryExpressList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="formData.logisticsNo" />
        </el-form-item>
      </template>
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
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import * as TradeOrderApi from '@/api/mall/trade/order'
import { copyValueToTarget } from '@/utils'

export default {
  name: 'OrderDeliveryForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      expressType: 'express',
      formData: this.getDefaultFormData(),
      deliveryExpressList: []
    }
  },
  mounted() {
    return this.loadDeliveryExpressList()
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        logisticsId: null,
        logisticsNo: ''
      }
    },
    async loadDeliveryExpressList() {
      const response = await DeliveryExpressApi.getSimpleDeliveryExpressList()
      this.deliveryExpressList = response.data
    },
    open(row) {
      this.resetForm()
      copyValueToTarget(this.formData, row)
      if (row.logisticsId === 0) {
        this.expressType = 'none'
      }
      this.dialogVisible = true
    },
    submitForm() {
      this.formLoading = true
      const data = this.formData
      if (this.expressType === 'none') {
        data.logisticsId = 0
        data.logisticsNo = ''
      }
      return TradeOrderApi.deliveryOrder(data)
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
