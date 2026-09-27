<template>
  <div>
    <el-table
      :data="formData"
      border
      stripe
      show-summary
      :summary-method="getSummaries"
      size="small"
    >
      <el-table-column
        label="序号"
        type="index"
        align="center"
        width="55"
      />
      <el-table-column
        label="采购单据编号"
        min-width="180"
      >
        <template slot-scope="scope"><el-input
          v-model="scope.row.bizNo"
          disabled
        /></template>
      </el-table-column>
      <el-table-column
        label="应付金额"
        prop="totalPrice"
        width="110"
      ><template slot-scope="scope"><el-input-number
        v-model="scope.row.totalPrice"
        disabled
        :precision="2"
        :controls="false"
      /></template></el-table-column>
      <el-table-column
        label="已付金额"
        prop="paidPrice"
        width="110"
      ><template slot-scope="scope"><el-input-number
        v-model="scope.row.paidPrice"
        disabled
        :precision="2"
        :controls="false"
      /></template></el-table-column>
      <el-table-column
        label="本次付款"
        prop="paymentPrice"
        width="125"
      ><template slot-scope="scope"><el-input-number
        v-model="scope.row.paymentPrice"
        :disabled="disabled"
        :precision="2"
        controls-position="right"
      /></template></el-table-column>
      <el-table-column
        label="备注"
        min-width="150"
      ><template slot-scope="scope"><el-input
        v-model="scope.row.remark"
        :disabled="disabled"
        placeholder="请输入备注"
      /></template></el-table-column>
      <el-table-column
        v-if="!disabled"
        label="操作"
        width="60"
        fixed="right"
        align="center"
      ><template slot-scope="scope"><el-button
        type="text"
        @click="handleDelete(scope.$index)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <div
      v-if="!disabled"
      class="item-actions"
    >
      <el-button
        size="mini"
        round
        @click="handleOpenPurchaseIn"
      >+ 添加采购入库单</el-button>
      <el-button
        size="mini"
        round
        @click="handleOpenPurchaseReturn"
      >+ 添加采购退货单</el-button>
    </div>
    <purchase-in-payment-enable-list
      ref="purchaseInPaymentEnableList"
      @success="handleAddPurchaseIn"
    />
    <purchase-return-refund-enable-list
      ref="purchaseReturnRefundEnableList"
      @success="handleAddPurchaseReturn"
    />
  </div>
</template>

<script>
import { erpPriceInputFormatter, getSumValue } from '@/utils'
import PurchaseInPaymentEnableList from '@/views/erp/purchase/in/components/PurchaseInPaymentEnableList.vue'
import PurchaseReturnRefundEnableList from '@/views/erp/purchase/return/components/PurchaseReturnRefundEnableList.vue'

const ERP_BIZ_TYPE = {
  PURCHASE_IN: 11,
  PURCHASE_RETURN: 12
}

export default {
  name: 'FinancePaymentItemForm',
  components: { PurchaseInPaymentEnableList, PurchaseReturnRefundEnableList },
  props: {
    items: { type: Array, default: () => [] },
    supplierId: { type: [Number, String], default: undefined },
    disabled: { type: Boolean, default: false }
  },
  data() { return { formData: this.items } },
  watch: {
    items: { immediate: true, handler(value) { this.formData = value || [] } }
  },
  methods: {
    handleOpenPurchaseIn() {
      if (!this.supplierId) {
        this.$modal.msgError('请选择供应商')
        return
      }
      this.$refs.purchaseInPaymentEnableList.open(this.supplierId)
    },
    handleAddPurchaseIn(rows) {
      const selectedRows = rows || []
      selectedRows.forEach(row => {
        const paidPrice = row.paymentPrice
        this.formData.push({
          bizId: row.id,
          bizType: ERP_BIZ_TYPE.PURCHASE_IN,
          bizNo: row.no,
          totalPrice: row.totalPrice,
          paidPrice,
          paymentPrice: row.totalPrice - paidPrice
        })
      })
    },
    handleOpenPurchaseReturn() {
      if (!this.supplierId) {
        this.$modal.msgError('请选择供应商')
        return
      }
      this.$refs.purchaseReturnRefundEnableList.open(this.supplierId)
    },
    handleAddPurchaseReturn(rows) {
      const selectedRows = rows || []
      selectedRows.forEach(row => {
        const refundPrice = row.refundPrice
        this.formData.push({
          bizId: row.id,
          bizType: ERP_BIZ_TYPE.PURCHASE_RETURN,
          bizNo: row.no,
          totalPrice: -row.totalPrice,
          paidPrice: -refundPrice,
          paymentPrice: -row.totalPrice + refundPrice
        })
      })
    },
    handleDelete(index) { this.formData.splice(index, 1) },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (['totalPrice', 'paidPrice', 'paymentPrice'].indexOf(column.property) !== -1) {
          const sum = getSumValue(data.map(item => Number(item[column.property])))
          return erpPriceInputFormatter(sum)
        }
        return ''
      })
    },
    validate() {
      const invalid = this.formData.some(item => item.paymentPrice === undefined ||
        item.paymentPrice === null || item.paymentPrice === '' ||
        !Number.isFinite(Number(item.paymentPrice)))
      if (invalid) {
        this.$modal.msgError('本次付款不能为空')
        return Promise.reject(new Error('invalid payment items'))
      }
      return Promise.resolve(true)
    }
  }
}
</script>

<style scoped>
.item-actions { text-align: center; padding: 12px 0 4px; }
</style>
