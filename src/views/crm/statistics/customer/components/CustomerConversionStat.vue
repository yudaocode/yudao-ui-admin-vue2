<!-- 客户转化率分析 -->
<template>
  <div class="customer-conversion-stat">
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
          label="客户名称"
          align="center"
          prop="customerName"
          min-width="180"
          fixed="left"
        />
        <el-table-column
          label="合同名称"
          align="center"
          prop="contractName"
          min-width="180"
        />
        <el-table-column
          label="合同总金额"
          align="right"
          prop="totalPrice"
          min-width="150"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="回款金额"
          align="right"
          prop="receivablePrice"
          min-width="150"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="客户来源"
          align="center"
          prop="source"
          width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_SOURCE"
              :value="scope.row.source"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="客户行业"
          align="center"
          prop="industryId"
          width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_INDUSTRY"
              :value="scope.row.industryId"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="负责人"
          align="center"
          prop="ownerUserName"
          min-width="120"
        />
        <el-table-column
          label="创建人"
          align="center"
          prop="creatorUserName"
          min-width="120"
        />
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          min-width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="下单日期"
          align="center"
          prop="orderDate"
          min-width="180"
          fixed="right"
          :formatter="dateFormatter"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { StatisticsCustomerApi } from '@/api/crm/statistics/customer'
import { dateFormatter, erpPriceTableColumnFormatter } from '@/utils'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'CustomerConversionStat',
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      DICT_TYPE,
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
    dateFormatter,
    erpPriceTableColumnFormatter,
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
          StatisticsCustomerApi.getCustomerSummaryByDate(params),
          StatisticsCustomerApi.getContractSummary(params)
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
            saveAsImage: { show: true, name: '客户转化率分析' }
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          valueFormatter: value => value + '%'
        },
        xAxis: {
          type: 'category',
          name: '日期',
          data: rows.map(item => item.time)
        },
        yAxis: {
          type: 'value',
          name: '转化率(%)',
          min: 0
        },
        series: [{
          name: '客户转化率',
          type: 'line',
          data: rows.map(item => {
            const customerCreateCount = Number(item.customerCreateCount || 0)
            return customerCreateCount
              ? Number((Number(item.customerDealCount || 0) / customerCreateCount * 100).toFixed(2))
              : 0
          })
        }]
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
