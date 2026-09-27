<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="820px" append-to-body>
    <div v-loading="loading">
      <el-descriptions v-if="detailData" :column="2" border>
        <el-descriptions-item label="班次">{{ detailData.shiftName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="考勤结果">
          {{ detailData.attendanceResult || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="应打卡次数">
          {{ detailData.requiredClockCount || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="实际打卡次数">
          {{ detailData.clockList ? detailData.clockList.length : 0 }}
        </el-descriptions-item>
      </el-descriptions>
      <el-table :data="detailData && detailData.clockList ? detailData.clockList : []" class="clock-table">
        <el-table-column label="打卡类型" prop="type" width="110">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.HRM_ATTENDANCE_CLOCK_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="应打卡时间" prop="attendanceTime" width="170" :formatter="dateFormatter" />
        <el-table-column label="打卡时间" prop="clockTime" width="170" :formatter="dateFormatter" />
        <el-table-column label="状态" prop="status" width="90">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.HRM_ATTENDANCE_CLOCK_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="地点" prop="address" min-width="140" show-overflow-tooltip />
      </el-table>
    </div>
    <span slot="footer">
      <el-button @click="dialogVisible = false">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { getAttendanceDailyDetail } from '@/api/hrm/attendance/statistics'

function formatDate(value, pattern) {
  // 纯日期字符串按本地时间解析（对齐源 dayjs 行为，避免时区偏移）
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + 'T00:00:00')
    : new Date(value)
  const values = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0')
  }
  return Object.keys(values).reduce((result, token) => result.replace(token, values[token]), pattern)
}

export default {
  name: 'HrmAttendanceClockDailyDetail',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      detailData: undefined
    }
  },
  computed: {
    dialogTitle() {
      if (!this.detailData) {
        return '每日考勤详情'
      }
      return `${this.detailData.employeeName || ''} ${formatDate(this.detailData.attendanceTime, 'YYYY-MM-DD')}`
    }
  },
  methods: {
    dateFormatter,
    async open(employeeId, attendanceDate) {
      this.dialogVisible = true
      this.loading = true
      this.detailData = undefined
      try {
        const response = await getAttendanceDailyDetail({
          employeeId,
          attendanceTime: formatDate(attendanceDate, 'YYYY-MM-DD HH:mm:ss')
        })
        this.detailData = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.clock-table {
  margin-top: 16px;
}
</style>
