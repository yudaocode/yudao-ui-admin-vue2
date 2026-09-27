<template>
  <div class="product-metric-card">
    <div :class="['product-metric-card__icon', iconTone]">
      <i :class="icon" />
    </div>
    <div class="product-metric-card__body">
      <div class="product-metric-card__heading">
        <span>{{ title }}</span>
        <el-tooltip
          v-if="tooltip"
          :content="tooltip"
          placement="top-start"
        >
          <i class="el-icon-warning-outline product-metric-card__help" />
        </el-tooltip>
      </div>
      <div class="product-metric-card__value-row">
        <span class="product-metric-card__value">{{ formattedValue }}</span>
        <span
          v-if="hasPercent"
          :class="[
            'product-metric-card__percent',
            safePercent > 0
              ? 'product-metric-card__percent--up'
              : 'product-metric-card__percent--down'
          ]"
        >
          {{ Math.abs(safePercent) }}%
          <i :class="safePercent > 0 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductMetricCard',
  props: {
    title: { type: String, default: '' },
    tooltip: { type: String, default: '' },
    icon: { type: String, default: 'el-icon-data-analysis' },
    iconTone: { type: String, default: 'product-metric-card__icon--blue' },
    prefix: { type: String, default: '' },
    value: { type: Number, default: 0 },
    decimals: { type: Number, default: 0 },
    percent: { type: [Number, String], default: undefined }
  },
  computed: {
    safePercent() {
      const value = Number(this.percent)
      return Number.isFinite(value) ? value : 0
    },
    hasPercent() {
      return this.percent !== undefined && this.percent !== null
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

<style lang="scss" scoped>
.product-metric-card {
  display: flex;
  box-sizing: border-box;
  gap: 12px;
  align-items: center;
  min-height: 96px;
  padding: 16px;
  border-radius: 4px;
  background: #fff;
}

.product-metric-card__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 4px;
  font-size: 24px;
}

.product-metric-card__icon--blue {
  color: #409eff;
  background: #ecf5ff;
}

.product-metric-card__icon--purple {
  color: #8b5cf6;
  background: #f3e8ff;
}

.product-metric-card__icon--yellow {
  color: #e6a23c;
  background: #fdf6ec;
}

.product-metric-card__icon--green {
  color: #67c23a;
  background: #f0f9eb;
}

.product-metric-card__icon--cyan {
  color: #13c2c2;
  background: #e6fffb;
}

.product-metric-card__body {
  min-width: 0;
}

.product-metric-card__heading {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-bottom: 7px;
  color: #909399;
  font-size: 14px;
}

.product-metric-card__help {
  color: #c0c4cc;
  cursor: help;
}

.product-metric-card__value-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
  min-width: 0;
}

.product-metric-card__value {
  overflow: hidden;
  color: #303133;
  font-size: 26px;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-metric-card__percent {
  flex: none;
  font-size: 12px;
}

.product-metric-card__percent--up {
  color: #f56c6c;
}

.product-metric-card__percent--down {
  color: #67c23a;
}
</style>
