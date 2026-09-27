<template>
  <div class="app-container oa-attendance-my">
    <!-- 今日打卡 -->
    <el-card shadow="never" class="attendance-card">
      <div class="today-attendance">
        <div>
          <div class="today-title">今日考勤</div>
          <div class="today-summary">
            上班：{{ getClockText(OA_ATTENDANCE_TYPE.CLOCK_IN) }}&nbsp;&nbsp;下班：{{
              getClockText(OA_ATTENDANCE_TYPE.CLOCK_OUT)
            }}
          </div>
        </div>
        <el-button type="primary" :loading="clockLoading" @click="handleClock">
          {{ clockButtonText }}
        </el-button>
      </div>
    </el-card>

    <!-- 搜索 -->
    <el-card shadow="never" class="attendance-card">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        size="small"
        label-width="68px"
        @submit.native.prevent
      >
        <el-form-item label="考勤类型" prop="type">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择考勤类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考勤状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择考勤状态"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考勤时间" prop="attendanceTime">
          <el-date-picker
            v-model="queryParams.attendanceTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 我的考勤记录 -->
    <el-card shadow="never" class="attendance-card">
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column label="考勤类型" align="center" width="110">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_ATTENDANCE_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="考勤状态" align="center" width="100">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_ATTENDANCE_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column
          label="考勤时间"
          prop="attendanceTime"
          :formatter="dateFormatter"
          align="center"
          width="180"
        />
        <el-table-column label="考勤 IP" prop="attendanceIp" align="center" min-width="130" />
        <el-table-column
          label="备注"
          prop="remark"
          align="center"
          min-width="180"
          show-overflow-tooltip
        />
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import * as AttendanceApi from '@/api/oa/attendance'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { OA_ATTENDANCE_TYPE } from '@/views/oa/utils/constants'

export default {
  name: 'OaAttendanceMy',
  data() {
    return {
      DICT_TYPE,
      OA_ATTENDANCE_TYPE,
      clockLoading: false,
      todayAttendanceList: [],
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        type: undefined,
        status: undefined,
        attendanceTime: []
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_ATTENDANCE_TYPE)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_ATTENDANCE_STATUS)
    },
    clockButtonText() {
      if (!this.todayAttendanceList.some(item => item.type === OA_ATTENDANCE_TYPE.CLOCK_IN)) {
        return '上班打卡'
      }
      return this.todayAttendanceList.some(item => item.type === OA_ATTENDANCE_TYPE.CLOCK_OUT)
        ? '更新下班打卡'
        : '下班打卡'
    }
  },
  created() {
    this.getTodayAttendanceList()
    this.getList()
  },
  methods: {
    dateFormatter,
    getTodayAttendanceList() {
      return AttendanceApi.getMyTodayAttendanceList().then(response => {
        this.todayAttendanceList = response.data
      })
    },
    getList() {
      this.loading = true
      return AttendanceApi.getMyAttendancePage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    handleClock() {
      this.clockLoading = true
      return AttendanceApi.clockAttendance().then(() => {
        this.$modal.msgSuccess('打卡成功')
        return Promise.all([this.getTodayAttendanceList(), this.getList()])
      }).finally(() => {
        this.clockLoading = false
      })
    },
    getClockText(type) {
      const attendance = this.todayAttendanceList.find(item => item.type === type)
      if (!attendance) return '未打卡'
      return formatDate(attendance.attendanceTime, 'HH:mm:ss') + '（' +
        getDictLabel(DICT_TYPE.OA_ATTENDANCE_STATUS, attendance.status) + '）'
    }
  }
}
</script>

<style scoped>
.attendance-card + .attendance-card {
  margin-top: 16px;
}

.today-attendance {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.today-title {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.today-summary {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}
</style>
