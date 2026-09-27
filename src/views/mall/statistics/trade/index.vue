<template>
  <div class="app-container trade-statistics">
    <doc-alert
      title="【统计】会员、商品、交易统计"
      url="https://doc.iocoder.cn/mall/statistics/"
    />

    <el-row
      :gutter="16"
      class="summary-row"
    >
      <el-col
        v-for="metric in summaryMetrics"
        :key="metric.key"
        :sm="6"
        :xs="12"
      >
        <TradeStatisticValue
          v-loading="summaryLoading"
          :title="metric.title"
          :tooltip="metric.tooltip"
          :prefix="metric.amount ? '￥' : ''"
          :decimals="metric.amount ? 2 : 0"
          :value="metricValue(summary, metric)"
          :percent="metricPercent(summary, metric)"
        />
      </el-col>
    </el-row>

    <el-card
      shadow="never"
      class="trend-card"
    >
      <div
        slot="header"
        class="trend-card__header"
      >
        <span class="trend-card__title">交易状况</span>
        <div class="trend-card__filters">
          <el-radio-group
            v-model="shortcutDays"
            size="small"
            @change="handleShortcutDaysChange"
          >
            <el-radio-button :label="1">昨日</el-radio-button>
            <el-radio-button :label="7">最近 7 天</el-radio-button>
            <el-radio-button :label="30">最近 30 天</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd"
            :default-time="['00:00:00', '23:59:59']"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            unlink-panels
            class="trend-date-picker"
            @change="handleCustomDateRangeChange"
          />
          <el-button
            v-hasPermi="['statistics:trade:export']"
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
        class="trend-summary-row"
      >
        <el-col
          v-for="metric in trendMetrics"
          :key="metric.key"
          :md="6"
          :sm="12"
          :xs="24"
        >
          <TradeStatisticValue
            :title="metric.title"
            :tooltip="metric.tooltip"
            prefix="￥"
            :decimals="2"
            :value="metricValue(trendSummary, metric)"
            :percent="metricPercent(trendSummary, metric)"
          />
        </el-col>
      </el-row>

      <div
        v-loading="trendLoading"
        class="chart-wrapper"
      >
        <div
          ref="chart"
          class="trade-chart"
        />
        <div
          v-if="!trendLoading && trendList.length === 0"
          class="chart-empty"
        >
          暂无统计数据
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import download from '@/plugins/download'
import {
  exportTradeStatisticsExcel,
  getTradeStatisticsAnalyse,
  getTradeStatisticsList,
  getTradeStatisticsSummary
} from '@/api/mall/statistics/trade'
import TradeStatisticValue from './components/TradeStatisticValue.vue'

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

function createRange(start, end) {
  return [
    new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0),
    new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
  ]
}

function createPickerOptions() {
  return {
    shortcuts: [
      {
        text: '昨天',
        onClick(picker) {
          const today = new Date()
          const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          picker.$emit('pick', createRange(yesterday, yesterday))
        }
      },
      {
        text: '最近7天',
        onClick(picker) {
          const today = new Date()
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
          const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          picker.$emit('pick', createRange(start, end))
        }
      },
      {
        text: '本月',
        onClick(picker) {
          const today = new Date()
          const start = new Date(today.getFullYear(), today.getMonth(), 1)
          const end = today.getDate() === 1
            ? today
            : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          picker.$emit('pick', createRange(start, end))
        }
      },
      {
        text: '最近30天',
        onClick(picker) {
          const today = new Date()
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30)
          const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          picker.$emit('pick', createRange(start, end))
        }
      },
      {
        text: '最近1年',
        onClick(picker) {
          const today = new Date()
          const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
          const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          picker.$emit('pick', createRange(start, end))
        }
      }
    ]
  }
}

