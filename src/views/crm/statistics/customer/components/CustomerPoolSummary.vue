<!-- 公海客户分析 -->
<template>
  <div class="customer-pool-summary">
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
        v-if="!loading && chartRows.length === 0"
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
          fixed="left"
        />
        <el-table-column
          label="员工姓名"
          prop="ownerUserName"
          min-width="140"
          fixed="left"
        />
        <el-table-column
          label="进入公海客户数"
          align="right"
          prop="customerPutCount"
          min-width="180"
        />
        <el-table-column
          label="公海领取客户数"
          align="right"
          prop="customerTakeCount"
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
  name: 'CustomerPoolSummary',
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      chartRows: [],
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
      const params = this.getApiParams()
      try {
        const results = await Promise.all([
          StatisticsCustomerApi.getPoolSummaryByDate(params),
          StatisticsCustomerApi.getPoolSummaryByUser(params)
        ])
        if (requestId !== this.requestSequence) return
        this.chartRows = results[0].data
        this.list = results[1].data
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
      const rows = Array.isArray(this.chartRows) ? this.chartRows : []
      this.chart.setOption({
        grid: { left: 20, right: 40, bottom: 20, containLabel: true },
        legend: {},
        toolbox: {
          feature: {
            dataZoom: { xAxisIndex: false },
            brush: { type: ['lineX', 'clear'] },
            saveAsImage: { show: true, name: '公海客户分析' }
          }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }},
        xAxis: {
          type: 'category',
          name: '日期',
          data: rows.map(item => item.time)
        },
        yAxis: [
          { type: 'value', name: '进入公海客户数', min: 0, minInterval: 1 },
          {
            type: 'value',
            name: '公海领取客户数',
            min: 0,
            minInterval: 1,
            splitLine: { lineStyle: { type: 'dotted', opacity: 0.7 }}
          }
        ],
        series: [
          {
            name: '进入公海客户数',
            type: 'bar',
            yAxisIndex: 0,
            data: rows.map(item => Number(item.customerPutCount || 0))
          },
          {
            name: '公海领取客户数',
            type: 'bar',
            yAxisIndex: 1,
            data: rows.map(item => Number(item.customerTakeCount || 0))
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
