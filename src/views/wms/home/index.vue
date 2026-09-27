<template>
  <div
    v-loading="loading"
    class="app-container wms-home"
  >
    <doc-alert
      title="WMS 手册（功能开启）"
      url="https://doc.iocoder.cn/wms/build/"
    />
    <div class="wms-home-toolbar">
      <div>
        <div class="wms-home-title">WMS 首页</div>
        <div class="wms-home-subtitle">单据工作台 / 库存概览</div>
      </div>
      <div class="wms-home-actions">
        <warehouse-select
          v-model="warehouseId"
          style="width: 220px"
          placeholder="全部仓库"
          @change="refresh"
        />
        <el-button
          :loading="loading"
          icon="el-icon-refresh"
          @click="refresh"
        >刷新</el-button>
      </div>
    </div>
    <wms-home-order-summary-cards ref="orderSummaryCards" />
    <wms-home-order-trend-chart ref="orderTrendChart" />
    <wms-home-inventory-charts ref="inventoryCharts" />
    <div class="wms-home-stat-time"><i class="el-icon-time" /> 统计时间：{{ statTime }}</div>
  </div>
</template>

<script>
import { formatDate } from '@/utils/index'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import WmsHomeInventoryCharts from './components/WmsHomeInventoryCharts.vue'
import WmsHomeOrderSummaryCards from './components/WmsHomeOrderSummaryCards.vue'
import WmsHomeOrderTrendChart from './components/WmsHomeOrderTrendChart.vue'

export default {
  name: 'WmsHome',
  components: { WarehouseSelect, WmsHomeInventoryCharts, WmsHomeOrderSummaryCards, WmsHomeOrderTrendChart },
  data() { return { loading: false, warehouseId: undefined, statTime: formatDate(new Date()) } },
  mounted() { this.refresh() },
  methods: {
    refresh() {
      this.loading = true
      return Promise.all([
        this.$refs.orderSummaryCards && this.$refs.orderSummaryCards.load(this.warehouseId),
        this.$refs.orderTrendChart && this.$refs.orderTrendChart.load(this.warehouseId),
        this.$refs.inventoryCharts && this.$refs.inventoryCharts.load(this.warehouseId)
      ]).then(() => { this.statTime = formatDate(new Date()) }).finally(() => { this.loading = false })
    }
  }
}
</script>

<style scoped>
.wms-home-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; padding: 16px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; }
.wms-home-title { color: #303133; font-size: 20px; font-weight: 600; line-height: 28px; }
.wms-home-subtitle, .wms-home-stat-time { color: #909399; font-size: 13px; }
.wms-home-actions { display: flex; align-items: center; gap: 8px; }
.wms-home-stat-time { display: flex; align-items: center; justify-content: center; margin-top: 2px; }
.wms-home-stat-time i { margin-right: 5px; }
@media (max-width: 600px) { .wms-home-toolbar { align-items: flex-start; flex-direction: column; } .wms-home-actions { width: 100%; } }
</style>
