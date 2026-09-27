<!-- 产品分类销售分析 -->
<template>
  <div class="product-category-summary">
    <el-card
      v-loading="loading"
      shadow="never"
    >
      <div
        ref="chart"
        class="category-chart"
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
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="序号"
          align="center"
          type="index"
          width="80"
        />
        <el-table-column
          label="产品分类"
          align="center"
          prop="categoryName"
          min-width="180"
        />
        <el-table-column
          label="合同数量"
          align="center"
          prop="contractCount"
          min-width="120"
        />
        <el-table-column
          label="销售数量"
          align="right"
          prop="productCount"
          min-width="120"
        />
        <el-table-column
          label="销售金额（元）"
          align="right"
          prop="productTotalPrice"
          min-width="160"
          :formatter="erpPriceTableColumnFormatter"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { StatisticsProductApi } from '@/api/crm/statistics/product'
import { erpPriceTableColumnFormatter } from '@/utils'

export default {
  name: 'CrmStatisticsProductCategorySummary',
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
        categoryId: this.queryParams.categoryId,
        productId: this.queryParams.productId,
        times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
      }
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await StatisticsProductApi.getProductCategorySummary(this.getApiParams())).data
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
      const rows = Array.isArray(this.list) ? this.list : []
      this.chart.setOption({
        title: {
          text: '产品分类销量占比',
          left: 'center',
          bottom: 10
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          left: 10,
          top: 20,
          bottom: 20,
          data: rows.map(item => item.categoryName)
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>销售数量：{c}'
        },
        toolbox: {
          feature: {
            saveAsImage: { show: true, name: '产品分类销量占比' }
          }
        },
        series: [{
          name: '销售数量',
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['55%', '48%'],
          data: rows.map(item => ({
            name: item.categoryName,
            value: Number(item.productCount || 0)
          }))
        }]
      }, true)
      this.chart.resize()
    }
  }
}
</script>

<style scoped>
.category-chart {
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
