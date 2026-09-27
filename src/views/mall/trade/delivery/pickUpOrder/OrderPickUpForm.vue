<template>
  <div>
    <!-- 核销码查询对话框 -->
    <el-dialog
      title="订单核销"
      :visible.sync="dialogVisible"
      width="35%"
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
          prop="pickUpVerifyCode"
          label="核销码"
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
          type="primary"
          :loading="formLoading"
          @click="getOrderByPickUpVerifyCodeClick"
        >
          查询
        </el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 核销确认对话框 -->
    <el-dialog
      title="订单详情"
      :visible.sync="detailDialogVisible"
      width="55%"
      append-to-body
    >
      <div v-if="orderDetails.id">
        <el-descriptions
          title="订单信息"
          :column="2"
          border
        >
          <el-descriptions-item label="订单号">{{ orderDetails.no }}</el-descriptions-item>
          <el-descriptions-item label="买家">{{ getBuyerNickname() }}</el-descriptions-item>
          <el-descriptions-item label="配送方式">
            <dict-tag
              :type="DICT_TYPE.TRADE_DELIVERY_TYPE"
              :value="orderDetails.deliveryType"
            />
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <dict-tag
              :type="DICT_TYPE.TRADE_ORDER_STATUS"
              :value="orderDetails.status"
            />
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ orderDetails.receiverMobile }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">￥{{ fenToYuan(orderDetails.payPrice) }}</el-descriptions-item>
        </el-descriptions>

        <el-table
          :data="orderDetails.items || []"
          border
          class="order-items"
        >
          <el-table-column
            label="商品"
            prop="spuName"
            min-width="240"
          >
            <template v-slot="scope">
              <div class="order-item-product">
                <el-image
                  v-if="scope.row.picUrl"
                  :src="scope.row.picUrl"
                  class="order-item-image"
                />
                <div>
                  <div>{{ scope.row.spuName }}</div>
                  <el-tag
                    v-for="property in scope.row.properties"
                    :key="property.propertyId"
                    size="mini"
                    class="order-item-property"
                  >
                    {{ property.propertyName }}: {{ property.valueName }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="商品原价"
            prop="price"
            width="120"
            align="center"
          >
            <template v-slot="scope">￥{{ fenToYuan(scope.row.price) }}</template>
          </el-table-column>
          <el-table-column
            label="数量"
            prop="count"
            width="90"
            align="center"
          />
          <el-table-column
            label="合计"
            prop="payPrice"
            width="120"
            align="center"
          >
            <template v-slot="scope">￥{{ fenToYuan(scope.row.payPrice) }}</template>
          </el-table-column>
          <el-table-column
            label="售后状态"
            prop="afterSaleStatus"
            width="120"
            align="center"
          >
            <template v-slot="scope">
              <dict-tag
                :type="DICT_TYPE.TRADE_ORDER_ITEM_AFTER_SALE_STATUS"
                :value="scope.row.afterSaleStatus"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="formLoading"
          @click="submitForm"
        >确认核销</el-button>
        <el-button @click="detailDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as TradeOrderApi from '@/api/mall/trade/order'
import { DICT_TYPE } from '@/utils/dict'

const PICK_UP_DELIVERY_TYPE = 2
const UNDELIVERED_ORDER_STATUS = 10

export default {
  name: 'OrderPickUpForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      detailDialogVisible: false,
      formLoading: false,
      formData: {
        pickUpVerifyCode: ''
      },
      formRules: {
        pickUpVerifyCode: [{ required: true, message: '核销码不能为空', trigger: 'blur' }]
      },
      orderDetails: {}
    }
  },
  methods: {
    /** 打开弹窗；扫码枪传入核销码时直接查询 */
    open(pickUpVerifyCode) {
      this.resetForm()
      this.dialogVisible = false
      if (pickUpVerifyCode !== undefined && pickUpVerifyCode !== null) {
        this.formData.pickUpVerifyCode = pickUpVerifyCode
        return this.getOrderByPickUpVerifyCode()
      }
      this.dialogVisible = true
      return Promise.resolve()
    },
    /** 提交核销 */
    submitForm() {
      this.formLoading = true
      return TradeOrderApi.pickUpOrderByVerifyCode(this.formData.pickUpVerifyCode)
        .then(() => {
          this.$modal.msgSuccess('核销成功')
          this.detailDialogVisible = false
          this.dialogVisible = false
          this.$emit('success', true)
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 重置表单 */
    resetForm() {
      this.formData = { pickUpVerifyCode: '' }
      this.orderDetails = {}
      this.detailDialogVisible = false
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    /** 校验后按核销码查询订单 */
    getOrderByPickUpVerifyCodeClick() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve) => {
        this.$refs.form.validate((valid) => {
          if (!valid) {
            resolve(false)
            return
          }
          resolve(this.getOrderByPickUpVerifyCode())
        })
      })
    },
    /** 查询核销码对应的订单 */
    getOrderByPickUpVerifyCode() {
      this.formLoading = true
      this.orderDetails = {}
      this.detailDialogVisible = false
      return TradeOrderApi.getOrderByPickUpVerifyCode(this.formData.pickUpVerifyCode)
        .then((response) => {
          const data = response.data
          if (!data || data.deliveryType !== PICK_UP_DELIVERY_TYPE) {
            this.$modal.msgError('未查询到订单')
            return false
          }
          if (data.status !== UNDELIVERED_ORDER_STATUS) {
            this.$modal.msgError('订单不是待核销状态')
            return false
          }
          // Vue3 的 TradeOrderDetail 会按编号再次加载完整商品、用户与日志信息。
          return TradeOrderApi.getOrder(data.id).then((detailResponse) => {
            this.orderDetails = detailResponse.data
            this.detailDialogVisible = true
            return true
          })
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    getBuyerNickname() {
      return this.orderDetails.user ? this.orderDetails.user.nickname : ''
    },
    fenToYuan(value) {
      const amount = Number(value || 0)
      return Number.isFinite(amount) ? (amount / 100).toFixed(2) : '0.00'
    }
  }
}
</script>

<style scoped>
.order-items {
  margin-top: 20px;
}

.order-item-product {
  display: flex;
  align-items: center;
}

.order-item-image {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.order-item-property {
  margin-top: 4px;
  margin-right: 6px;
}
</style>
