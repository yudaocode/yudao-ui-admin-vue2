<!-- 合同汇总表 -->
<template>
  <div class="performance-analysis contract-summary">
    <el-card
      v-loading="loading"
      shadow="never"
      class="chart-card"
    >
      <div
        ref="chart"
        class="performance-chart"
      />
      <div
        v-if="!loading && list.length === 0"
        class="empty-chart"
      >暂无统计数据</div>
    </el-card>

    <el-card
      shadow="never"
      class="table-card"
    >
      <el-table
        v-loading="loading"
        :data="list"
        border
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column
          label="月份"
          align="center"
          prop="time"
          min-width="120"
        />
        <el-table-column
          label="合同数量"
          align="center"
          prop="contractCount"
          min-width="120"
        />
        <el-table-column
          label="合同金额（元）"
          align="right"
          prop="contractPrice"
          min-width="160"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="回款金额（元）"
          align="right"
          prop="receivablePrice"
          min-width="160"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="未回款金额（元）"
          align="right"
          prop="unreceivedPrice"
          min-width="160"
          :formatter="erpPriceTableColumnFormatter"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { StatisticsPerformanceApi } from '@/api/crm/statistics/performance'
import {
  erpPriceInputFormatter,
  erpPriceTableColumnFormatter
} from '@/utils'

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default {
  name: 'ContractSummary',
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      chart: null,
      requestSequence: 0
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
    erpPriceTableColumnFormatter,
    getApiParams() {
      return {
        deptId: this.queryParams.deptId,
        userId: this.queryParams.userId,
        times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
      }
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await StatisticsPerformanceApi.getContractSummary(this.getApiParams())).data
        if (requestId !== this.requestSequence) return
        this.list = data
        this.$nextTick(() => this.renderChart())
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        const total = data.reduce((sum, item) => sum + toNumber(item[column.property]), 0)
        if (column.property === 'contractCount') return String(total)
        if (
          column.property === 'contractPrice' ||
          column.property === 'receivablePrice' ||
          column.property === 'unreceivedPrice'
        ) return erpPriceInputFormatter(total)
        return ''
      })
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      const rows = Array.isArray(this.list) ? this.list : []
      this.chart.setOption({
        grid: {
          left: 20,
          right: 40,
          bottom: 72,
          containLabel: true
        },
        legend: {
          bottom: 8
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        toolbox: {
          feature: {
            dataZoom: {
              xAxisIndex: false
            },
            brush: {
              type: ['lineX', 'clear']
            },
            saveAsImage: {
              show: true,
              name: '合同汇总表'
            }
          }
        },
        xAxis: {
          type: 'category',
          name: '月份',
          data: rows.map(item => item.time)
        },
        yAxis: {
          type: 'value',
          name: '金额（元）'
        },
        series: [
          {
            name: '合同金额（元）',
            type: 'bar',
            data: rows.map(item => toNumber(item.contractPrice))
          },
          {
            name: '回款金额（元）',
            type: 'bar',
            data: rows.map(item => toNumber(item.receivablePrice))
          },
          {
            name: '未回款金额（元）',
            type: 'line',
            data: rows.map(item => toNumber(item.unreceivedPrice))
          }
        ]
      }, true)
      this.resizeChart()
    }
  }
}
</script>

<style scoped>
.chart-card {
  position: relative;
}

.performance-chart {
  width: 100%;
  height: 500px;
}

.empty-chart {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  color: #909399;
  text-align: center;
  pointer-events: none;
}

.table-card {
  margin-top: 16px;
}
</style>
