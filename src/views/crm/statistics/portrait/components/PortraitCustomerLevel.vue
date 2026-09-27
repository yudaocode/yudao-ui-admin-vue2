<!-- 客户级别分析 -->
<template>
  <div class="portrait-customer-level">
    <el-card
      v-loading="loading"
      shadow="never"
      class="chart-card"
    >
      <el-row :gutter="20">
        <el-col
          :xs="24"
          :lg="12"
        ><div
          ref="customerChart"
          class="portrait-chart"
        /></el-col>
        <el-col
          :xs="24"
          :lg="12"
        ><div
          ref="dealChart"
          class="portrait-chart"
        /></el-col>
      </el-row>
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
          label="客户级别"
          prop="level"
          width="200"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_LEVEL"
              :value="scope.row.level"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="客户个数"
          prop="customerCount"
          min-width="160"
        />
        <el-table-column
          align="center"
          label="成交个数"
          prop="dealCount"
          min-width="160"
        />
        <el-table-column
          align="center"
          label="级别占比(%)"
          prop="levelPortion"
          min-width="160"
        />
        <el-table-column
          align="center"
          label="成交占比(%)"
          prop="dealPortion"
          min-width="160"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { StatisticsPortraitApi } from '@/api/crm/statistics/portrait'
import { DICT_TYPE, getDictDataLabel } from '@/utils/dict'
import { erpCalculatePercentage, getSumValue } from '@/utils'

function getLabel(dictType, value) {
  return getDictDataLabel(dictType, value) || '未知'
}

function createPieOption(title, rows, countField) {
  return {
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    toolbox: {
      feature: {
        saveAsImage: { show: true, name: title }
      }
    },
    series: [{
      name: title,
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 40, fontWeight: 'bold' }
      },
      labelLine: { show: false },
      data: rows.map(item => ({
        name: getLabel(DICT_TYPE.CRM_CUSTOMER_LEVEL, item.level),
        value: Number(item[countField] || 0)
      }))
    }]
  }
}

function calculateProportion(rows) {
  const sumCustomerCount = getSumValue(rows.map(item => item.customerCount))
  const sumDealCount = getSumValue(rows.map(item => item.dealCount))
  rows.forEach(item => {
    const customerCount = Number(item.customerCount || 0)
    const dealCount = Number(item.dealCount || 0)
    item.levelPortion = customerCount === 0
      ? 0
      : erpCalculatePercentage(customerCount, sumCustomerCount)
    item.dealPortion = dealCount === 0
      ? 0
      : erpCalculatePercentage(dealCount, sumDealCount)
  })
}

export default {
  name: 'PortraitCustomerLevel',
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
      list: [],
      customerChart: null,
      dealChart: null,
      requestSequence: 0
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    this.requestSequence += 1
    window.removeEventListener('resize', this.resizeCharts)
    if (this.customerChart) this.customerChart.dispose()
    if (this.dealChart) this.dealChart.dispose()
    this.customerChart = null
    this.dealChart = null
  },
  methods: {
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
        const data = (await StatisticsPortraitApi.getCustomerLevel(this.getApiParams())).data
        if (requestId !== this.requestSequence) return
        const rows = data.map(item => Object.assign({}, item))
        calculateProportion(rows)
        this.list = rows
        this.$nextTick(() => this.renderCharts())
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    resizeCharts() {
      if (this.customerChart) this.customerChart.resize()
      if (this.dealChart) this.dealChart.resize()
    },
    renderCharts() {
      if (!this.$refs.customerChart || !this.$refs.dealChart) return
      if (!this.customerChart) this.customerChart = echarts.init(this.$refs.customerChart)
      if (!this.dealChart) this.dealChart = echarts.init(this.$refs.dealChart)
      this.customerChart.setOption(createPieOption('全部客户', this.list, 'customerCount'), true)
      this.dealChart.setOption(createPieOption('成交客户', this.list, 'dealCount'), true)
      this.resizeCharts()
    }
  }
}
</script>

<style scoped>
.chart-card {
  position: relative;
}

.portrait-chart {
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
