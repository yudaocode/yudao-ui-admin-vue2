<template>
  <el-card
    shadow="never"
    class="chart-card"
  ><div
    slot="header"
    class="card-header"
  ><span>用户趋势（新增注册 + 日活）</span><el-select
    v-model="days"
    size="small"
    style="width: 100px"
    @change="loadData"
  ><el-option
    label="近 7 天"
    :value="7"
  /><el-option
    label="近 15 天"
    :value="15"
  /><el-option
    label="近 30 天"
    :value="30"
  /></el-select></div><div
    ref="chart"
    v-loading="loading"
    class="chart"
  /></el-card>
</template>

<script>
import * as echarts from 'echarts'
import { getUserTrend } from '@/api/im/manager/statistics'

export default {
  name: 'ImStatisticsUserTrendChart',
  data() {
    return { days: 7, loading: false, chart: null }
  },
  mounted() {
    this.$nextTick(async() => {
      if (!this.$refs.chart) return
      this.chart = echarts.init(this.$refs.chart)
      await this.loadData()
    })
  },
  beforeDestroy() {
    if (this.chart) this.chart.dispose()
  },
  methods: {
    buildOption(dates, registerData, activeData) {
      return {
        tooltip: { trigger: 'axis' }, legend: { data: ['新增注册', '日活'], top: 0 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
        xAxis: { type: 'category', data: dates, axisLabel: { formatter: value => value.slice(5, 10) }},
        yAxis: [{ type: 'value', name: '新增注册', position: 'left' }, { type: 'value', name: '日活', position: 'right' }],
        series: [
          { name: '新增注册', type: 'bar', yAxisIndex: 0, data: registerData, itemStyle: { color: '#E6A23C' }, barMaxWidth: 24 },
          { name: '日活', type: 'line', yAxisIndex: 1, smooth: true, data: activeData, itemStyle: { color: '#F56C6C' }}
        ]
      }
    },
    async loadData() {
      this.loading = true
      try {
        const response = await getUserTrend(this.days)
        if (this.chart) this.chart.setOption(this.buildOption(response.data.dates, response.data.series.register || [], response.data.series.active || []))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.chart-card { margin-bottom: 16px; border-radius: 8px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.chart { width: 100%; height: 320px; }
</style>
