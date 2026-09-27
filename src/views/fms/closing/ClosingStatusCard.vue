<template>
  <el-card shadow="never" class="closing-status-card">
    <div class="status-title">{{ title }}</div>
    <div class="status-value">{{ value }}</div>
    <el-tag :type="tagType">{{ tagLabel }}</el-tag>
  </el-card>
</template>

<script>
export default {
  name: 'FmsClosingStatusCard',
  props: {
    title: { type: String, required: true },
    value: { type: String, required: true },
    tagType: {
      type: String,
      required: true,
      validator: value => ['success', 'warning', 'danger', 'info'].includes(value)
    },
    tagLabel: { type: String, required: true }
  }
}
</script>

<style scoped>
.closing-status-card { min-height: 132px; margin-bottom: 16px; }
.status-title { color: #909399; }
.status-value { margin: 12px 0; font-size: 22px; font-weight: 600; }
</style>
