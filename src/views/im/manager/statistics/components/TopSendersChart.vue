<template>
  <el-card
    shadow="never"
    class="chart-card"
  ><div slot="header">消息发送 TOP 10</div><div
    ref="chart"
    v-loading="loading"
    class="chart"
  /></el-card>
</template>

<script>
import * as echarts from 'echarts'
import { getTopSenders } from '@/api/im/manager/statistics'

export default {
  name: 'ImStatisticsTopSendersChart',
  data() {
    return { loading: false, chart: null }
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
    render(data) {
      const sorted = data.slice().sort((first, second) => first.messageCount - second.messageCount)
      if (this.chart) {
        this.chart.setOption({
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }},
          grid: { left: '3%', right: '4%', bottom: '3%', top: 20, containLabel: true },
          xAxis: { type: 'value', name: '消息数' },
          yAxis: { type: 'category', data: sorted.map(item => (item.nickname || item.userId) + '(' + item.userId + ')'), axisLabel: { width: 110, overflow: 'truncate' }},
          series: [{ type: 'bar', data: sorted.map(item => item.messageCount), itemStyle: { color: '#409EFF', borderRadius: [0, 4, 4, 0] }, barMaxWidth: 18 }]
        })
      }
    },
    async loadData() {
      this.loading = true
      try {
        const response = await getTopSenders()
        this.render(response.data)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.chart-card { margin-bottom: 16px; border-radius: 8px; }
.chart { width: 100%; height: 320px; }
</style>
