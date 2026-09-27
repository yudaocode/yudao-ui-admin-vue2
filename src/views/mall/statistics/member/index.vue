<template>
  <div class="app-container member-statistics">
    <doc-alert
      title="【统计】会员、商品、交易统计"
      url="https://doc.iocoder.cn/mall/statistics/"
    />

    <el-row
      :gutter="16"
      class="summary-row"
    >
      <el-col
        v-for="card in summaryCards"
        :key="card.field"
        :sm="6"
        :xs="12"
      >
        <MemberSummaryCard
          v-loading="loading"
          :title="card.title"
          :icon="card.icon"
          :icon-tone="card.iconTone"
          :prefix="card.amount ? '￥' : ''"
          :decimals="card.amount ? 2 : 0"
          :value="summaryValue(card)"
        />
      </el-col>
    </el-row>

    <el-row
      :gutter="16"
      class="overview-row"
    >
      <el-col
        :md="18"
        :sm="24"
      >
        <MemberFunnelCard ref="funnelCard" />
      </el-col>
      <el-col
        :md="6"
        :sm="24"
      >
        <MemberTerminalCard ref="terminalCard" />
      </el-col>
    </el-row>

    <el-row
      :gutter="16"
      class="distribution-row"
    >
      <el-col
        :md="18"
        :sm="24"
      >
        <el-card
          v-loading="loading"
          shadow="never"
          class="area-card"
        >
          <div
            slot="header"
            class="member-card-title"
          >会员地域分布</div>
          <el-row :gutter="16">
            <el-col
              :lg="10"
              :xs="24"
            >
              <div class="chart-wrapper">
                <div
                  ref="areaChart"
                  class="area-chart"
                />
                <div
                  v-if="!loading && areaStatisticsList.length === 0"
                  class="chart-empty"
                >
                  暂无统计数据
                </div>
              </div>
            </el-col>
            <el-col
              :lg="14"
              :xs="24"
            >
              <el-table
                :data="areaStatisticsList"
                :height="300"
              >
                <el-table-column
                  :sort-method="sortAreaName"
                  align="center"
                  label="省份"
                  min-width="80"
                  prop="areaName"
                  show-overflow-tooltip
                  sortable
                />
                <el-table-column
                  align="center"
                  label="会员数量"
                  min-width="105"
                  prop="userCount"
                  sortable
                />
                <el-table-column
                  align="center"
                  label="订单创建数量"
                  min-width="135"
                  prop="orderCreateUserCount"
                  sortable
                />
                <el-table-column
                  align="center"
                  label="订单支付数量"
                  min-width="135"
                  prop="orderPayUserCount"
                  sortable
                />
                <el-table-column
                  :formatter="fenToYuanTableFormatter"
                  align="center"
                  label="订单支付金额"
                  min-width="135"
                  prop="orderPayPrice"
                  sortable
                />
              </el-table>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col
        :md="6"
        :sm="24"
      >
        <el-card
          v-loading="loading"
          shadow="never"
          class="sex-card"
        >
          <div
            slot="header"
            class="member-card-title"
          >会员性别比例</div>
          <div class="chart-wrapper">
            <div
              ref="sexChart"
              class="sex-chart"
            />
            <div
              v-if="!loading && !hasSexData"
              class="chart-empty"
            >
              暂无统计数据
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import china from './components/china.json'
import {
  getMemberAreaStatisticsList,
  getMemberSexStatisticsList,
  getMemberSummary
} from '@/api/mall/statistics/member'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import MemberFunnelCard from './components/MemberFunnelCard.vue'
import MemberSummaryCard from './components/MemberSummaryCard.vue'
import MemberTerminalCard from './components/MemberTerminalCard.vue'

echarts.registerMap('china', china)

function areaReplace(areaName) {
  if (!areaName) return areaName
  return areaName
    .replace('维吾尔自治区', '')
    .replace('壮族自治区', '')
    .replace('回族自治区', '')
    .replace('自治区', '')
    .replace('省', '')
}

function sameValue(left, right) {
  if (left === null || left === undefined) return right === null || right === undefined
  return Number(left) === Number(right)
}

function fenToYuan(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? (amount / 100).toFixed(2) : '0.00'
}

