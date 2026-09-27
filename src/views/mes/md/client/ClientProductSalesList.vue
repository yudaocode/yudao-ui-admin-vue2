<template>
  <div class="related-list">
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="出库单编号" align="center" prop="code" min-width="160">
        <template v-slot="scope">
          <el-button type="text" @click="handleDetail(scope.row.id)">{{ scope.row.code }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="出库单名称" align="center" prop="name" min-width="150" />
      <el-table-column label="销售订单编号" align="center" prop="salesOrderCode" min-width="120" />
      <el-table-column label="出库日期" align="center" prop="salesDate" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.salesDate) }}</template>
      </el-table-column>
      <el-table-column label="单据状态" align="center" prop="status" min-width="100">
        <template v-slot="scope">
          <dict-tag :type="MES_WM_PRODUCT_SALES_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <product-sales-form ref="form" />
  </div>
</template>

<script>
import { WmProductSalesApi } from '@/api/mes/wm/productsales'
import ProductSalesForm from '@/views/mes/wm/productsales/ProductSalesForm.vue'
import { parseTime } from '@/utils/ruoyi'

const MES_WM_PRODUCT_SALES_STATUS = 'mes_wm_product_sales_status'

export default {
  name: 'ClientProductSalesList',
  components: { ProductSalesForm },
  props: {
    clientId: { type: Number, required: true }
  },
  data() {
    return {
      MES_WM_PRODUCT_SALES_STATUS,
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, clientId: undefined }
    }
  },
  watch: {
    clientId: {
      immediate: true,
      handler(value) {
        this.queryParams.clientId = value
        this.queryParams.pageNo = 1
        this.getList()
      }
    }
  },
  methods: {
    parseTime,
    async getList() {
      if (!this.queryParams.clientId) return
      this.loading = true
      try {
        const response = await WmProductSalesApi.getProductSalesPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleDetail(id) {
      this.$refs.form.open('detail', id)
    }
  }
}
</script>

<style scoped>
.related-list { overflow: hidden; }
</style>
