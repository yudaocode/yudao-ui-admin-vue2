<template>
  <el-card
    shadow="never"
    class="home-card member-statistics-card"
  >
    <div
      slot="header"
      class="home-card__title"
    >用户统计</div>
    <div
      v-loading="loading"
      class="member-statistics-card__chart-wrapper"
    >
      <div
        ref="chart"
        class="member-statistics-card__chart"
      />
      <div
        v-if="!loading && list.length === 0"
        class="home-chart-empty"
      >暂无统计数据</div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import * as MemberStatisticsApi from '@/api/mall/statistics/member'

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
}

export default {
  name: 'MemberStatisticsCard',
  data() {
    return {
      loading: true,
      list: [],
      chart: null,
      requestSequence: 0
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart)
    this.loadData()
  },
  beforeDestroy() {
    this.requestSequence += 1
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    async loadData() {
      const requestId = ++this.requestSequence
      const now = new Date()
      const beginTime = new Date(now)
      beginTime.setDate(beginTime.getDate() - 30)
      this.loading = true
      try {
        const response = await MemberStatisticsApi.getMemberRegisterCountList(
          startOfDay(beginTime),
          endOfDay(now)
        )
        if (requestId !== this.requestSequence) return false
        this.list = response.data
        this.$nextTick(() => this.renderChart())
        return true
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    formatAxisDate(value) {
      const text = String(value || '')
      return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(5, 10) : text
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption({
        dataset: {
          dimensions: ['date', 'count'],
          source: this.list
        },
        grid: { left: 20, right: 20, bottom: 20, top: 80, containLabel: true },
        legend: { top: 50 },
        series: [{ name: '注册量', type: 'line', smooth: true, areaStyle: {}}],
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: false },
            brush: { type: ['lineX', 'clear'] },
            saveAsImage: { show: true, name: '会员统计' }
          }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, padding: [5, 10] },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisTick: { show: false },
          axisLabel: { formatter: value => this.formatAxisDate(value) }
        },
        yAxis: { type: 'value', minInterval: 1, axisTick: { show: false }}
      }, true)
      this.chart.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
.home-card__title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.member-statistics-card__chart-wrapper {
  position: relative;
  min-height: 300px;
}

.member-statistics-card__chart {
  width: 100%;
  height: 300px;
}

.home-chart-empty {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  color: #909399;
  font-size: 13px;
  text-align: center;
  pointer-events: none;
}
</style>
