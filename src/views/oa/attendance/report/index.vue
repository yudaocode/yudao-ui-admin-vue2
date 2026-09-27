<template>
  <div class="app-container oa-attendance-report">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="周报" name="week">
          <oa-attendance-week-report />
        </el-tab-pane>
        <el-tab-pane label="月报" name="month" lazy>
          <oa-attendance-month-report />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import OaAttendanceMonthReport from './OaAttendanceMonthReport.vue'
import OaAttendanceWeekReport from './OaAttendanceWeekReport.vue'

export default {
  name: 'OaAttendanceReport',
  components: { OaAttendanceMonthReport, OaAttendanceWeekReport },
  data() {
    return {
      activeTab: 'week'
    }
  }
}
</script>
