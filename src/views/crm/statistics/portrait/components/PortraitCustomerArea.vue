<!-- 客户城市分布 -->
<template>
  <el-card
    v-loading="loading"
    shadow="never"
    class="portrait-area-card"
  >
    <el-row :gutter="20">
      <el-col
        :xs="24"
        :lg="12"
      >
        <div
          ref="customerChart"
          class="portrait-chart"
        />
      </el-col>
      <el-col
        :xs="24"
        :lg="12"
      >
        <div
          ref="dealChart"
          class="portrait-chart"
        />
      </el-col>
    </el-row>
    <div
      v-if="!loading && areaStatisticsList.length === 0"
      class="empty-chart"
    >
      暂无统计数据
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import china from './china.json'
import { StatisticsPortraitApi } from '@/api/crm/statistics/portrait'

echarts.registerMap('china', china)

function areaReplace(areaName) {
  if (!areaName) return areaName
  return areaName
    .replace('维吾尔自治区', '')
    .replace('壮族自治区', '')
    .replace('回族自治区', '')
    .replace('特别行政区', '')
    .replace('自治区', '')
    .replace('省', '')
    .replace('市', '')
}

function normalizeAreaRows(rows) {
  const result = []
  const indexByName = Object.create(null)
  rows.forEach(item => {
    const areaName = areaReplace(item.areaName) || '未知'
    const existingIndex = indexByName[areaName]
    if (existingIndex !== undefined) {
      result[existingIndex].customerCount += Number(item.customerCount || 0)
      result[existingIndex].dealCount += Number(item.dealCount || 0)
      return
    }
    indexByName[areaName] = result.length
    result.push(Object.assign({}, item, {
      areaName,
      customerCount: Number(item.customerCount || 0),
      dealCount: Number(item.dealCount || 0)
    }))
  })
  return result
}

function buildMapData(rows, countField) {
  let min = 0
  let max = 0
  const data = rows.map(item => {
    const value = Number(item[countField] || 0)
    min = Math.min(min, value)
    max = Math.max(max, value)
    return Object.assign({}, item, {
      name: item.areaName,
      value
    })
  })
  return { data, min, max }
}

function createMapOption(title, mapData) {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      transitionDuration: 0.2
    },
    visualMap: {
      text: ['高', '低'],
      realtime: false,
      calculable: true,
      top: 'middle',
      min: mapData.min,
      max: mapData.max,
      inRange: {
        color: ['#fff', '#3b82f6']
      }
    },
    series: [{
      name: '客户地域分布',
      type: 'map',
      map: 'china',
      roam: false,
      selectedMode: false,
      data: mapData.data
    }]
  }
}

export default {
  name: 'PortraitCustomerArea',
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      areaStatisticsList: [],
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
        const data = (await StatisticsPortraitApi.getCustomerArea(this.getApiParams())).data
        if (requestId !== this.requestSequence) return
        const rows = data
        this.areaStatisticsList = normalizeAreaRows(rows)
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
      const customerData = buildMapData(this.areaStatisticsList, 'customerCount')
      const dealData = buildMapData(this.areaStatisticsList, 'dealCount')
      this.customerChart.setOption(createMapOption('全部客户', customerData), true)
      this.dealChart.setOption(createMapOption('成交客户', dealData), true)
      this.resizeCharts()
    }
  }
}
</script>

<style scoped>
.portrait-area-card {
  position: relative;
}

.portrait-chart {
  width: 100%;
  height: 500px;
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
