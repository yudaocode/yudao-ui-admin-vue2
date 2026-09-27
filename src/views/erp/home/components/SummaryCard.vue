<template>
  <div class="erp-summary-card">
    <div class="erp-summary-card__title">{{ title }}</div>
    <div class="erp-summary-card__value">￥{{ formatValue(value) }}</div>
  </div>
</template>

<script>
export default {
  name: 'ErpSummaryCard',
  props: {
    title: { type: String, default: '' },
    value: { type: [Number, String], default: 0 }
  },
  methods: {
    formatValue(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(2) : '0.00'
    }
  }
}
</script>

<style scoped>
.erp-summary-card { min-height: 96px; padding: 18px 20px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(15, 23, 42, .04); }
.erp-summary-card__title { color: #909399; font-size: 14px; }
.erp-summary-card__value { margin-top: 12px; color: #303133; font-size: 24px; font-weight: 600; line-height: 30px; }
</style>
