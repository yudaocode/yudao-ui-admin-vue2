<template>
  <div v-loading="loading" class="fms-home-metric-charts">
    <section class="metric-chart-panel trend-panel">
      <div class="chart-title">
        {{ metricDetail ? metricDetail.name + '变化趋势（单位：元）' : '财务指标趋势（单位：元）' }}
      </div>
      <div ref="trendChart" class="chart-canvas" />
    </section>
    <section class="metric-chart-panel structure-panel">
      <div class="chart-title">
        {{ metricDetail ? formatCurrentMonth() + ' ' + metricDetail.name + '结构分析（单位：元）' : '本期指标结构（单位：元）' }}
      </div>
      <div v-show="structureChartData.length > 0" ref="structureChart" class="chart-canvas" />
      <el-empty
        v-if="structureChartData.length === 0"
        class="chart-empty"
        description="暂无科目构成数据"
      />
    </section>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { FMS_HOME_METRIC_COLORS } from '@/views/fms/utils/constants'
import { formatAmount } from '@/views/fms/utils/format'

export default {
  name: 'FmsHomeMetricCharts',
  props: {
    home: { type: Object, default: null },
    metricDetail: { type: Object, default: null },
    selectedMetricKey: { type: String, default: '' },
    loading: { type: Boolean, default: false }
  },
  data() {
    return { trendChart: null, structureChart: null }
  },
  computed: {
    homeMetrics() {
      return this.home && Array.isArray(this.home.metrics) ? this.home.metrics : []
    },
    homeTrends() {
      return this.home && Array.isArray(this.home.trends) ? this.home.trends : []
    },
    structureChartData() {
      return this.buildStructureChartData()
    }
  },
  watch: {
    home: { deep: true, handler() { this.scheduleRender() } },
    metricDetail: { deep: true, handler() { this.scheduleRender() } },
    selectedMetricKey() { this.scheduleRender() }
  },
  mounted() {
    this.scheduleRender()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    const charts = [this.trendChart, this.structureChart]
    charts.forEach(chart => chart && chart.dispose())
    this.trendChart = null
    this.structureChart = null
  },
  methods: {
    scheduleRender() {
      this.$nextTick(this.renderCharts)
    },
    resizeCharts() {
      const charts = [this.trendChart, this.structureChart]
      charts.forEach(chart => chart && chart.resize())
    },
    renderCharts() {
      if (this.$refs.trendChart) {
        this.trendChart = this.trendChart || echarts.init(this.$refs.trendChart)
        this.trendChart.setOption(this.buildTrendChartOptions(), true)
      }
      if (this.$refs.structureChart && this.structureChartData.length > 0) {
        this.structureChart = this.structureChart || echarts.init(this.$refs.structureChart)
        this.structureChart.setOption(this.buildStructureChartOptions(), true)
      } else if (this.structureChart) {
        this.structureChart.clear()
      }
    },
    buildTrendChartOptions() {
      const commonOptions = {
        color: FMS_HOME_METRIC_COLORS,
        grid: { left: 16, right: 24, top: 48, bottom: 12, containLabel: true },
        legend: { top: 0 },
        tooltip: { trigger: 'axis', valueFormatter: value => formatAmount(Number(value)) },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: value => this.formatCompactAmount(value) }
        }
      }
      if (this.metricDetail) {
        const trends = Array.isArray(this.metricDetail.trends) ? this.metricDetail.trends : []
        return Object.assign({}, commonOptions, {
          xAxis: { type: 'category', boundaryGap: false, data: trends.map(item => item.month) },
          series: [{
            name: this.metricDetail.name,
            type: 'line',
            smooth: true,
            areaStyle: { opacity: 0.12 },
            data: trends.map(item => item.amount)
          }]
        })
      }
      return Object.assign({}, commonOptions, {
        xAxis: { type: 'category', boundaryGap: false, data: this.homeTrends.map(item => item.month) },
        series: this.homeMetrics.map(metric => ({
          name: metric.name,
          type: 'line',
          smooth: true,
          data: this.homeTrends.map(trend => {
            const metrics = Array.isArray(trend.metrics) ? trend.metrics : []
            const item = metrics.find(current => current.key === metric.key)
            return item ? item.amount : 0
          })
        }))
      })
    },
    buildStructureChartOptions() {
      return {
        color: FMS_HOME_METRIC_COLORS,
        tooltip: { trigger: 'item', valueFormatter: value => formatAmount(Number(value)) },
        legend: { bottom: 0 },
        series: [{
          name: '本期指标',
          type: 'pie',
          radius: ['46%', '72%'],
          center: ['50%', '44%'],
          label: { formatter: '{b}\n{d}%' },
          data: this.structureChartData
        }]
      }
    },
    buildStructureChartData() {
      if (!this.metricDetail) {
        return this.homeMetrics.filter(metric => Number(metric.amount) > 0).map(metric => ({
          name: metric.name,
          value: Number(metric.amount)
        }))
      }
      const source = Array.isArray(this.metricDetail.structure) ? this.metricDetail.structure : []
      const structure = source.filter(item => Number(item.amount) > 0).map(item => ({
        name: item.subjectCode + ' ' + item.subjectName,
        value: Number(item.amount)
      }))
      if (structure.length === 0) {
        const metric = this.homeMetrics.find(item => item.key === this.selectedMetricKey)
        return metric && Number(metric.amount) > 0
          ? [{ name: metric.name, value: Number(metric.amount) }]
          : []
      }
      const result = structure.slice(0, 5)
      if (structure.length > 5) {
        result.push({
          name: '其他',
          value: structure.slice(5).reduce((total, item) => total + item.value, 0)
        })
      }
      return result
    },
    formatCompactAmount(amount) {
      const value = Number(amount || 0)
      return Math.abs(value) >= 10000 ? (value / 10000).toFixed(1) + '万' : value.toFixed(0)
    },
    formatCurrentMonth() {
      const currentMonth = this.home && this.home.currentMonth
      const month = Number(currentMonth && String(currentMonth).slice(5, 7))
      return month ? month + '月' : ''
    }
  }
}
</script>

<style scoped>
.fms-home-metric-charts { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 16px; }
.metric-chart-panel { min-width: 0; }
.chart-title { margin-bottom: 16px; color: #303133; font-size: 16px; font-weight: 600; }
.chart-canvas, .chart-empty { height: 360px; }
.chart-empty { display: flex; align-items: center; justify-content: center; }
@media (max-width: 1200px) {
  .fms-home-metric-charts { grid-template-columns: 1fr; }
}
</style>