export default {
  name: 'TradeStatistics',
  components: { TradeStatisticValue },
  data() {
    return {
      summaryLoading: false,
      trendLoading: false,
      exportLoading: false,
      summary: emptyComparison(),
      trendSummary: emptyComparison(),
      trendList: [],
      shortcutDays: 7,
      dateRange: [],
      pickerOptions: createPickerOptions(),
      chart: null,
      summaryRequestSequence: 0,
      trendRequestSequence: 0,
      summaryMetrics: [
        { key: 'yesterdayOrderCount', title: '昨日订单数量', tooltip: '昨日订单数量' },
        { key: 'monthOrderCount', title: '本月订单数量', tooltip: '本月订单数量' },
        { key: 'yesterdayPayPrice', title: '昨日支付金额', tooltip: '昨日支付金额', amount: true },
        { key: 'monthPayPrice', title: '本月支付金额', tooltip: '本月支付金额', amount: true }
      ],
      trendMetrics: [
        { key: 'turnoverPrice', title: '营业额', tooltip: '商品支付金额、充值金额', amount: true },
        {
          key: 'orderPayPrice',
          title: '商品支付金额',
          tooltip: '用户购买商品的实际支付金额，包括微信支付、余额支付、支付宝支付、线下支付金额（拼团商品在成团之后计入，线下支付订单在后台确认支付后计入）',
          amount: true
        },
        { key: 'rechargePrice', title: '充值金额', tooltip: '用户成功充值的金额', amount: true },
        { key: 'expensePrice', title: '支出金额', tooltip: '余额支付金额、支付佣金金额、商品退款金额', amount: true },
        { key: 'walletPayPrice', title: '余额支付金额', tooltip: '用户下单时使用余额实际支付的金额', amount: true },
        { key: 'brokerageSettlementPrice', title: '支付佣金金额', tooltip: '后台给推广员支付的推广佣金，以实际支付为准', amount: true },
        { key: 'afterSaleRefundPrice', title: '商品退款金额', tooltip: '用户成功退款的商品金额', amount: true }
      ]
    }
  },
  created() {
    this.dateRange = this.buildShortcutRange(this.shortcutDays)
    this.loadSummary()
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart)
    this.loadTradeTrend()
  },
  beforeDestroy() {
    this.summaryRequestSequence += 1
    this.trendRequestSequence += 1
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    buildShortcutRange(days) {
      const today = new Date()
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59)
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - Number(days), 0, 0, 0)
      return [formatDateTime(start), formatDateTime(end)]
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
    handleShortcutDaysChange(days) {
      this.dateRange = this.buildShortcutRange(days)
      this.loadTradeTrend()
    },
    handleCustomDateRangeChange(times) {
      this.shortcutDays = null
      this.dateRange = Array.isArray(times) ? times.slice(0, 2) : []
      this.loadTradeTrend()
    },
    metricValue(comparison, metric) {
      const source = comparison && comparison.value ? comparison.value : {}
      const value = Number(source[metric.key] || 0)
      const safeValue = Number.isFinite(value) ? value : 0
      return metric.amount ? safeValue / 100 : safeValue
    },
    metricPercent(comparison, metric) {
      const value = comparison && comparison.value ? Number(comparison.value[metric.key] || 0) : 0
      const reference = comparison && comparison.reference
        ? Number(comparison.reference[metric.key] || 0)
        : 0
      if (!reference) return 0
      return ((100 * (value - reference)) / reference).toFixed(0)
    },
    async loadSummary() {
      const requestId = ++this.summaryRequestSequence
      this.summaryLoading = true
      try {
        const response = await getTradeStatisticsSummary()
        if (requestId !== this.summaryRequestSequence) return
        this.summary = response.data
      } finally {
        if (requestId === this.summaryRequestSequence) this.summaryLoading = false
      }
    },
    async loadTradeTrend() {
      const times = this.getQueryTimes()
      const requestId = ++this.trendRequestSequence
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
          getTradeStatisticsAnalyse({ times: times.slice() }),
          getTradeStatisticsList({ times: times.slice() })
        ])
        if (requestId !== this.trendRequestSequence) return
        this.trendSummary = responses[0].data
        const list = responses[1].data
        this.trendList = list.map(item => ({
          ...item,
          turnoverPrice: this.fenToYuanNumber(item.turnoverPrice),
          orderPayPrice: this.fenToYuanNumber(item.orderPayPrice),
          rechargePrice: this.fenToYuanNumber(item.rechargePrice),
          expensePrice: this.fenToYuanNumber(item.expensePrice)
        }))
        this.$nextTick(() => this.renderChart())
      } finally {
        if (requestId === this.trendRequestSequence) this.trendLoading = false
      }
    },
    fenToYuanNumber(value) {
      const number = Number(value)
      return Number.isFinite(number) ? Number((number / 100).toFixed(2)) : 0
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption({
        dataset: {
          dimensions: ['date', 'turnoverPrice', 'orderPayPrice', 'rechargePrice', 'expensePrice'],
          source: this.trendList
        },
        grid: { left: 20, right: 20, bottom: 20, top: 80, containLabel: true },
        legend: { top: 50 },
        series: [
          { name: '营业额', type: 'line', smooth: true },
          { name: '商品支付金额', type: 'line', smooth: true },
          { name: '充值金额', type: 'line', smooth: true },
          { name: '支出金额', type: 'line', smooth: true }
        ],
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: false },
            brush: { type: ['lineX', 'clear'] },
            saveAsImage: { show: true, name: '交易状况' }
          }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, padding: [5, 10] },
        xAxis: { type: 'category', boundaryGap: false, axisTick: { show: false }},
        yAxis: { type: 'value', axisTick: { show: false }, axisLabel: { formatter: '￥{value}' }}
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
        await this.$modal.confirm('是否确认导出交易状况数据？')
        this.exportLoading = true
        const response = await exportTradeStatisticsExcel({ times: times.slice() })
        download.excel(response.data, '交易状况.xls')
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
.summary-row,
.trend-summary-row {
  margin-bottom: 0;

  .el-col {
    margin-bottom: 16px;
  }
}

.trend-card__header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.trend-card__title {
  flex: none;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.trend-card__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.trend-date-picker {
  width: 260px;
}

.trend-summary-row {
  margin-top: 2px;
}

.chart-wrapper {
  position: relative;
  min-height: 500px;
}

.trade-chart {
  width: 100%;
  height: 500px;
}

.chart-empty {
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
  .trend-card__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .trend-card__filters {
    justify-content: flex-start;
    width: 100%;
  }
}

@media (max-width: 560px) {
  .trend-date-picker {
    width: 100%;
  }
}
</style>
