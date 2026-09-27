<template>
  <div class="trade-statistic-value">
    <div class="trade-statistic-value__title">
      <span>{{ title }}</span>
      <el-tooltip
        v-if="tooltip"
        :content="tooltip"
        placement="top-start"
      >
        <i class="el-icon-warning-outline trade-statistic-value__tooltip" />
      </el-tooltip>
    </div>
    <div class="trade-statistic-value__number">{{ formattedValue }}</div>
    <div class="trade-statistic-value__comparison">
      <span class="trade-statistic-value__comparison-label">环比</span>
      <span :class="comparisonClass">
        {{ absolutePercent }}%
        <i :class="comparisonIcon" />
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TradeStatisticValue',
  props: {
    tooltip: { type: String, default: '' },
    title: { type: String, default: '' },
    prefix: { type: String, default: '' },
    value: { type: Number, default: 0 },
    decimals: { type: Number, default: 0 },
    percent: { type: [Number, String], default: 0 }
  },
  computed: {
    numericPercent() {
      const value = Number(this.percent)
      return Number.isFinite(value) ? value : 0
    },
    absolutePercent() {
      return Math.abs(this.numericPercent)
    },
    comparisonClass() {
      return this.numericPercent > 0
        ? 'trade-statistic-value__rate trade-statistic-value__rate--rise'
        : 'trade-statistic-value__rate trade-statistic-value__rate--fall'
    },
    comparisonIcon() {
      return this.numericPercent > 0 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'
    },
    formattedValue() {
      const value = Number(this.value)
      const safeValue = Number.isFinite(value) ? value : 0
      const decimals = Math.max(0, Number(this.decimals) || 0)
      const parts = safeValue.toFixed(decimals).split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return this.prefix + parts.join('.')
    }
  }
}
</script>

<style scoped>
.trade-statistic-value {
  box-sizing: border-box;
  min-height: 142px;
  padding: 22px 24px;
  background: #fafafa;
}

.trade-statistic-value__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
}

.trade-statistic-value__tooltip {
  cursor: help;
}

.trade-statistic-value__number {
  margin: 14px 0 18px;
  color: #303133;
  font-size: 28px;
  line-height: 1;
}

.trade-statistic-value__comparison {
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 13px;
}

.trade-statistic-value__comparison-label {
  color: #909399;
}

.trade-statistic-value__rate--rise {
  color: #f56c6c;
}

.trade-statistic-value__rate--fall {
  color: #67c23a;
}
</style>
