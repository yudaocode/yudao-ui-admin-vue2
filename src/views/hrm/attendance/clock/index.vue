<template>
  <div class="app-container hrm-attendance-clock">
    <doc-alert title="【考勤】考勤管理" url="https://doc.iocoder.cn/hrm/attendance/" />
    <el-tabs v-model="activeTab">
      <el-tab-pane label="打卡概况" name="overview" lazy>
        <AttendanceClockOverview />
      </el-tab-pane>
      <el-tab-pane label="打卡明细" name="record" lazy>
        <AttendanceClockRecordList />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AttendanceClockOverview from './AttendanceClockOverview.vue'
import AttendanceClockRecordList from './AttendanceClockRecordList.vue'

export default {
  name: 'HrmAttendanceClock',
  components: { AttendanceClockOverview, AttendanceClockRecordList },
  data() {
    return { activeTab: 'overview' }
  }
}
</script>
