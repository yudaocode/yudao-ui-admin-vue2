<template>
  <el-card
    shadow="hover"
    class="mes-work-order-chart"
  >
    <div
      slot="header"
      class="mes-work-order-chart__header"
    >工单状态分布</div>
    <div
      ref="chart"
      class="mes-work-order-chart__canvas"
    />
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { MesHomeStatisticsApi } from '@/api/mes/home'
import { MesProWorkOrderStatusEnum } from '@/views/mes/utils/constants'

const statusColorMap = {
  [MesProWorkOrderStatusEnum.PREPARE]: '#909399',
  [MesProWorkOrderStatusEnum.CONFIRMED]: '#409eff',
  [MesProWorkOrderStatusEnum.FINISHED]: '#67c23a',
  [MesProWorkOrderStatusEnum.CANCELED]: '#f56c6c'
}

export default {
  name: 'HomeWorkOrderChart',
  data() {
    return { chart: null }
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
      return MesHomeStatisticsApi.getWorkOrderStatusDistribution().then((response) => {
        this.renderChart(response.data)
      })
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart(data) {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, type: 'scroll' },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
            label: { show: true, formatter: '{b}\n{c}' },
            emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' }},
            data: data.map(item => ({
              name: item.statusName,
              value: item.count,
              itemStyle: { color: statusColorMap[item.status] || '#409eff' }
            }))
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.mes-work-order-chart { height: 100%; }
.mes-work-order-chart__header { color: #303133; font-size: 16px; font-weight: 600; }
.mes-work-order-chart__canvas { width: 100%; height: 280px; }
</style>
