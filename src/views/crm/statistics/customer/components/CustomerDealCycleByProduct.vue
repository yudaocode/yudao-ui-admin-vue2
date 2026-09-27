<!-- 产品客户成交周期分析 -->
<template>
  <div class="customer-deal-cycle-by-product">
    <el-card
      v-loading="loading"
      shadow="never"
      class="chart-card"
    >
      <div
        ref="chart"
        class="customer-chart"
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
      >
        <el-table-column
          label="序号"
          align="center"
          type="index"
          width="80"
        />
        <el-table-column
          label="产品名称"
          align="center"
          prop="productName"
          min-width="180"
        />
        <el-table-column
          label="成交周期(天)"
          align="center"
          prop="customerDealCycle"
          min-width="180"
        />
        <el-table-column
          label="成交客户数"
          align="center"
          prop="customerDealCount"
          min-width="180"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { StatisticsCustomerApi } from '@/api/crm/statistics/customer'

export default {
  name: 'CustomerDealCycleByProduct',
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
    getApiParams() {
      return {
        interval: this.queryParams.interval,
        deptId: this.queryParams.deptId,
        userId: this.queryParams.userId,
        times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
      }
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await StatisticsCustomerApi.getCustomerDealCycleByProduct(this.getApiParams())).data
        if (requestId !== this.requestSequence) return
        this.list = data.map(item => ({
          productName: item.productName || '未知',
          customerDealCycle: item.customerDealCycle,
          customerDealCount: item.customerDealCount
        }))
        this.$nextTick(() => this.renderChart())
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      const rows = Array.isArray(this.list) ? this.list : []
      this.chart.setOption({
        grid: { left: 20, right: 40, bottom: 20, containLabel: true },
        legend: {},
        toolbox: {
          feature: {
            dataZoom: { xAxisIndex: false },
            brush: { type: ['lineX', 'clear'] },
            saveAsImage: { show: true, name: '成交周期分析' }
          }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }},
        xAxis: {
          type: 'category',
          name: '产品名称',
          data: rows.map(item => item.productName)
        },
        yAxis: [
          { type: 'value', name: '成交周期(天)', min: 0, minInterval: 1 },
          {
            type: 'value',
            name: '成交客户数',
            min: 0,
            minInterval: 1,
            splitLine: { lineStyle: { type: 'dotted', opacity: 0.7 }}
          }
        ],
        series: [
          {
            name: '成交周期(天)',
            type: 'bar',
            yAxisIndex: 0,
            data: rows.map(item => Number(item.customerDealCycle || 0))
          },
          {
            name: '成交客户数',
            type: 'bar',
            yAxisIndex: 1,
            data: rows.map(item => Number(item.customerDealCount || 0))
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

.customer-chart {
  width: 100%;
  height: 500px;
}

.table-card {
  margin-top: 16px;
}

.empty-chart {
  position: absolute;
  top: 245px;
  left: 0;
  width: 100%;
  color: #909399;
  text-align: center;
  pointer-events: none;
}
</style>
