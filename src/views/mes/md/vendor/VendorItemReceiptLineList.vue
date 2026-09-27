<template>
  <div class="related-list">
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="物料编码" align="center" prop="itemCode" width="140"><template v-slot="scope"><el-button type="text" @click="handleViewItem(scope.row.itemId)">{{ scope.row.itemCode }}</el-button></template></el-table-column>
      <el-table-column label="物料名称" align="center" prop="itemName" />
      <el-table-column label="规格型号" align="center" prop="specification" />
      <el-table-column label="单位" align="center" prop="unitMeasureName" />
      <el-table-column label="入库数量" align="center" prop="receivedQuantity" />
      <el-table-column label="批次号" align="center" prop="batchCode" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <md-item-form ref="itemForm" />
  </div>
</template>

<script>
import { WmItemReceiptLineApi } from '@/api/mes/wm/itemreceipt/line'
import MdItemForm from '@/views/mes/md/item/MdItemForm.vue'

export default {
  name: 'VendorItemReceiptLineList',
  components: { MdItemForm },
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
    handleViewItem(itemId) {
      this.$refs.itemForm.open('detail', itemId)
    }
  }
}
</script>

<style scoped>
.related-list { overflow: hidden; }
</style>