export default {
  name: 'MemberStatistics',
  components: { MemberFunnelCard, MemberSummaryCard, MemberTerminalCard },
  data() {
    return {
      loading: true,
      summary: {},
      areaStatisticsList: [],
      sexChartData: [],
      areaChart: null,
      sexChart: null,
      requestSequence: 0,
      summaryCards: [
        {
          field: 'userCount',
          title: '累计会员数',
          icon: 'el-icon-user-solid',
          iconTone: 'member-summary-card__icon--blue'
        },
        {
          field: 'rechargeUserCount',
          title: '累计充值人数',
          icon: 'el-icon-user',
          iconTone: 'member-summary-card__icon--purple'
        },
        {
          field: 'rechargePrice',
          title: '累计充值金额',
          icon: 'el-icon-wallet',
          iconTone: 'member-summary-card__icon--yellow',
          amount: true
        },
        {
          field: 'expensePrice',
          title: '累计消费金额',
          icon: 'el-icon-coin',
          iconTone: 'member-summary-card__icon--green',
          amount: true
        }
      ]
    }
  },
  computed: {
    hasSexData() {
      return this.sexChartData.some(item => Number(item.value || 0) > 0)
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeCharts)
    this.loadData()
  },
  beforeDestroy() {
    this.requestSequence += 1
    window.removeEventListener('resize', this.resizeCharts)
    if (this.areaChart) this.areaChart.dispose()
    if (this.sexChart) this.sexChart.dispose()
    this.areaChart = null
    this.sexChart = null
  },
  methods: {
    summaryValue(card) {
      const value = Number(this.summary[card.field] || 0)
      const safeValue = Number.isFinite(value) ? value : 0
      return card.amount ? safeValue / 100 : safeValue
    },
    sortAreaName(left, right) {
      return String(left.areaName || '').localeCompare(String(right.areaName || ''), 'zh-CN')
    },
    fenToYuanTableFormatter(row, column, cellValue) {
      return '￥' + fenToYuan(cellValue)
    },
    buildSexChartData(rows) {
      const dictionaries = getDictDatas(DICT_TYPE.SYSTEM_USER_SEX).map(dict => ({
        label: dict.label,
        value: Number(dict.value)
      }))
      dictionaries.push({ label: '未知', value: null })
      const result = dictionaries.map(dict => {
        const matched = rows.find(item => sameValue(item.sex, dict.value))
        return { name: dict.label, value: matched ? Number(matched.userCount || 0) : 0 }
      })
      rows.forEach(item => {
        const exists = dictionaries.some(dict => sameValue(item.sex, dict.value))
        if (exists) return
        result.push({ name: '性别 ' + item.sex, value: Number(item.userCount || 0) })
      })
      return result
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const responses = await Promise.all([
          getMemberSummary(),
          getMemberAreaStatisticsList(),
          getMemberSexStatisticsList()
        ])
        if (requestId !== this.requestSequence) return
        this.summary = responses[0] && responses[0].data ? responses[0].data : {}
        const areaList = responses[1].data
        this.areaStatisticsList = areaList.map(item => ({
          ...item,
          areaName: areaReplace(item.areaName)
        }))
        const sexList = responses[2].data
        this.sexChartData = this.buildSexChartData(sexList)
        this.$nextTick(() => this.renderCharts())
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    resizeCharts() {
      if (this.areaChart) this.areaChart.resize()
      if (this.sexChart) this.sexChart.resize()
    },
    renderCharts() {
      this.renderAreaChart()
      this.renderSexChart()
      this.resizeCharts()
    },
    renderAreaChart() {
      if (!this.$refs.areaChart) return
      if (!this.areaChart) this.areaChart = echarts.init(this.$refs.areaChart)
      let min = 0
      let max = 0
      const data = this.areaStatisticsList.map(item => {
        const value = Number(item.orderPayUserCount || 0)
        min = Math.min(min, value)
        max = Math.max(max, value)
        return { ...item, name: item.areaName, value }
      })
      this.areaChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter(params) {
            const item = params.data || {}
            return (item.areaName || params.name || '') + '<br/>' +
              '会员数量：' + Number(item.userCount || 0) + '<br/>' +
              '订单创建数量：' + Number(item.orderCreateUserCount || 0) + '<br/>' +
              '订单支付数量：' + Number(item.orderPayUserCount || 0) + '<br/>' +
              '订单支付金额：￥' + fenToYuan(item.orderPayPrice)
          }
        },
        visualMap: {
          text: ['高', '低'],
          realtime: false,
          calculable: true,
          top: 'middle',
          min,
          max,
          inRange: { color: ['#fff', '#3b82f6'] }
        },
        series: [{
          name: '会员地域分布',
          type: 'map',
          map: 'china',
          roam: false,
          selectedMode: false,
          data
        }]
      }, true)
    },
    renderSexChart() {
      if (!this.$refs.sexChart) return
      if (!this.sexChart) this.sexChart = echarts.init(this.$refs.sexChart)
      this.sexChart.setOption({
        tooltip: {
          trigger: 'item',
          confine: true,
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: { orient: 'vertical', left: 'right' },
        roseType: 'area',
        series: [{
          name: '会员性别',
          type: 'pie',
          label: { show: false },
          labelLine: { show: false },
          data: this.sexChartData
        }]
      }, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-row,
.overview-row {
  margin-bottom: 0;
}

.summary-row .el-col,
.overview-row .el-col,
.distribution-row .el-col {
  margin-bottom: 16px;
}

.member-card-title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.area-card,
.sex-card,
.chart-wrapper {
  position: relative;
}

.area-chart,
.sex-chart {
  width: 100%;
  height: 300px;
}

.chart-empty {
  position: absolute;
  top: 47%;
  left: 0;
  width: 100%;
  color: #909399;
  font-size: 13px;
  text-align: center;
  pointer-events: none;
}

@media (max-width: 992px) {
  .area-chart {
    height: 360px;
  }
}
</style>
