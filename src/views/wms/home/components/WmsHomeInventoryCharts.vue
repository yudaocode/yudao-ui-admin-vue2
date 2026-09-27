<template>
  <el-row
    v-loading="loading"
    :gutter="16"
  >
    <el-col
      :span="12"
      :xs="24"
    >
      <div class="wms-home-panel">
        <div class="wms-home-panel__title">货物占比</div>
        <div class="wms-home-panel__subtitle">按商品库存数量汇总 Top 5</div>
        <div
          ref="goodsChart"
          class="wms-home-chart"
        />
      </div>
    </el-col>
    <el-col
      :span="12"
      :xs="24"
    >
      <div class="wms-home-panel">
        <div class="wms-home-panel__header">
          <div>
            <div class="wms-home-panel__title">库存分布</div>
            <div class="wms-home-panel__subtitle">按仓库库存数量汇总</div>
          </div>
          <span class="wms-home-total">总库存 {{ formatQuantityText(totalQuantity) }}</span>
        </div>
        <div
          ref="warehouseChart"
          class="wms-home-chart"
        />
      </div>
    </el-col>
  </el-row>
</template>

<script>
import * as echarts from 'echarts'
import { WmsHomeStatisticsApi } from '@/api/wms/home'
import { formatQuantity } from '@/views/wms/utils/format'

export default {
  name: 'WmsHomeInventoryCharts',
  data() { return { loading: false, totalQuantity: 0, goodsShareList: [], inventoryDistributionList: [], goodsChart: null, warehouseChart: null } },
  mounted() { window.addEventListener('resize', this.resizeCharts) },
  beforeDestroy() { window.removeEventListener('resize', this.resizeCharts); [this.goodsChart, this.warehouseChart].forEach(chart => chart && chart.dispose()) },
  methods: {
    formatQuantityText(value) { return formatQuantity(value) || '0.00' },
    load(warehouseId) {
      this.loading = true
      return WmsHomeStatisticsApi.getInventorySummary(Object.assign({}, warehouseId ? { warehouseId } : {}, { goodsLimit: 5, warehouseLimit: 8 }))
        .then(response => {
          const data = response.data
          this.totalQuantity = Number(data.totalQuantity || 0)
          this.goodsShareList = this.buildList(data.goodsShareList, 'name', 'quantity', '未命名商品')
          this.inventoryDistributionList = this.buildList(data.warehouseDistributionList, 'name', 'quantity', '未指定仓库')
          this.$nextTick(() => this.renderCharts())
        })
        .finally(() => { this.loading = false })
    },
    buildList(list, nameKey, valueKey, fallback) { return (list || []).map(item => ({ name: item[nameKey] || fallback, value: Number(item[valueKey] || 0) })).filter(item => item.value > 0) },
    resizeCharts() { [this.goodsChart, this.warehouseChart].forEach(chart => chart && chart.resize()) },
    renderCharts() {
      if (this.$refs.goodsChart) {
        this.goodsChart = this.goodsChart || echarts.init(this.$refs.goodsChart)
        this.goodsChart.setOption({ color: ['#2f7df6', '#18a058', '#f59e0b', '#7c3aed', '#14b8a6'], tooltip: { trigger: 'item', formatter: '{b}<br/>库存：{c} ({d}%)' }, legend: { type: 'scroll', orient: 'vertical', right: 10, top: 'middle' }, series: [{ name: '货物占比', type: 'pie', radius: ['48%', '70%'], center: ['34%', '52%'], label: { show: false }, data: this.goodsShareList }] }, true)
      }
      if (this.$refs.warehouseChart) {
        this.warehouseChart = this.warehouseChart || echarts.init(this.$refs.warehouseChart)
        const list = this.inventoryDistributionList.slice().reverse()
        this.warehouseChart.setOption({ color: ['#2f7df6'], tooltip: { trigger: 'axis' }, grid: { top: 12, left: 24, right: 40, bottom: 16, containLabel: true }, xAxis: { type: 'value', minInterval: 1 }, yAxis: { type: 'category', data: list.map(item => item.name) }, series: [{ name: '库存', type: 'bar', data: list.map(item => item.value), label: { show: true, position: 'right', formatter: params => this.formatQuantityText(params.value) }}] }, true)
      }
    }
  }
}
</script>

<style scoped>
.wms-home-panel { margin-bottom: 16px; padding: 18px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(15, 23, 42, .04); }
.wms-home-panel__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.wms-home-panel__title { color: #303133; font-size: 16px; font-weight: 600; }
.wms-home-panel__subtitle { margin: 4px 0 12px; color: #909399; font-size: 13px; }
.wms-home-total { color: #303133; font-size: 14px; font-weight: 600; }
.wms-home-chart { height: 300px; }
</style>
