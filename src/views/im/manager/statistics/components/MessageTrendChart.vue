<template>
  <el-card
    shadow="never"
    class="chart-card"
  ><div
    slot="header"
    class="card-header"
  ><span>消息趋势（私聊 + 群聊）</span><el-select
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
import { getMessageTrend } from '@/api/im/manager/statistics'

export default {
  name: 'ImStatisticsMessageTrendChart',
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
    buildOption(dates, privateData, groupData) {
      return {
        tooltip: { trigger: 'axis' }, legend: { data: ['私聊消息', '群聊消息'], top: 0 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
        xAxis: { type: 'category', data: dates, axisLabel: { formatter: value => value.slice(5, 10) }},
        yAxis: { type: 'value', name: '消息量' },
        series: [
          { name: '私聊消息', type: 'line', smooth: true, data: privateData, itemStyle: { color: '#409EFF' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(64,158,255,0.35)' }, { offset: 1, color: 'rgba(64,158,255,0.05)' }] }}},
          { name: '群聊消息', type: 'line', smooth: true, data: groupData, itemStyle: { color: '#67C23A' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(103,194,58,0.35)' }, { offset: 1, color: 'rgba(103,194,58,0.05)' }] }}}
        ]
      }
    },
    async loadData() {
      this.loading = true
      try {
        const response = await getMessageTrend(this.days)
        if (this.chart) this.chart.setOption(this.buildOption(response.data.dates, response.data.series.private || [], response.data.series.group || []))
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
