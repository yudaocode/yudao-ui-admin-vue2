<template>
  <el-card
    shadow="never"
    class="product-summary"
  >
    <div
      slot="header"
      class="product-summary__header"
    >
      <span class="product-summary__title">商品概况</span>
      <div class="product-summary__filters">
        <ProductDateRangePicker @change="handleDateRangeChange" />
        <el-button
          v-hasPermi="['statistics:product:export']"
          type="primary"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </div>
    </div>

    <el-row
      :gutter="16"
      class="product-summary__metrics"
    >
      <el-col
        v-for="metric in metrics"
        :key="metric.key"
        :xl="4"
        :md="8"
        :sm="24"
        :xs="24"
      >
        <ProductMetricCard
          :title="metric.title"
          :tooltip="metric.tooltip"
          :icon="metric.icon"
          :icon-tone="metric.iconTone"
          :prefix="metric.amount ? '￥' : ''"
          :decimals="metric.amount ? 2 : 0"
          :value="metricValue(metric)"
          :percent="metricPercent(metric)"
        />
      </el-col>
    </el-row>

    <div
      v-loading="trendLoading"
      class="product-summary__chart-wrapper"
    >
      <div
        ref="chart"
        class="product-summary__chart"
      />
      <div
        v-if="!trendLoading && trendList.length === 0"
        class="product-summary__empty"
      >暂无统计数据</div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import download from '@/plugins/download'
import { ProductStatisticsApi } from '@/api/mall/statistics/product'
import ProductDateRangePicker from './ProductDateRangePicker.vue'
import ProductMetricCard from './ProductMetricCard.vue'

function emptyComparison() {
  return { value: {}, reference: {}}
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(String(value).replace(/-/g, '/'))
  if (Number.isNaN(date.getTime())) return ''
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
    ' ' + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':')
}

