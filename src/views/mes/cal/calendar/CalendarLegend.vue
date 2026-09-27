<!-- 排班日历 - 配色图例说明 -->
<template>
  <div class="calendar-legend">
    <span class="legend-title">配色说明：</span>
    <span class="legend-item"><span class="legend-dot day-shift" />白班</span>
    <span class="legend-item"><span class="legend-dot middle-shift" />中班（三班倒）</span>
    <span class="legend-item"><span class="legend-dot night-shift" />中班（两班倒）/ 夜班</span>
    <span class="legend-item"><span class="legend-dot weekend-dot" /><span class="weekend-text">红色日期</span> = 周末</span>
    <span class="legend-item"><el-tag size="mini" effect="dark" type="success">休</el-tag> = 节假日（不显示排班）</span>
  </div>
</template>

<script>
export default { name: 'CalendarLegend' }
</script>

<style scoped>
.calendar-legend { display: flex; flex-wrap: wrap; gap: 4px 16px; align-items: center; padding: 6px 2px; color: #606266; font-size: 12px; }
.legend-title { color: #909399; }
.legend-item { display: flex; gap: 4px; align-items: center; }
.legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
.day-shift { background: #95d475; }
.middle-shift { background: #f0a020; }
.night-shift { background: #909399; }
.weekend-dot { background: rgb(245 108 108 / 60%); }
.weekend-text { color: #f56c6c; }
</style>
