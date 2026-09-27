<template>
  <div class="member-summary-card">
    <div :class="['member-summary-card__icon', iconTone]">
      <i :class="icon" />
    </div>
    <div class="member-summary-card__body">
      <div class="member-summary-card__title">{{ title }}</div>
      <div class="member-summary-card__value">{{ formattedValue }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberSummaryCard',
  props: {
    title: { type: String, default: '' },
    icon: { type: String, default: 'el-icon-user' },
    iconTone: { type: String, default: 'member-summary-card__icon--blue' },
    prefix: { type: String, default: '' },
    value: { type: Number, default: 0 },
    decimals: { type: Number, default: 0 }
  },
  computed: {
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
.member-summary-card {
  display: flex;
  box-sizing: border-box;
  gap: 14px;
  align-items: center;
  min-height: 94px;
  padding: 16px;
  border-radius: 4px;
  background: #fff;
}

.member-summary-card__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 4px;
  font-size: 24px;
}

.member-summary-card__icon--blue {
  color: #409eff;
  background: #ecf5ff;
}

.member-summary-card__icon--purple {
  color: #8b5cf6;
  background: #f3e8ff;
}

.member-summary-card__icon--yellow {
  color: #e6a23c;
  background: #fdf6ec;
}

.member-summary-card__icon--green {
  color: #67c23a;
  background: #f0f9eb;
}

.member-summary-card__body {
  min-width: 0;
}

.member-summary-card__title {
  margin-bottom: 7px;
  color: #909399;
  font-size: 14px;
}

.member-summary-card__value {
  overflow: hidden;
  color: #303133;
  font-size: 26px;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
