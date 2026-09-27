<template>
  <div
    v-loading="loading"
    class="app-container erp-home"
  >
    <doc-alert
      title="ERP 手册（功能开启）"
      url="https://doc.iocoder.cn/erp/build/"
    />
    <div class="erp-home__header">
      <div>
        <div class="erp-home__title">ERP 首页</div>
        <div class="erp-home__subtitle">销售 / 采购全局统计</div>
      </div>
      <el-button
        icon="el-icon-refresh"
        :loading="loading"
        @click="loadStatistics"
      >刷新</el-button>
    </div>
    <el-row
      :gutter="16"
      class="erp-home__row"
    >
      <el-col
        v-for="card in summaryCards"
        :key="card.title"
        :md="6"
        :sm="12"
        :xs="24"
      >
        <summary-card
          :title="card.title"
          :value="card.value"
        />
      </el-col>
    </el-row>
    <el-row
      :gutter="16"
      class="erp-home__row"
    >
      <el-col
        :md="12"
        :sm="12"
        :xs="24"
      >
        <time-summary-chart
          title="销售统计"
          :value="saleTimeSummaryList"
        />
      </el-col>
      <el-col
        :md="12"
        :sm="12"
        :xs="24"
      >
        <time-summary-chart
          title="采购统计"
          :value="purchaseTimeSummaryList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { SaleStatisticsApi } from '@/api/erp/statistics/sale'
import { PurchaseStatisticsApi } from '@/api/erp/statistics/purchase'
import SummaryCard from './components/SummaryCard.vue'
import TimeSummaryChart from './components/TimeSummaryChart.vue'

export default {
  name: 'ErpHome',
  components: { SummaryCard, TimeSummaryChart },
  data() {
    return {
      loading: false,
      saleSummary: {},
      purchaseSummary: {},
      saleTimeSummaryList: [],
      purchaseTimeSummaryList: []
    }
  },
  computed: {
    summaryCards() {
      return [
        { title: '今日销售', value: this.saleSummary.todayPrice },
        { title: '昨日销售', value: this.saleSummary.yesterdayPrice },
        { title: '今日采购', value: this.purchaseSummary.todayPrice },
        { title: '昨日采购', value: this.purchaseSummary.yesterdayPrice },
        { title: '本月销售', value: this.saleSummary.monthPrice },
        { title: '今年销售', value: this.saleSummary.yearPrice },
        { title: '本月采购', value: this.purchaseSummary.monthPrice },
        { title: '今年采购', value: this.purchaseSummary.yearPrice }
      ]
    }
  },
  mounted() { this.loadStatistics() },
  methods: {
    loadStatistics() {
      this.loading = true
      return Promise.all([
        SaleStatisticsApi.getSaleSummary(),
        SaleStatisticsApi.getSaleTimeSummary(),
        PurchaseStatisticsApi.getPurchaseSummary(),
        PurchaseStatisticsApi.getPurchaseTimeSummary()
      ]).then(([saleSummary, saleTimeSummary, purchaseSummary, purchaseTimeSummary]) => {
        this.saleSummary = saleSummary.data
        this.saleTimeSummaryList = saleTimeSummary.data
        this.purchaseSummary = purchaseSummary.data
        this.purchaseTimeSummaryList = purchaseTimeSummary.data
      }).finally(() => { this.loading = false })
    }
  }
}
</script>

<style scoped>
.erp-home__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 16px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; }
.erp-home__title { color: #303133; font-size: 20px; font-weight: 600; line-height: 28px; }
.erp-home__subtitle { color: #909399; font-size: 13px; }
.erp-home__row { margin-bottom: 16px; }
.erp-home__row > .el-col { margin-bottom: 16px; }
</style>
