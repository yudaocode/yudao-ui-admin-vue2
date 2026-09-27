<template>
  <el-card
    shadow="never"
    class="chart-card"
  ><div slot="header">群规模分布</div><div
    ref="chart"
    v-loading="loading"
    class="chart"
  /></el-card>
</template>

<script>
import * as echarts from 'echarts'
import { getGroupSizeDistribution } from '@/api/im/manager/statistics'

export default {
  name: 'ImStatisticsGroupSizeChart',
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
      if (this.chart) {
        this.chart.setOption({
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '3%', top: 30, containLabel: true },
          xAxis: { type: 'category', data: data.map(item => item.range) },
          yAxis: { type: 'value', name: '群组数' },
          series: [{ type: 'bar', data: data.map(item => item.count), itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 48 }]
        })
      }
    },
    async loadData() {
      this.loading = true
      try {
        const response = await getGroupSizeDistribution()
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
