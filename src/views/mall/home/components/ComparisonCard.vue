<template>
  <div class="comparison-card">
    <div class="comparison-card__header">
      <span>{{ title }}</span>
      <el-tag size="mini">{{ tag }}</el-tag>
    </div>
    <div class="comparison-card__main">
      <count-to
        :start-val="0"
        :end-val="numericValue"
        :duration="1200"
        :prefix="prefix"
        :decimals="decimals"
        class="comparison-card__value"
      />
      <span
        :class="rateClass"
        class="comparison-card__rate"
      >
        {{ absolutePercent }}%
        <i :class="rateIcon" />
      </span>
    </div>
    <el-divider />
    <div class="comparison-card__reference">
      <span>昨日数据</span>
      <span>{{ prefix }}{{ formattedReference }}</span>
    </div>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  name: 'ComparisonCard',
  components: { CountTo },
  props: {
    title: { type: String, required: true },
    tag: { type: String, default: '' },
    prefix: { type: String, default: '' },
    value: { type: Number, required: true },
    reference: { type: Number, required: true },
    decimals: { type: Number, default: 0 }
  },
  computed: {
    numericValue() {
      const value = Number(this.value)
      return Number.isFinite(value) ? value : 0
    },
    numericReference() {
      const value = Number(this.reference)
      return Number.isFinite(value) ? value : 0
    },
    percent() {
      if (!this.numericReference) return 0
      return Number(((100 * (this.numericValue - this.numericReference)) /
        this.numericReference).toFixed(0))
    },
    absolutePercent() {
      return Math.abs(this.percent)
    },
    rateClass() {
      return this.percent > 0 ? 'comparison-card__rate--up' : 'comparison-card__rate--down'
    },
    rateIcon() {
      return this.percent > 0 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'
    },
    formattedReference() {
      return this.decimals > 0
        ? this.numericReference.toFixed(this.decimals)
        : String(Math.round(this.numericReference))
    }
  }
}
</script>

<style lang="scss" scoped>
.comparison-card {
  min-height: 142px;
  padding: 20px 22px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.comparison-card__header,
.comparison-card__main,
.comparison-card__reference {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comparison-card__header,
.comparison-card__reference {
  color: #909399;
  font-size: 14px;
}

.comparison-card__main {
  min-width: 0;
  margin-top: 13px;
}

.comparison-card__value {
  overflow: hidden;
  color: #303133;
  font-size: 28px;
  line-height: 36px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparison-card__rate {
  flex: none;
  margin-left: 8px;
  font-size: 13px;
}

.comparison-card__rate--up {
  color: #f56c6c;
}

.comparison-card__rate--down {
  color: #67c23a;
}

::v-deep .el-divider--horizontal {
  margin: 10px 0 8px;
}

@media (max-width: 768px) {
  .comparison-card {
    min-height: 132px;
    padding: 16px;
  }
}
</style>
