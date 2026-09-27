<template>
  <div class="fms-home-metric-cards">
    <div class="metric-heading">
      <div class="metric-title">财务指标</div>
      <div class="metric-period">{{ home ? home.currentMonth : '' }} 当期数据</div>
    </div>

    <div class="metric-card-row">
      <el-button circle :disabled="!canScrollLeft" icon="el-icon-arrow-left" @click="scrollCards(-1)" />
      <div ref="cardScroller" class="metric-card-scroller" @scroll="updateScrollState">
        <button
          v-for="metric in metrics"
          :key="metric.key"
          :class="['metric-card', { 'is-active': selectedMetricKey === metric.key }]"
          type="button"
          @click="$emit('select', metric)"
        >
          <span class="metric-card-name">{{ metric.name }}</span>
          <strong class="metric-card-amount">{{ formatAmount(metric.amount) }}</strong>
        </button>
        <div v-if="metrics.length === 0" class="metric-card-empty">暂无财务指标</div>
      </div>
      <el-button circle :disabled="!canScrollRight" icon="el-icon-arrow-right" @click="scrollCards(1)" />
    </div>
  </div>
</template>

<script>
import { formatAmount } from '@/views/fms/utils/format'

const CARD_SCROLL_OFFSET = 468

export default {
  name: 'FmsHomeMetricCards',
  props: {
    home: { type: Object, default: null },
    selectedMetricKey: { type: String, default: '' }
  },
  data() {
    return { canScrollLeft: false, canScrollRight: false }
  },
  computed: {
    metrics() {
      return this.home && Array.isArray(this.home.metrics) ? this.home.metrics : []
    }
  },
  watch: {
    metrics() {
      this.$nextTick(this.updateScrollState)
    }
  },
  mounted() {
    this.$nextTick(this.updateScrollState)
    window.addEventListener('resize', this.updateScrollState)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScrollState)
  },
  methods: {
    formatAmount,
    updateScrollState() {
      const scroller = this.$refs.cardScroller
      if (!scroller) return
      this.canScrollLeft = scroller.scrollLeft > 1
      this.canScrollRight = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1
    },
    scrollCards(direction) {
      const scroller = this.$refs.cardScroller
      if (!scroller) return
      if (typeof scroller.scrollBy === 'function') {
        scroller.scrollBy({ left: direction * CARD_SCROLL_OFFSET, behavior: 'smooth' })
      } else {
        scroller.scrollLeft += direction * CARD_SCROLL_OFFSET
      }
    }
  }
}
</script>

<style scoped>
.metric-heading { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #ebeef5; }
.metric-title { color: #303133; font-size: 18px; font-weight: 600; }
.metric-period { color: #909399; font-size: 13px; }
.metric-card-row { display: flex; align-items: center; gap: 12px; margin-top: 24px; }
.metric-card-scroller { display: flex; min-width: 0; flex: 1; gap: 14px; padding: 4px 0; overflow-x: auto; scrollbar-width: none; }
.metric-card-scroller::-webkit-scrollbar { display: none; }
.metric-card { width: 220px; height: 108px; flex: none; padding: 0 20px; overflow: hidden; border: 1px solid #ebeef5; border-radius: 6px; background: #fff; color: #303133; text-align: left; box-shadow: 0 2px 8px rgba(15, 23, 42, .06); cursor: pointer; transition: border-color .2s, box-shadow .2s, background .2s; }
.metric-card:hover { border-color: #409eff; }
.metric-card.is-active { border-color: #409eff; background: #409eff; color: #fff; box-shadow: 0 5px 14px rgba(64, 158, 255, .25); }
.metric-card-name, .metric-card-amount { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.metric-card-name { font-size: 15px; font-weight: 600; }
.metric-card-amount { margin-top: 10px; font-size: 22px; }
.metric-card-empty { display: flex; min-width: 220px; align-items: center; justify-content: center; color: #909399; font-size: 13px; }
@media (max-width: 600px) {
  .metric-card-row > .el-button { display: none; }
  .metric-card { width: 190px; }
}
</style>
