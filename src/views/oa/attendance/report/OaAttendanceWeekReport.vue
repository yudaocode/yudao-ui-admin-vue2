<template>
  <div class="oa-attendance-week-report">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="所在周" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择周内任意日期"
          :clearable="false"
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="员工" prop="userId">
        <user-select-v2 v-model="queryParams.userId" style="width: 220px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handlePreviousWeek">上一周</el-button>
        <el-button @click="handleCurrentWeek">本周</el-button>
        <el-button @click="handleNextWeek">下一周</el-button>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 周报列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="员工" prop="userName" align="center" fixed="left" width="120" />
      <el-table-column label="部门" prop="deptName" align="center" fixed="left" width="120" />
      <el-table-column
        v-for="(day, index) in weekDays"
        :key="day.date"
        :label="day.label + ' ' + day.date.slice(5)"
        align="center"
        min-width="150"
      >
        <template slot-scope="scope">
          <div class="clock-lines">
            <div>
              上班：{{ getClockText(scope.row.dailyAttendances[index], OA_ATTENDANCE_TYPE.CLOCK_IN) }}
            </div>
            <div>
              下班：{{ getClockText(scope.row.dailyAttendances[index], OA_ATTENDANCE_TYPE.CLOCK_OUT) }}
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as AttendanceApi from '@/api/oa/attendance'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { OA_ATTENDANCE_TYPE } from '@/views/oa/utils/constants'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

const WEEK_DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function parseLocalDate(value) {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return new Date(value)
}

function formatLocalDate(value) {
  const date = parseLocalDate(value)
  return date.getFullYear() + '-' + padDatePart(date.getMonth() + 1) + '-' + padDatePart(date.getDate())
}

function addDays(value, amount) {
  const date = parseLocalDate(value)
  date.setDate(date.getDate() + amount)
  return formatLocalDate(date)
}

function getWeekStartDate(value) {
  const date = parseLocalDate(value)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return formatLocalDate(date)
}

export default {
  name: 'OaAttendanceWeekReport',
  components: { UserSelectV2 },
  data() {
    return {
      OA_ATTENDANCE_TYPE,
      loading: true,
      list: [],
      queryParams: {
        startDate: getWeekStartDate(new Date()),
        userId: undefined
      }
    }
  },
  computed: {
    weekDays() {
      const weekStartDate = getWeekStartDate(this.queryParams.startDate)
      return WEEK_DAY_LABELS.map((label, index) => ({
        label,
        date: addDays(weekStartDate, index)
      }))
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      const params = {
        startDate: getWeekStartDate(this.queryParams.startDate),
        userId: this.queryParams.userId
      }
      return AttendanceApi.getAttendanceWeekReport(params).then(response => {
        this.list = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      return this.getList()
    },
    handlePreviousWeek() {
      this.queryParams.startDate = addDays(this.queryParams.startDate, -7)
      return this.getList()
    },
    handleCurrentWeek() {
      this.queryParams.startDate = getWeekStartDate(new Date())
      return this.getList()
    },
    handleNextWeek() {
      this.queryParams.startDate = addDays(this.queryParams.startDate, 7)
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    getClockText(attendance, attendanceType) {
      const isClockIn = attendanceType === OA_ATTENDANCE_TYPE.CLOCK_IN
      const attendanceTime = isClockIn
        ? attendance && attendance.clockInTime
        : attendance && attendance.clockOutTime
      if (!attendanceTime) return '-'
      const status = isClockIn ? attendance.clockInStatus : attendance.clockOutStatus
      return formatDate(attendanceTime, 'HH:mm:ss') + ' ' +
        getDictLabel(DICT_TYPE.OA_ATTENDANCE_STATUS, status)
    }
  }
}
</script>

<style scoped>
.clock-lines {
  line-height: 24px;
}
</style>
