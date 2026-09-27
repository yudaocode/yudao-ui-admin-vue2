<template>
  <div
    v-loading="loading"
    class="wms-home-panel"
  >
    <div class="wms-home-panel__header">
      <div>
        <div class="wms-home-panel__title">单据趋势</div>
        <div class="wms-home-panel__subtitle">入库、出库、移库、盘库单据数量</div>
      </div>
      <el-radio-group
        v-model="trendDays"
        size="mini"
        @change="handleTrendDaysChange"
      >
        <el-radio-button :label="7">近7天</el-radio-button>
        <el-radio-button :label="30">近30天</el-radio-button>
      </el-radio-group>
    </div>
    <div
      ref="chart"
      class="wms-home-chart"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { WmsHomeStatisticsApi } from '@/api/wms/home'
import { OrderTypeEnum } from '@/views/wms/utils/constants'

export default {
  name: 'WmsHomeOrderTrendChart',
  data() {
    return { loading: false, trendDays: 7, warehouseId: undefined, trendLabels: [], trendSeries: {}, chart: null }
  },
  mounted() { this.$nextTick(() => this.resizeChart()); window.addEventListener('resize', this.resizeChart) },
  beforeDestroy() { window.removeEventListener('resize', this.resizeChart); if (this.chart) this.chart.dispose() },
  methods: {
    load(warehouseId) {
      this.warehouseId = warehouseId
      this.loading = true
      return WmsHomeStatisticsApi.getOrderTrend(this.trendDays, warehouseId ? { warehouseId } : {})
        .then(response => {
          const list = response.data
          this.trendLabels = list.map(item => this.formatDay(item.time))
          this.trendSeries = {
            [OrderTypeEnum.RECEIPT]: list.map(item => Number(item.receiptCount || 0)),
            [OrderTypeEnum.SHIPMENT]: list.map(item => Number(item.shipmentCount || 0)),
            [OrderTypeEnum.MOVEMENT]: list.map(item => Number(item.movementCount || 0)),
            [OrderTypeEnum.CHECK]: list.map(item => Number(item.checkCount || 0))
          }
          this.$nextTick(() => this.renderChart())
        })
        .finally(() => { this.loading = false })
    },
    handleTrendDaysChange() { this.load(this.warehouseId) },
    formatDay(value) {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    },
    resizeChart() { if (this.chart) this.chart.resize() },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption({
        color: ['#2f7df6', '#18a058', '#f59e0b', '#7c3aed'],
        tooltip: { trigger: 'axis' },
        legend: { top: 4, data: ['入库', '出库', '移库', '盘库'] },
        grid: { top: 42, left: 28, right: 24, bottom: 24, containLabel: true },
        xAxis: { type: 'category', data: this.trendLabels },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          { name: '入库', type: 'bar', data: this.trendSeries[OrderTypeEnum.RECEIPT] || [] },
          { name: '出库', type: 'bar', data: this.trendSeries[OrderTypeEnum.SHIPMENT] || [] },
          { name: '移库', type: 'bar', data: this.trendSeries[OrderTypeEnum.MOVEMENT] || [] },
          { name: '盘库', type: 'bar', data: this.trendSeries[OrderTypeEnum.CHECK] || [] }
        ]
      }, true)
    }
  }
}
</script>

<style scoped>
.wms-home-panel { margin-bottom: 16px; padding: 18px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(15, 23, 42, .04); }
.wms-home-panel__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.wms-home-panel__title { color: #303133; font-size: 16px; font-weight: 600; }
.wms-home-panel__subtitle { margin-top: 4px; color: #909399; font-size: 13px; }
.wms-home-chart { height: 330px; }
</style>
