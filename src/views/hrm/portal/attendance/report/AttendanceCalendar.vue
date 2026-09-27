<template>
  <div class="attendance-calendar-wrap">
    <div class="calendar-header">
      <span>{{ formatDate(selectedMonth, 'YYYY年MM月') }}考勤明细</span>
      <div class="calendar-legend">
        <span><i class="dot dot-normal" />正常</span>
        <span><i class="dot dot-abnormal" />异常</span>
        <span><i class="dot dot-rest" />休息</span>
      </div>
    </div>
    <el-calendar
      v-loading="loading"
      :value="calendarDate"
      class="attendance-calendar"
    >
      <template
        slot="dateCell"
        slot-scope="{ data }"
      >
        <div
          class="calendar-cell"
          :class="[data.type !== 'current-month' ? 'is-other-month' : '', getDayStatusClass(getDailyDetail(data.day))]"
        >
          <div class="calendar-day-head">
            <span>{{ Number(data.day.slice(-2)) }}</span>
            <el-tag
              v-if="data.type === 'current-month' && getAttendanceResult(data.day)"
              :type="getDayTagType(getDailyDetail(data.day))"
              size="mini"
              effect="plain"
            >{{ getAttendanceResult(data.day) }}</el-tag>
          </div>
          <template v-if="data.type === 'current-month'">
            <div
              v-for="clock in getClockList(data.day)"
              :key="clock.id || clock.type + '-' + clock.clockTime"
              class="clock-row"
            >
              <span>{{ clock.type === 2 ? '下班' : '上班' }}</span>
              <strong>{{ formatDate(clock.clockTime, 'HH:mm') || '--:--' }}</strong>
              <em :class="clock.status ? 'clock-abnormal' : ''">{{ getClockStatusName(clock.status) }}</em>
            </div>
            <div
              v-if="getDailyBadges(getDailyDetail(data.day)).length"
              class="daily-badges"
            >
              <el-tag
                v-for="badge in getDailyBadges(getDailyDetail(data.day))"
                :key="badge"
                size="mini"
                effect="plain"
              >{{ badge }}</el-tag>
            </div>
            <div
              v-if="getDailyDetail(data.day) && !getClockList(data.day).length"
              class="no-clock"
            >
              暂无打卡
            </div>
          </template>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script>
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'HrmPortalAttendanceCalendar',
  props: {
    selectedMonth: { type: Date, required: true },
    calendarDate: { type: Date, required: true },
    loading: { type: Boolean, required: true },
    dailyDetails: { type: Array, default: () => [] }
  },
  computed: {
    dailyDetailMap() {
      return new Map(this.dailyDetails.map(detail => [
        formatDate(detail.attendanceTime, 'YYYY-MM-DD'),
        detail
      ]))
    }
  },
  methods: {
    formatDate,
    getDailyDetail(date) {
      return this.dailyDetailMap.get(date)
    },
    getAttendanceResult(date) {
      const detail = this.getDailyDetail(date)
      return detail && detail.attendanceResult
    },
    getClockList(date) {
      const detail = this.getDailyDetail(date)
      return detail && detail.clockList ? detail.clockList : []
    },
    isAbnormal(detail) {
      return Boolean(detail && (
        Number(detail.lateCount || 0) > 0 ||
        Number(detail.earlyCount || 0) > 0 ||
        Number(detail.misscardCount || 0) > 0 ||
        detail.absenteeism === true
      ))
    },
    getDayStatusClass(detail) {
      if (!detail) return ''
      if (this.isAbnormal(detail)) return 'is-abnormal'
      if (detail.scheduled === false) return 'is-rest'
      return detail.clockList && detail.clockList.length ? 'is-normal' : ''
    },
    getDayTagType(detail) {
      if (this.isAbnormal(detail)) return 'danger'
      if (detail && detail.scheduled === false) return 'info'
      return 'success'
    },
    getClockStatusName(status) {
      return ['正常', '迟到', '早退', '缺卡'][status === null || status === undefined ? 0 : status] || '未知'
    },
    getDailyBadges(detail) {
      if (!detail) return []
      return Number(detail.leaveDays || 0) > 0 ? [`请假${detail.leaveDays}天`] : []
    }
  }
}
</script>

<style scoped>
.attendance-calendar-wrap { border: 1px solid #ebeef5; }
.calendar-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; font-size: 15px; font-weight: 600; }
.calendar-legend { display: flex; gap: 16px; color: #909399; font-size: 12px; font-weight: 400; }
.calendar-legend span { display: flex; align-items: center; gap: 5px; }
.dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; }
.dot-normal { background: #67c23a; }
.dot-abnormal { background: #f56c6c; }
.dot-rest { background: #909399; }
.attendance-calendar /deep/ .el-calendar__header { display: none; }
.attendance-calendar /deep/ .el-calendar__body { padding: 0; }
.attendance-calendar /deep/ .el-calendar-table .el-calendar-day { height: 132px; padding: 0; }
.calendar-cell { box-sizing: border-box; height: 100%; padding: 9px 10px; border-top: 2px solid transparent; }
.calendar-cell.is-normal { border-top-color: #67c23a; }
.calendar-cell.is-abnormal { border-top-color: #f56c6c; }
.calendar-cell.is-rest { border-top-color: #c0c4cc; }
.calendar-cell.is-other-month { color: #c0c4cc; background: #f5f7fa; }
.calendar-day-head, .clock-row { display: flex; align-items: center; justify-content: space-between; }
.calendar-day-head { margin-bottom: 8px; font-weight: 600; }
.clock-row { margin-top: 4px; color: #909399; font-size: 12px; }
.clock-row strong { color: #303133; font-weight: 500; }
.clock-row em { color: #67c23a; font-style: normal; }
.clock-row em.clock-abnormal { color: #f56c6c; }
.daily-badges { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 5px; }
.no-clock { margin-top: 14px; color: #c0c4cc; font-size: 12px; text-align: center; }
</style>
