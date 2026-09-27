<!-- 销售漏斗分析 -->
<template>
  <div class="funnel-business">
    <el-card
      v-loading="loading"
      shadow="never"
    >
      <el-button-group class="view-switch">
        <el-button
          :type="active ? 'primary' : 'default'"
          @click="handleActive(true)"
        >
          阶段视角
        </el-button>
        <el-button
          :type="active ? 'default' : 'primary'"
          @click="handleActive(false)"
        >
          金额视角
        </el-button>
      </el-button-group>
      <div
        ref="chart"
        class="funnel-chart"
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
          align="center"
          label="序号"
          type="index"
          width="80"
        />
        <el-table-column
          align="center"
          label="阶段"
          prop="statusName"
          min-width="160"
        />
        <el-table-column
          align="center"
          label="赢单率"
          prop="statusPercent"
          min-width="120"
        >
          <template slot-scope="scope">{{ scope.row.statusPercent || 0 }}%</template>
        </el-table-column>
        <el-table-column
          align="center"
          label="商机数"
          prop="businessCount"
          min-width="160"
        />
        <el-table-column
          align="right"
          label="商机总金额（元）"
          prop="totalPrice"
          min-width="200"
          :formatter="erpPriceTableColumnFormatter"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { StatisticFunnelApi } from '@/api/crm/statistics/funnel'
import { erpPriceInputFormatter, erpPriceTableColumnFormatter } from '@/utils'

export default {
  name: 'FunnelBusiness',
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      active: true,
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
        interval: this.queryParams.interval,
        deptId: this.queryParams.deptId,
        userId: this.queryParams.userId,
        statusTypeId: this.queryParams.statusTypeId,
        times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
      }
    },
    handleActive(value) {
      this.active = value
      this.renderChart()
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await StatisticFunnelApi.getBusinessSummaryByStatus(this.getApiParams())).data
        if (requestId !== this.requestSequence) return
        this.list = data
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
      const chartData = this.list.map(item => ({
        value: this.active ? Number(item.businessCount || 0) : Number(item.totalPrice || 0),
        name: item.statusName + '-' + (item.businessCount || 0) + '个',
        statusName: item.statusName,
        statusPercent: item.statusPercent,
        businessCount: item.businessCount,
        totalPrice: item.totalPrice
      }))
      const maxValue = Math.max.apply(null, chartData.map(item => Number(item.value || 0)).concat(1))
      this.chart.setOption({
        title: { text: '销售漏斗' },
        tooltip: {
          trigger: 'item',
          formatter(params) {
            const data = params.data || {}
            return [
              data.statusName || params.name,
              '商机数：' + (data.businessCount || 0) + ' 个',
              '商机金额：' + erpPriceInputFormatter(data.totalPrice || 0) + ' 元',
              '赢单率：' + (data.statusPercent || 0) + '%'
            ].join('<br/>')
          }
        },
        toolbox: {
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        legend: { data: chartData.map(item => item.name) },
        series: [{
          name: '销售漏斗',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: maxValue,
          minSize: '0%',
          maxSize: '100%',
          sort: 'none',
          gap: 2,
          label: { show: true, position: 'inside' },
          labelLine: { length: 10, lineStyle: { width: 1, type: 'solid' }},
          itemStyle: { borderColor: '#fff', borderWidth: 1 },
          emphasis: { label: { fontSize: 20 }},
          data: chartData
        }]
      }, true)
      this.chart.resize()
    }
  }
}
</script>

<style scoped>
.view-switch {
  margin-bottom: 10px;
}

.funnel-chart {
  width: 100%;
  height: 500px;
}

.table-card {
  margin-top: 16px;
}

.empty-chart {
  margin-top: -275px;
  height: 275px;
  color: #909399;
  text-align: center;
  pointer-events: none;
}
</style>
