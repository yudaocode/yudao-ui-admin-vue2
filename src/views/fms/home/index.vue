<template>
  <div class="app-container fms-home-page">
    <div class="fms-home-toolbar">
      <div>
        <div class="fms-home-title">财务工作台</div>
        <div class="fms-home-subtitle">财务指标与日常工作入口</div>
      </div>
      <el-select
        v-model="accountSetId"
        clearable
        filterable
        placeholder="请选择账套"
        style="width: 240px; max-width: 100%"
        @change="handleAccountSetChange"
      >
        <el-option
          v-for="item in accountSets"
          :key="item.id"
          :label="item.companyName"
          :value="item.id"
        />
      </el-select>
    </div>

    <template v-if="accountSetId">
      <fms-home-shortcuts :writable="isWritable" />
      <el-card v-loading="loading" class="home-metrics" shadow="never">
        <fms-home-metric-cards
          :home="home"
          :selected-metric-key="selectedMetricKey"
          @select="selectMetric"
        />
        <fms-home-metric-charts
          class="metric-charts"
          :home="home"
          :loading="metricLoading"
          :metric-detail="metricDetail"
          :selected-metric-key="selectedMetricKey"
        />
      </el-card>
    </template>
    <el-empty v-else description="请选择账套" />
  </div>
</template>

<script>
import { getAccountSetList } from '@/api/fms/config/account-set'
import { FmsHomeApi } from '@/api/fms/home'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import FmsHomeMetricCards from './components/FmsHomeMetricCards.vue'
import FmsHomeMetricCharts from './components/FmsHomeMetricCharts.vue'
import FmsHomeShortcuts from './components/FmsHomeShortcuts.vue'

export default {
  name: 'FmsHome',
  components: { FmsHomeMetricCards, FmsHomeMetricCharts, FmsHomeShortcuts },
  data() {
    return {
      accountSets: [],
      accountSetId: readFmsAccountSetId(this.$route),
      loading: false,
      metricLoading: false,
      home: null,
      metricDetail: null,
      selectedMetricKey: '',
      homeRequestSequence: 0,
      metricRequestSequence: 0
    }
  },
  computed: {
    currentAccountSet() {
      return this.accountSets.find(item => Number(item.id) === Number(this.accountSetId)) || null
    },
    isWritable() {
      return !!(this.currentAccountSet && [1, 3].includes(Number(this.currentAccountSet.level)))
    }
  },
  created() {
    this.loadAccountSets()
  },
  methods: {
    loadAccountSets() {
      return getAccountSetList().then(response => {
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized)
        if (!this.accountSetId || !this.accountSets.some(item => Number(item.id) === Number(this.accountSetId))) {
          const preferred = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
          this.accountSetId = preferred ? preferred.id : 0
        }
        if (this.currentAccountSet) saveFmsAccountSet(this.currentAccountSet)
        this.init()
      })
    },
    handleAccountSetChange(id) {
      const current = this.accountSets.find(item => Number(item.id) === Number(id))
      if (current) saveFmsAccountSet(current)
      this.init()
    },
    init() {
      this.homeRequestSequence++
      this.metricRequestSequence++
      this.home = null
      this.metricLoading = false
      this.selectedMetricKey = ''
      this.metricDetail = null
      const accountSetId = Number(this.accountSetId) || 0
      if (!accountSetId) {
        this.loading = false
        return
      }
      this.getHome(accountSetId)
    },
    getHome(accountSetId) {
      const sequence = ++this.homeRequestSequence
      this.loading = true
      return FmsHomeApi.getHome(accountSetId).then(response => {
        if (sequence !== this.homeRequestSequence || accountSetId !== Number(this.accountSetId)) return
        const result = response.data
        this.home = result
        const firstMetric = this.home && this.home.metrics[0]
        if (firstMetric) return this.selectMetric(firstMetric)
      }).finally(() => {
        if (sequence === this.homeRequestSequence) this.loading = false
      })
    },
    selectMetric(metric) {
      const accountSetId = Number(this.accountSetId) || 0
      if (!accountSetId || !metric || !metric.key) return Promise.resolve()
      const sequence = ++this.metricRequestSequence
      this.selectedMetricKey = metric.key
      this.metricDetail = null
      this.metricLoading = true
      return FmsHomeApi.getHomeMetricDetail(accountSetId, metric.key).then(response => {
        if (sequence !== this.metricRequestSequence || accountSetId !== Number(this.accountSetId)) return
        const result = response.data
        this.metricDetail = result
      }).finally(() => {
        if (sequence === this.metricRequestSequence) this.metricLoading = false
      })
    }
  }
}
</script>

<style scoped>
.fms-home-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; padding: 16px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; }
.fms-home-title { color: #303133; font-size: 20px; font-weight: 600; line-height: 28px; }
.fms-home-subtitle { margin-top: 3px; color: #909399; font-size: 13px; }
.home-metrics { margin-top: 16px; }
.metric-charts { margin-top: 28px; }
@media (max-width: 600px) {
  .fms-home-toolbar { align-items: flex-start; flex-direction: column; }
  .fms-home-toolbar .el-select { width: 100% !important; }
}
</style>
