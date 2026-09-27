<template>
  <el-card
    shadow="never"
    class="erp-time-chart"
  >
    <div
      slot="header"
      class="erp-time-chart__header"
    >{{ title }}</div>
    <div
      ref="chart"
      class="erp-time-chart__canvas"
    />
    <div
      v-if="!hasData"
      class="erp-time-chart__empty"
    >暂无统计数据</div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ErpTimeSummaryChart',
  props: {
    title: { type: String, default: '' },
    value: { type: Array, default: () => [] }
  },
  data() {
    return { chart: null }
  },
  computed: {
    hasData() { return Array.isArray(this.value) && this.value.length > 0 }
  },
  watch: {
    value: { deep: true, handler() { this.renderChart() } }
  },
  mounted() {
    this.$nextTick(() => this.renderChart())
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    resizeChart() { if (this.chart) this.chart.resize() },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      const rows = Array.isArray(this.value) ? this.value : []
      this.chart.setOption({
        grid: { left: 20, right: 20, top: 80, bottom: 20, containLabel: true },
        legend: { top: 50 },
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: false },
            brush: { type: ['lineX', 'clear'] },
            saveAsImage: { show: true, name: this.title }
          }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, padding: [5, 10] },
        xAxis: { type: 'category', boundaryGap: false, data: rows.map(item => item.time || '') },
        yAxis: { type: 'value', axisLabel: { formatter: value => `￥${value}` }},
        series: [{ name: '金额', type: 'line', smooth: true, areaStyle: {}, data: rows.map(item => Number(item.price || 0)) }]
      })
    }
  }
}
</script>

<style scoped>
.erp-time-chart { position: relative; }
.erp-time-chart__header { color: #303133; font-size: 15px; font-weight: 600; }
.erp-time-chart__canvas { height: 300px; }
.erp-time-chart__empty { position: absolute; top: 55%; left: 0; width: 100%; color: #909399; font-size: 13px; text-align: center; pointer-events: none; }
</style>
