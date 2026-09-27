<template>
  <el-card shadow="hover">
    <div
      slot="header"
      class="mes-chart__header"
    >
      <span>生产趋势</span>
      <el-radio-group
        v-model="trendDays"
        size="small"
        @change="loadData"
      >
        <el-radio-button :label="7">近 7 天</el-radio-button>
        <el-radio-button :label="30">近 30 天</el-radio-button>
      </el-radio-group>
    </div>
    <div
      ref="chart"
      class="mes-chart__canvas mes-chart__canvas--trend"
    />
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { MesHomeStatisticsApi } from '@/api/mes/home'

export default {
  name: 'HomeProductionTrend',
  data() {
    return {
      chart: null,
      trendDays: 7
    }
  },
  mounted() {
    this.loadData()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    loadData() {
      return MesHomeStatisticsApi.getProductionTrend(this.trendDays).then((response) => {
        this.renderChart(response.data)
      })
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart(data) {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      const dates = data.map(item => item.date.substring(5))
      this.chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }},
        legend: { data: ['产量', '合格品', '不良品'], bottom: 0 },
        grid: { left: 50, right: 20, top: 20, bottom: 40 },
        xAxis: { type: 'category', data: dates, boundaryGap: false },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          {
            name: '产量',
            type: 'line',
            smooth: true,
            data: data.map(item => item.quantity),
            itemStyle: { color: '#409eff' },
            areaStyle: { color: 'rgba(64, 158, 255, 0.15)' }
          },
          {
            name: '合格品',
            type: 'line',
            smooth: true,
            data: data.map(item => item.qualifiedQuantity),
            itemStyle: { color: '#67c23a' }
          },
          {
            name: '不良品',
            type: 'line',
            smooth: true,
            data: data.map(item => item.unqualifiedQuantity),
            itemStyle: { color: '#f56c6c' }
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.mes-chart__header { display: flex; align-items: center; justify-content: space-between; color: #303133; font-size: 16px; font-weight: 600; }
.mes-chart__canvas { width: 100%; }
.mes-chart__canvas--trend { height: 320px; }
</style>
