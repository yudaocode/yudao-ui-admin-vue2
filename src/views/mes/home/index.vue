<template>
  <div
    v-loading="loading"
    class="app-container mes-home"
  >
    <doc-alert
      title="MES 手册（功能开启）"
      url="https://doc.iocoder.cn/mes/build/"
    />

    <home-kpi-cards
      :summary="summary"
      @navigate="handleNavigate"
    />

    <el-row
      :gutter="16"
      class="mes-home__row"
    >
      <el-col
        :xl="16"
        :lg="16"
        :md="24"
        :sm="24"
        :xs="24"
      >
        <home-production-trend />
      </el-col>
      <el-col
        :xl="8"
        :lg="8"
        :md="24"
        :sm="24"
        :xs="24"
      >
        <home-alert-panel
          :summary="summary"
          @navigate="handleNavigate"
        />
      </el-col>
    </el-row>

    <el-row
      :gutter="16"
      class="mes-home__row"
    >
      <el-col
        :xl="12"
        :lg="12"
        :md="24"
        :sm="24"
        :xs="24"
      >
        <home-work-order-chart />
      </el-col>
      <el-col
        :xl="12"
        :lg="12"
        :md="24"
        :sm="24"
        :xs="24"
      >
        <home-shortcuts @navigate="handleNavigate" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { MesHomeStatisticsApi } from '@/api/mes/home'
import HomeAlertPanel from './HomeAlertPanel.vue'
import HomeKpiCards from './HomeKpiCards.vue'
import HomeProductionTrend from './HomeProductionTrend.vue'
import HomeShortcuts from './HomeShortcuts.vue'
import HomeWorkOrderChart from './HomeWorkOrderChart.vue'

const createSummary = () => ({
  workOrderActiveCount: 0,
  workOrderPrepareCount: 0,
  workOrderFinishedCount: 0,
  todayOutput: 0,
  yesterdayOutput: 0,
  todayQualifiedQuantity: 0,
  todayUnqualifiedQuantity: 0,
  machineryTotal: 0,
  machineryProducing: 0,
  machineryStop: 0,
  machineryMaintenance: 0,
  andonActiveCount: 0,
  repairActiveCount: 0
})

export default {
  name: 'MesHome',
  components: {
    HomeAlertPanel,
    HomeKpiCards,
    HomeProductionTrend,
    HomeShortcuts,
    HomeWorkOrderChart
  },
  data() {
    return {
      loading: false,
      summary: createSummary()
    }
  },
  mounted() {
    this.loadSummary()
  },
  methods: {
    loadSummary() {
      this.loading = true
      return MesHomeStatisticsApi.getHomeSummary().then((response) => {
        this.summary = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    handleNavigate(name) {
      return this.$router.push({ name }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.mes-home__row { margin-bottom: 16px; }
.mes-home__row > .el-col { margin-bottom: 16px; }
</style>
