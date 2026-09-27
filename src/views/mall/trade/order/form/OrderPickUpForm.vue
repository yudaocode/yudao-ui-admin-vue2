<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      append-to-body
      title="订单核销"
      width="35%"
    >
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item
          label="核销码"
          prop="pickUpVerifyCode"
        >
          <el-input
            v-model="formData.pickUpVerifyCode"
            placeholder="请输入核销码"
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
          @click="getOrderByPickUpVerifyCodeClick"
        >
          查询
        </el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="detailDialogVisible"
      append-to-body
      title="订单详情"
      width="55%"
    >
      <TradeOrderDetail
        v-if="orderDetails.id"
        :id="orderDetails.id"
        :show-pick-up="false"
      />
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          :disabled="formLoading"
          type="primary"
          @click="submitForm"
        >
          确认核销
        </el-button>
        <el-button @click="detailDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as TradeOrderApi from '@/api/mall/trade/order'
import { DeliveryTypeEnum, TradeOrderStatusEnum } from '@/utils/constants'
import TradeOrderDetail from '@/views/mall/trade/order/detail/index.vue'

export default {
  name: 'OrderPickUpForm',
  components: { TradeOrderDetail },
  data() {
    return {
      dialogVisible: false,
      detailDialogVisible: false,
      formLoading: false,
      formRules: {
        pickUpVerifyCode: [{ required: true, message: '核销码不能为空', trigger: 'blur' }]
      },
      formData: {
        pickUpVerifyCode: ''
      },
      orderDetails: {}
    }
  },
  methods: {
    async open(pickUpVerifyCode) {
      this.resetForm()
      if (pickUpVerifyCode != null) {
        this.formData.pickUpVerifyCode = pickUpVerifyCode
        await this.getOrderByPickUpVerifyCode()
      } else {
        this.dialogVisible = true
      }
    },
    async submitForm() {
      this.formLoading = true
      try {
        await TradeOrderApi.pickUpOrderByVerifyCode(this.formData.pickUpVerifyCode)
        this.$modal.msgSuccess('核销成功')
        this.detailDialogVisible = false
        this.dialogVisible = false
        this.$emit('success', true)
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = { pickUpVerifyCode: '' }
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    async getOrderByPickUpVerifyCodeClick() {
      if (!this.$refs.form) return
      const valid = await this.$refs.form.validate()
      if (!valid) return
      await this.getOrderByPickUpVerifyCode()
    },
    async getOrderByPickUpVerifyCode() {
      this.formLoading = true
      const response = await TradeOrderApi.getOrderByPickUpVerifyCode(
        this.formData.pickUpVerifyCode
      )
      const data = response.data
      this.formLoading = false
      if (!data || data.deliveryType !== DeliveryTypeEnum.PICK_UP.type) {
        this.$modal.msgError('未查询到订单')
        return
      }
      if (data.status !== TradeOrderStatusEnum.UNDELIVERED.status) {
        this.$modal.msgError('订单不是待核销状态')
        return
      }
      this.orderDetails = data
      this.detailDialogVisible = true
    }
  }
}
</script>
