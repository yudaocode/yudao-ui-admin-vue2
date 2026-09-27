<template>
  <div class="app-container hrm-attendance-month-detail">
    <el-card
      v-loading="loading"
      shadow="never"
      class="detail-card"
    >
      <el-descriptions
        :column="4"
        border
      >
        <el-descriptions-item label="员工">{{ summary.employeeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ summary.jobNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ summary.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ summary.postName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="考勤组">{{ summary.attendanceGroupName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="入职时间">{{ formatHrmDateTime(summary.entryTime) }}</el-descriptions-item>
        <el-descriptions-item label="员工状态">
          <dict-tag
            v-if="summary.employeeStatus !== undefined"
            :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
            :value="summary.employeeStatus"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="工作城市">{{ summary.workCity || '-' }}</el-descriptions-item>
        <el-descriptions-item label="月份">{{ yearMonth }}</el-descriptions-item>
        <el-descriptions-item label="应出勤">{{ summary.attendDays || 0 }} 天</el-descriptions-item>
        <el-descriptions-item label="实际出勤">{{ formatHrmDays(summary.actualDays) }} 天</el-descriptions-item>
        <el-descriptions-item label="是否全勤">{{ summary.fullAttendance ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="迟到">
          {{ summary.lateCount || 0 }} 次 / {{ summary.lateMinute || 0 }} 分钟
        </el-descriptions-item>
        <el-descriptions-item label="早退">
          {{ summary.earlyCount || 0 }} 次 / {{ summary.earlyMinute || 0 }} 分钟
        </el-descriptions-item>
        <el-descriptions-item label="缺卡">{{ summary.misscardCount || 0 }} 次</el-descriptions-item>
        <el-descriptions-item label="旷工">{{ formatHrmDays(summary.absenteeismDays) }} 天</el-descriptions-item>
        <el-descriptions-item label="请假">{{ formatHrmDays(summary.leaveDays) }} 天</el-descriptions-item>
        <el-descriptions-item label="考勤扣款">
          {{ formatHrmMoney(summary.attendanceDeductAmount) }} 元
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card
      v-loading="loading"
      shadow="never"
      class="detail-card"
    >
      <div class="calendar-toolbar">
        <span class="calendar-title">{{ monthTitle }}</span>
        <el-radio-group v-model="dailyStatusFilter">
          <el-radio-button
            v-for="item in dailyStatusOptions"
            :key="item.value"
            :label="item.value"
          >{{ item.label }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="calendar-scroll">
        <div class="calendar">
          <div class="calendar-header">
            <div
              v-for="weekDay in HRM_WEEK_OPTIONS"
              :key="weekDay.value"
              class="week-cell"
            >
              {{ weekDay.label }}
            </div>
          </div>
          <div class="calendar-body">
            <div
              v-for="day in calendarDays"
              :key="day.date"
              class="calendar-day"
              :class="{ 'other-month': !day.currentMonth }"
            >
              <div class="calendar-day-header">
                <span :class="{ 'current-month-day': day.currentMonth }">{{ day.day }}</span>
                <el-tag
                  v-if="day.detail && day.detail.attendanceResult"
                  :type="getAttendanceResultType(day.detail.attendanceResult)"
                  size="small"
                  effect="light"
                >{{ day.detail.attendanceResult }}</el-tag>
              </div>
              <template v-if="day.currentMonth && day.detail && isDailyDetailVisible(day.detail)">
                <div class="shift-name">{{ day.detail.shiftName || '未排班' }}</div>
                <div
                  v-for="clock in day.detail.clockList || []"
                  :key="clock.id || String(clock.clockTime)"
                  class="clock-row"
                >
                  <dict-tag
                    :type="DICT_TYPE.HRM_ATTENDANCE_CLOCK_TYPE"
                    :value="clock.type"
                  />
                  <span class="clock-time">{{ formatClockTime(clock.clockTime) }}</span>
                  <dict-tag
                    :type="DICT_TYPE.HRM_ATTENDANCE_CLOCK_STATUS"
                    :value="clock.status == null ? '' : clock.status"
                  />
                </div>
                <div
                  v-if="day.detail.leaveMinutes"
                  class="leave-duration"
                >
                  请假 {{ formatHrmDays(day.detail.leaveDays) }} 天
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <div
        slot="header"
        class="card-title"
      >请假记录</div>
      <div class="leave-filter">
        <el-select
          v-model="leaveTypeFilter"
          placeholder="请选择请假类型"
          clearable
          class="query-control"
        >
          <el-option
            v-for="item in leaveTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <el-table :data="filteredLeaveList">
        <el-table-column
          label="类型"
          width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.HRM_ATTENDANCE_LEAVE_TYPE"
              :value="scope.row.type"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="开始时间"
          width="180"
        >
          <template slot-scope="scope">{{ formatHrmDateTime(scope.row.startTime) }}</template>
        </el-table-column>
        <el-table-column
          label="结束时间"
          width="180"
        >
          <template slot-scope="scope">{{ formatHrmDateTime(scope.row.endTime) }}</template>
        </el-table-column>
        <el-table-column
          label="时长"
          width="100"
        >
          <template slot-scope="scope">{{ formatHrmDays(scope.row.day) }} 天</template>
        </el-table-column>
        <el-table-column
          label="事由"
          prop="reason"
          min-width="180"
          show-overflow-tooltip
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getAttendanceMonthDetail } from '@/api/hrm/attendance/statistics'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { HRM_WEEK_OPTIONS } from '@/views/hrm/utils/constants'
import {
  formatHrmDateTime,
  formatHrmDays,
  formatHrmMoney
} from '@/views/hrm/utils/format'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatLocalDate(value, pattern) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const values = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes())
  }
  return Object.keys(values).reduce((result, token) => result.replace(token, values[token]), pattern)
}

export default {
  name: 'HrmAttendanceMonthDetail',
  data() {
    return {
      DICT_TYPE,
      HRM_WEEK_OPTIONS,
      loading: false,
      detail: undefined,
      dailyStatusFilter: 'all',
      leaveTypeFilter: undefined,
      dailyStatusOptions: [
        { label: '全部', value: 'all' },
        { label: '实际出勤', value: 'attendance' },
        { label: '迟到', value: 'late' },
        { label: '早退', value: 'early' },
        { label: '旷工', value: 'absenteeism' },
        { label: '缺卡', value: 'misscard' }
      ]
    }
  },
  computed: {
    employeeId() {
      return Number(this.$route.params.employeeId)
    },
    year() {
      return Number(this.$route.query.year) || new Date().getFullYear()
    },
    month() {
      return Number(this.$route.query.month) || new Date().getMonth() + 1
    },
    yearMonth() {
      return `${this.year}-${pad(this.month)}`
    },
    monthTitle() {
      return `${this.year} 年 ${pad(this.month)} 月`
    },
    summary() {
      return (this.detail && this.detail.summary) || {}
    },
    dailyDetailMap() {
      return new Map(
        ((this.detail && this.detail.dailyDetails) || []).map(item => [
          formatLocalDate(item.attendanceTime, 'YYYY-MM-DD'),
          item
        ])
      )
    },
    filteredLeaveList() {
      return ((this.detail && this.detail.leaves) || []).filter(
        item => !this.leaveTypeFilter || item.type === this.leaveTypeFilter
      )
    },
    leaveTypeOptions() {
      return getDictDatas(DICT_TYPE.HRM_ATTENDANCE_LEAVE_TYPE)
    },
    calendarDays() {
      const monthStart = new Date(this.year, this.month - 1, 1)
      const mondayOffset = (monthStart.getDay() + 6) % 7
      const calendarStart = new Date(this.year, this.month - 1, 1 - mondayOffset)
      return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(
          calendarStart.getFullYear(),
          calendarStart.getMonth(),
          calendarStart.getDate() + index
        )
        const dateValue = formatLocalDate(date, 'YYYY-MM-DD')
        return {
          date: dateValue,
          day: date.getDate(),
          currentMonth: date.getFullYear() === this.year && date.getMonth() + 1 === this.month,
          detail: this.dailyDetailMap.get(dateValue)
        }
      })
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    formatHrmDateTime,
    formatHrmDays,
    formatHrmMoney,
    async getDetail() {
      if (!this.employeeId || this.month < 1 || this.month > 12) {
        return
      }
      this.loading = true
      try {
        const response = await getAttendanceMonthDetail({
          employeeId: this.employeeId,
          year: this.year,
          month: this.month
        })
        this.detail = response.data
      } finally {
        this.loading = false
      }
    },
    isDailyDetailVisible(item) {
      switch (this.dailyStatusFilter) {
        case 'attendance':
          return Boolean(item.clockList && item.clockList.length > 0)
        case 'late':
          return item.lateCount > 0
        case 'early':
          return item.earlyCount > 0
        case 'absenteeism':
          return item.absenteeism === true
        case 'misscard':
          return (item.misscardCount || 0) > 0
        default:
          return true
      }
    },
    getAttendanceResultType(result) {
      if (result === '正常') {
        return 'success'
      }
      if (result && result.includes('旷工')) {
        return 'danger'
      }
      if (result && (result.includes('缺卡') || result.includes('迟到') || result.includes('早退'))) {
        return 'warning'
      }
      return 'info'
    },
    formatClockTime(value) {
      return formatLocalDate(value, 'HH:mm') || '-'
    }
  }
}
</script>

<style scoped>
.detail-card {
  margin-bottom: 16px;
}

.calendar-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.calendar-title {
  font-size: 16px;
  font-weight: 600;
}

.calendar-scroll {
  overflow-x: auto;
}

.calendar {
  min-width: 980px;
  overflow: hidden;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.calendar-header,
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-header {
  background: #f5f7fa;
}

.week-cell {
  padding: 12px 0;
  font-weight: 600;
  text-align: center;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.calendar-day {
  min-height: 150px;
  padding: 8px;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.calendar-day.other-month {
  color: #c0c4cc;
  background: #fafafa;
}

.calendar-day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.current-month-day {
  font-weight: 600;
}

.shift-name {
  margin-bottom: 6px;
  color: #909399;
  font-size: 12px;
}

.clock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 12px;
}

.clock-time {
  flex: 1;
  text-align: right;
}

.leave-duration {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.card-title {
  font-weight: 600;
}

.leave-filter {
  margin-bottom: 16px;
}

.query-control {
  width: 240px;
}
</style>
