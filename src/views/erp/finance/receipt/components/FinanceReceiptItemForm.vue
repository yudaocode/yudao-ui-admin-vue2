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
        label="销售单据编号"
        min-width="180"
      ><template slot-scope="scope"><el-input
        v-model="scope.row.bizNo"
        disabled
      /></template></el-table-column>
      <el-table-column
        label="应收金额"
        prop="totalPrice"
        width="110"
      ><template slot-scope="scope"><el-input-number
        v-model="scope.row.totalPrice"
        disabled
        :precision="2"
        :controls="false"
      /></template></el-table-column>
      <el-table-column
        label="已收金额"
        prop="receiptedPrice"
        width="110"
      ><template slot-scope="scope"><el-input-number
        v-model="scope.row.receiptedPrice"
        disabled
        :precision="2"
        :controls="false"
      /></template></el-table-column>
      <el-table-column
        label="本次收款"
        prop="receiptPrice"
        width="125"
      ><template slot-scope="scope"><el-input-number
        v-model="scope.row.receiptPrice"
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
        @click="handleOpenSaleOut"
      >+ 添加销售出库单</el-button>
      <el-button
        size="mini"
        round
        @click="handleOpenSaleReturn"
      >+ 添加销售退货单</el-button>
    </div>
    <sale-out-receipt-enable-list
      ref="saleOutReceiptEnableList"
      @success="handleAddSaleOut"
    />
    <sale-return-refund-enable-list
      ref="saleReturnRefundEnableList"
      @success="handleAddSaleReturn"
    />
  </div>
</template>

<script>
import { erpPriceInputFormatter, getSumValue } from '@/utils'
import SaleOutReceiptEnableList from '@/views/erp/sale/out/components/SaleOutReceiptEnableList.vue'
import SaleReturnRefundEnableList from '@/views/erp/sale/return/components/SaleReturnRefundEnableList.vue'

const ERP_BIZ_TYPE = {
  SALE_OUT: 21,
  SALE_RETURN: 22
}

export default {
  name: 'FinanceReceiptItemForm',
  components: { SaleOutReceiptEnableList, SaleReturnRefundEnableList },
  props: {
    items: { type: Array, default: () => [] },
    customerId: { type: [Number, String], default: undefined },
    disabled: { type: Boolean, default: false }
  },
  data() { return { formData: this.items } },
  watch: { items: { immediate: true, handler(value) { this.formData = value || [] } }},
  methods: {
    handleOpenSaleOut() {
      if (!this.customerId) {
        this.$modal.msgError('请选择客户')
        return
      }
      this.$refs.saleOutReceiptEnableList.open(this.customerId)
    },
    handleAddSaleOut(rows) {
      const selectedRows = rows || []
      selectedRows.forEach(row => {
        const receiptedPrice = row.receiptPrice
        this.formData.push({
          bizId: row.id,
          bizType: ERP_BIZ_TYPE.SALE_OUT,
          bizNo: row.no,
          totalPrice: row.totalPrice,
          receiptedPrice,
          receiptPrice: row.totalPrice - receiptedPrice
        })
      })
    },
    handleOpenSaleReturn() {
      if (!this.customerId) {
        this.$modal.msgError('请选择客户')
        return
      }
      this.$refs.saleReturnRefundEnableList.open(this.customerId)
    },
    handleAddSaleReturn(rows) {
      const selectedRows = rows || []
      selectedRows.forEach(row => {
        const refundPrice = row.refundPrice
        this.formData.push({
          bizId: row.id,
          bizType: ERP_BIZ_TYPE.SALE_RETURN,
          bizNo: row.no,
          totalPrice: -row.totalPrice,
          receiptedPrice: -refundPrice,
          receiptPrice: -row.totalPrice + refundPrice
        })
      })
    },
    handleDelete(index) { this.formData.splice(index, 1) },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (['totalPrice', 'receiptedPrice', 'receiptPrice'].indexOf(column.property) !== -1) {
          const sum = getSumValue(data.map(item => Number(item[column.property])))
          return erpPriceInputFormatter(sum)
        }
        return ''
      })
    },
    validate() {
      const invalid = this.formData.some(item => item.receiptPrice === undefined ||
        item.receiptPrice === null || item.receiptPrice === '' ||
        !Number.isFinite(Number(item.receiptPrice)))
      if (invalid) {
        this.$modal.msgError('本次收款不能为空')
        return Promise.reject(new Error('invalid receipt items'))
      }
      return Promise.resolve(true)
    }
  }
}
</script>

<style scoped>
.item-actions { text-align: center; padding: 12px 0 4px; }
</style>
