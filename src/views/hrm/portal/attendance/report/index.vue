<template>
  <div v-if="accessible">
    <el-card shadow="never">
      <div slot="header">考勤报表</div>
      <div class="report-toolbar">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          format="yyyy年MM月"
          :clearable="false"
          :picker-options="monthPickerOptions"
          @change="handleMonthChange"
        />
        <span class="attendance-cycle">考勤周期（{{ attendanceCycle }}）</span>
        <el-button
          v-hasPermi="['hrm:portal:attendance:leave']"
          type="primary"
          @click="openLeaveForm"
        >
          <i class="el-icon-plus" /> 请假申请
        </el-button>
        <el-button
          type="primary"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <i class="el-icon-download" /> 导出考勤
        </el-button>
      </div>
      <div class="summary-grid">
        <div
          v-for="(item, index) in summaryItems"
          :key="item.label"
          class="summary-item"
          :class="index < summaryItems.length - 1 ? 'with-border' : ''"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.unit }}</small>
        </div>
      </div>
      <AttendanceCalendar
        :selected-month="selectedMonth"
        :calendar-date="calendarDate"
        :loading="loading"
        :daily-details="monthDetail ? monthDetail.dailyDetails : undefined"
      />
      <AttendanceLeaveList
        ref="leaveListRef"
        @changed="loadData"
      />
    </el-card>
  </div>
</template>

<script>
import download from '@/plugins/download'
import { formatDate } from '@/utils/formatTime'
import { exportAttendanceMonthDetail, getAttendanceMonthDetail } from '@/api/hrm/portal/attendance/statistics'
import { checkHrmPortalAccess } from '@/views/hrm/portal/utils/access'
import { formatHrmDays } from '@/views/hrm/utils/format'
import AttendanceCalendar from './AttendanceCalendar.vue'
import AttendanceLeaveList from './AttendanceLeaveList.vue'

function startOfMonth(value) {
  const date = new Date(value)
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

function routeMonth(value) {
  if (!value || !/^\d{4}-\d{1,2}/.test(String(value))) return new Date()
  const date = new Date(String(value) + (String(value).length <= 7 ? '-01T00:00:00' : ''))
  return Number.isNaN(date.getTime()) ? new Date() : startOfMonth(date)
}

export default {
  name: 'HrmPortalAttendanceReport',
  components: { AttendanceCalendar, AttendanceLeaveList },
  data() {
    const selectedMonth = routeMonth(this.$route.query.month)
    return {
      accessible: false,
      loading: false,
      exportLoading: false,
      selectedMonth,
      calendarDate: selectedMonth,
      monthDetail: undefined,
      monthPickerOptions: {
        disabledDate: date => startOfMonth(date).getTime() > startOfMonth(new Date()).getTime()
      }
    }
  },
  computed: {
    attendanceCycle() {
      const end = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0)
      return `${formatDate(this.selectedMonth, 'MM')}月01日~${formatDate(this.selectedMonth, 'MM')}月${formatDate(end, 'DD')}日`
    },
    summaryItems() {
      const summary = this.monthDetail && this.monthDetail.summary ? this.monthDetail.summary : {}
      return [
        { label: '应出勤天数', value: summary.attendDays === undefined ? 0 : summary.attendDays, unit: '天' },
        { label: '实际出勤天数', value: formatHrmDays(summary.actualDays), unit: '天' },
        { label: '迟到', value: summary.lateCount === undefined ? 0 : summary.lateCount, unit: '次' },
        { label: '早退', value: summary.earlyCount === undefined ? 0 : summary.earlyCount, unit: '次' },
        { label: '缺卡', value: summary.misscardCount === undefined ? 0 : summary.misscardCount, unit: '次' }
      ]
    }
  },
  async activated() {
    this.accessible = await checkHrmPortalAccess(this.$router)
    if (!this.accessible) return
    await this.$nextTick()
    await Promise.all([this.loadData(), this.$refs.leaveListRef && this.$refs.leaveListRef.refresh()])
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const response = await getAttendanceMonthDetail(
          this.selectedMonth.getFullYear(),
          this.selectedMonth.getMonth() + 1
        )
        this.monthDetail = response.data
      } finally {
        this.loading = false
      }
    },
    handleMonthChange(value) {
      this.selectedMonth = startOfMonth(value)
      this.calendarDate = startOfMonth(value)
      return this.loadData()
    },
    openLeaveForm() {
      this.$refs.leaveListRef.openCreate()
    },
    async handleExport() {
      this.exportLoading = true
      try {
        const data = await exportAttendanceMonthDetail(
          this.selectedMonth.getFullYear(),
          this.selectedMonth.getMonth() + 1
        )
        download.excel(data, `${formatDate(this.selectedMonth, 'YYYY年MM月')}个人考勤日报.xls`)
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped>
.report-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.attendance-cycle { color: #606266; font-size: 14px; }
.summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); margin-bottom: 16px; border: 1px solid #ebeef5; border-radius: 4px; }
.summary-item { min-height: 80px; padding: 14px 18px; }
.summary-item.with-border { border-right: 1px solid #ebeef5; }
.summary-item span { display: block; margin-bottom: 6px; color: #909399; font-size: 13px; }
.summary-item strong { color: #303133; font-size: 24px; font-weight: 500; }
.summary-item small { margin-left: 4px; color: #909399; }
</style>
