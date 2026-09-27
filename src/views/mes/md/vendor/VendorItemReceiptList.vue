<template>
  <div class="related-list">
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="入库单编号" align="center" prop="receiptCode" min-width="160"><template v-slot="scope"><el-button type="text" @click="handleDetail(scope.row.receiptId)">{{ scope.row.receiptCode }}</el-button></template></el-table-column>
      <el-table-column label="采购订单号" align="center" prop="purchaseOrderCode" min-width="150" />
      <el-table-column label="物料编码" align="center" prop="itemCode" width="140" />
      <el-table-column label="物料名称" align="center" prop="itemName" min-width="150" />
      <el-table-column label="规格型号" align="center" prop="specification" min-width="120" />
      <el-table-column label="单位" align="center" prop="unitMeasureName" width="80" />
      <el-table-column label="入库数量" align="center" prop="receivedQuantity" width="100" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <item-receipt-form ref="form" />
  </div>
</template>

<script>
import { WmItemReceiptLineApi } from '@/api/mes/wm/itemreceipt/line'
import ItemReceiptForm from '@/views/mes/wm/itemreceipt/ItemReceiptForm.vue'

export default {
  name: 'VendorItemReceiptList',
  components: { ItemReceiptForm },
  props: { vendorId: { type: Number, required: true }},
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, vendorId: undefined }
    }
  },
  watch: {
    vendorId: {
      immediate: true,
      handler(value) {
        this.queryParams.vendorId = value
        this.queryParams.pageNo = 1
        this.getList()
      }
    }
  },
  methods: {
    async getList() {
      if (!this.queryParams.vendorId) return
      this.loading = true
      try {
        const response = await WmItemReceiptLineApi.getItemReceiptLinePage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleDetail(receiptId) {
      this.$refs.form.open('detail', receiptId)
    }
  }
}
</script>

<style scoped>
.related-list { overflow: hidden; }
</style>
