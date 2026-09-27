<template>
  <el-card
    shadow="never"
    class="chart-card"
  ><div slot="header">内容类型分布</div><div
    ref="chart"
    v-loading="loading"
    class="chart"
  /></el-card>
</template>

<script>
import * as echarts from 'echarts'
import { DICT_TYPE, getDictDataLabel } from '@/utils/dict'
import { getMessageTypeDistribution } from '@/api/im/manager/statistics'

export default {
  name: 'ImStatisticsMessageTypeChart',
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
      const items = data.map(item => ({ name: getDictDataLabel(DICT_TYPE.IM_CONTENT_TYPE, item.type) || '未知(' + item.type + ')', value: item.value }))
      if (this.chart) {
        this.chart.setOption({
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { orient: 'vertical', right: 8, top: 'middle' },
          series: [{ type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, data: items }]
        })
      }
    },
    async loadData() {
      this.loading = true
      try {
        const response = await getMessageTypeDistribution()
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
