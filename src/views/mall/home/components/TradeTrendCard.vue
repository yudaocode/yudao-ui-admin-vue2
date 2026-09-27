<template>
  <el-card
    shadow="never"
    class="home-card trade-trend-card"
  >
    <div
      slot="header"
      class="trade-trend-card__header"
    >
      <span class="home-card__title">交易量趋势</span>
      <el-radio-group
        v-model="timeRangeType"
        size="small"
        @change="handleTimeRangeTypeChange"
      >
        <el-radio-button
          v-for="item in timeRangeOptions"
          :key="item.value"
          :label="item.value"
        >{{ item.name }}</el-radio-button>
      </el-radio-group>
    </div>
    <div
      v-loading="loading"
      class="trade-trend-card__chart-wrapper"
    >
      <div
        ref="chart"
        class="trade-trend-card__chart"
      />
      <div
        v-if="!loading && dates.length === 0"
        class="home-chart-empty"
      >暂无统计数据</div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import * as TradeStatisticsApi from '@/api/mall/statistics/trade'

const TIME_RANGE_DAY_30 = 1
const TIME_RANGE_WEEK = 7
const TIME_RANGE_MONTH = 30
const TIME_RANGE_YEAR = 365

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
}

function fenToYuanNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Number((number / 100).toFixed(2)) : 0
}

function numericValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default {
  name: 'TradeTrendCard',
  data() {
    return {
      loading: true,
      timeRangeType: TIME_RANGE_DAY_30,
      timeRangeOptions: [
        { value: TIME_RANGE_DAY_30, name: '30天' },
        { value: TIME_RANGE_WEEK, name: '周' },
        { value: TIME_RANGE_MONTH, name: '月' },
        { value: TIME_RANGE_YEAR, name: '年' }
      ],
      dates: [],
      series: [],
      chart: null,
      requestSequence: 0
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart)
    this.handleTimeRangeTypeChange()
  },
  beforeDestroy() {
    this.requestSequence += 1
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    getTimeRange(type) {
      const now = new Date()
      if (type === TIME_RANGE_WEEK) {
        const beginTime = startOfDay(now)
        beginTime.setDate(beginTime.getDate() - beginTime.getDay())
        const endTime = endOfDay(beginTime)
        endTime.setDate(endTime.getDate() + 6)
        return [beginTime, endTime]
      }
      if (type === TIME_RANGE_MONTH) {
        return [
          new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0),
          new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        ]
      }
      if (type === TIME_RANGE_YEAR) {
        return [
          new Date(now.getFullYear(), 0, 1, 0, 0, 0),
          new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        ]
      }
      const beginTime = startOfDay(now)
      beginTime.setDate(beginTime.getDate() - 30)
      return [beginTime, endOfDay(now)]
    },
    getSeriesDefinition(type) {
      if (type === TIME_RANGE_DAY_30) {
        return [
          { name: '订单金额', type: 'bar', smooth: true, data: [] },
          { name: '订单数量', type: 'line', smooth: true, data: [] }
        ]
      }
      const labels = type === TIME_RANGE_WEEK
        ? ['上周金额', '本周金额', '上周数量', '本周数量']
        : type === TIME_RANGE_MONTH
          ? ['上月金额', '本月金额', '上月数量', '本月数量']
          : ['去年金额', '今年金额', '去年数量', '今年数量']
      return labels.map((name, index) => ({
        name,
        type: index < 2 ? 'bar' : 'line',
        smooth: true,
        data: []
      }))
    },
    handleTimeRangeTypeChange() {
      const range = this.getTimeRange(this.timeRangeType)
      return this.loadTrend(this.timeRangeType, range[0], range[1])
    },
    async loadTrend(type, beginTime, endTime) {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const response = await TradeStatisticsApi.getOrderCountTrendComparison(
          type,
          beginTime,
          endTime
        )
        if (requestId !== this.requestSequence) return false
        const list = response.data
        const dates = []
        const series = this.getSeriesDefinition(type)
        list.forEach(item => {
          const value = item && item.value ? item.value : {}
          const reference = item && item.reference ? item.reference : {}
          dates.push(value.date || '')
          if (series.length === 2) {
            series[0].data.push(fenToYuanNumber(value.orderPayPrice))
            series[1].data.push(numericValue(value.orderPayCount))
          } else {
            series[0].data.push(fenToYuanNumber(reference.orderPayPrice))
            series[1].data.push(fenToYuanNumber(value.orderPayPrice))
            series[2].data.push(numericValue(reference.orderPayCount))
            series[3].data.push(numericValue(value.orderPayCount))
          }
        })
        this.dates = dates
        this.series = series
        this.$nextTick(() => this.renderChart())
        return true
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    formatAxisLabel(value) {
      const text = String(value || '')
      if (this.timeRangeType === TIME_RANGE_DAY_30) {
        return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(5, 10) : text
      }
      if (this.timeRangeType === TIME_RANGE_WEEK) {
        const date = new Date(text.replace(/-/g, '/'))
        return Number.isNaN(date.getTime())
          ? text
          : '周' + ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      }
      if (this.timeRangeType === TIME_RANGE_MONTH) {
        const day = Number(text.slice(-2))
        return day || text
      }
      const month = Number(text.slice(5, 7))
      return month ? month + '月' : text
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption({
        grid: { left: 20, right: 20, bottom: 20, top: 80, containLabel: true },
        legend: { top: 50, data: this.series.map(item => item.name) },
        series: this.series,
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: false },
            brush: { type: ['lineX', 'clear'] },
            saveAsImage: { show: true, name: '订单量趋势' }
          }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, padding: [5, 10] },
        xAxis: {
          type: 'category',
          inverse: true,
          boundaryGap: false,
          axisTick: { show: false },
          data: this.dates,
          axisLabel: { formatter: value => this.formatAxisLabel(value) }
        },
        yAxis: { type: 'value', axisTick: { show: false }}
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

.trade-trend-card__header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.trade-trend-card__chart-wrapper {
  position: relative;
  min-height: 300px;
}

.trade-trend-card__chart {
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

@media (max-width: 768px) {
  .trade-trend-card__header {
    align-items: flex-start;
    flex-direction: column;
  }

  ::v-deep .el-radio-group {
    display: flex;
    width: 100%;
  }

  ::v-deep .el-radio-button {
    flex: 1;
  }

  ::v-deep .el-radio-button__inner {
    width: 100%;
    padding-right: 8px;
    padding-left: 8px;
  }
}
</style>