export default {
  name: 'ProductSummary',
  components: { ProductDateRangePicker, ProductMetricCard },
  data() {
    return {
      trendLoading: true,
      exportLoading: false,
      trendSummary: emptyComparison(),
      trendList: [],
      dateRange: [],
      chart: null,
      requestSequence: 0,
      metrics: [
        {
          key: 'browseCount',
          title: '商品浏览量',
          tooltip: '在选定条件下，所有商品详情页被访问的次数，一个人在统计时间内访问多次记为多次',
          icon: 'el-icon-view',
          iconTone: 'product-metric-card__icon--blue'
        },
        {
          key: 'browseUserCount',
          title: '商品访客数',
          tooltip: '在选定条件下，访问任何商品详情页的人数，一个人在统计时间范围内访问多次只记为一个',
          icon: 'el-icon-user-solid',
          iconTone: 'product-metric-card__icon--purple'
        },
        {
          key: 'orderPayCount',
          title: '支付件数',
          tooltip: '在选定条件下，成功付款订单的商品件数之和',
          icon: 'el-icon-bank-card',
          iconTone: 'product-metric-card__icon--yellow'
        },
        {
          key: 'orderPayPrice',
          title: '支付金额',
          tooltip: '在选定条件下，成功付款订单的商品金额之和',
          icon: 'el-icon-warning',
          iconTone: 'product-metric-card__icon--green',
          amount: true
        },
        {
          key: 'afterSaleCount',
          title: '退款件数',
          tooltip: '在选定条件下，成功退款的商品件数之和',
          icon: 'el-icon-wallet',
          iconTone: 'product-metric-card__icon--cyan'
        },
        {
          key: 'afterSaleRefundPrice',
          title: '退款金额',
          tooltip: '在选定条件下，成功退款的商品金额之和',
          icon: 'el-icon-medal',
          iconTone: 'product-metric-card__icon--yellow',
          amount: true
        }
      ]
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    this.requestSequence += 1
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    handleDateRangeChange(times) {
      this.dateRange = Array.isArray(times) ? times.slice(0, 2) : []
      this.loadTrend()
    },
    getQueryTimes() {
      if (!Array.isArray(this.dateRange) || !this.dateRange[0] || !this.dateRange[1]) return null
      const times = this.dateRange.slice(0, 2)
      if (String(times[0]).slice(0, 10) === String(times[1]).slice(0, 10)) {
        const start = new Date(String(times[0]).replace(/-/g, '/'))
        if (Number.isNaN(start.getTime())) return null
        start.setDate(start.getDate() - 1)
        times[0] = formatDateTime(start)
      }
      return times
    },
    metricValue(metric) {
      const source = this.trendSummary && this.trendSummary.value
        ? this.trendSummary.value
        : {}
      const value = Number(source[metric.key] || 0)
      const safeValue = Number.isFinite(value) ? value : 0
      return metric.amount ? this.fenToYuanNumber(safeValue) : safeValue
    },
    metricPercent(metric) {
      const value = this.trendSummary && this.trendSummary.value
        ? Number(this.trendSummary.value[metric.key] || 0)
        : 0
      const reference = this.trendSummary && this.trendSummary.reference
        ? Number(this.trendSummary.reference[metric.key] || 0)
        : 0
      if (!reference) return 0
      return ((100 * (value - reference)) / reference).toFixed(0)
    },
    fenToYuanNumber(value) {
      const number = Number(value)
      return Number.isFinite(number) ? Number((number / 100).toFixed(2)) : 0
    },
    async loadTrend() {
      const times = this.getQueryTimes()
      const requestId = ++this.requestSequence
      if (!times) {
        this.trendSummary = emptyComparison()
        this.trendList = []
        this.trendLoading = false
        this.$nextTick(() => this.renderChart())
        return
      }
      this.trendLoading = true
      try {
        const responses = await Promise.all([
          ProductStatisticsApi.getProductStatisticsAnalyse({ times: times.slice() }),
          ProductStatisticsApi.getProductStatisticsList({ times: times.slice() })
        ])
        if (requestId !== this.requestSequence) return
        this.trendSummary = responses[0].data
        const list = responses[1].data
        this.trendList = list.map(item => ({
          ...item,
          orderPayPrice: this.fenToYuanNumber(item.orderPayPrice),
          afterSaleRefundPrice: this.fenToYuanNumber(item.afterSaleRefundPrice)
        }))
        this.$nextTick(() => this.renderChart())
      } finally {
        if (requestId === this.requestSequence) this.trendLoading = false
      }
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption({
        dataset: {
          dimensions: [
            'time',
            'browseCount',
            'browseUserCount',
            'orderPayPrice',
            'afterSaleRefundPrice'
          ],
          source: this.trendList
        },
        grid: { left: 20, right: 20, bottom: 20, top: 80, containLabel: true },
        legend: { top: 50 },
        series: [
          {
            name: '商品浏览量',
            type: 'line',
            smooth: true,
            encode: { x: 'time', y: 'browseCount' },
            itemStyle: { color: '#B37FEB' }
          },
          {
            name: '商品访客数',
            type: 'line',
            smooth: true,
            encode: { x: 'time', y: 'browseUserCount' },
            itemStyle: { color: '#FFAB2B' }
          },
          {
            name: '支付金额',
            type: 'bar',
            yAxisIndex: 1,
            encode: { x: 'time', y: 'orderPayPrice' },
            itemStyle: { color: '#1890FF' }
          },
          {
            name: '退款金额',
            type: 'bar',
            yAxisIndex: 1,
            encode: { x: 'time', y: 'afterSaleRefundPrice' },
            itemStyle: { color: '#00C050' }
          }
        ],
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: false },
            brush: { type: ['lineX', 'clear'] },
            saveAsImage: { show: true, name: '商品状况' }
          }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, padding: [5, 10] },
        xAxis: { type: 'category', boundaryGap: true, axisTick: { show: false }},
        yAxis: [
          {
            type: 'value',
            name: '数量',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#7F8B9C' },
            splitLine: { show: true, lineStyle: { color: '#F5F7F9' }}
          },
          {
            type: 'value',
            name: '金额',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#7F8B9C', formatter: '￥{value}' },
            splitLine: { show: true, lineStyle: { color: '#F5F7F9' }}
          }
        ]
      }, true)
      this.chart.resize()
    },
    async handleExport() {
      const times = this.getQueryTimes()
      if (!times) {
        this.$modal.msgWarning('请选择统计日期范围')
        return
      }
      try {
        await this.$modal.confirm('是否确认导出商品状况数据？')
        this.exportLoading = true
        const response = await ProductStatisticsApi.exportProductStatisticsExcel({ times: times.slice() })
        download.excel(response.data, '商品状况.xls')
      } catch (error) {
        // 用户取消导出时无需提示；请求异常由全局请求拦截器统一处理。
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.product-summary__header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.product-summary__title {
  flex: none;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.product-summary__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.product-summary__metrics {
  margin-bottom: 0;

  .el-col {
    margin-bottom: 16px;
  }
}

.product-summary__chart-wrapper {
  position: relative;
  min-height: 500px;
}

.product-summary__chart {
  width: 100%;
  height: 500px;
}

.product-summary__empty {
  position: absolute;
  top: 54%;
  left: 0;
  width: 100%;
  color: #909399;
  font-size: 14px;
  text-align: center;
  pointer-events: none;
}

@media (max-width: 900px) {
  .product-summary__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .product-summary__filters {
    justify-content: flex-start;
    width: 100%;
  }
}
</style>
