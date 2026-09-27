<template>
  <div class="attendance-clock-overview">
    <el-card shadow="never" class="search-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" @submit.native.prevent>
        <el-form-item label="月份" prop="month">
          <el-date-picker
            v-model="queryParams.month"
            type="month"
            value-format="yyyy-MM"
            :clearable="false"
            class="query-control"
          />
        </el-form-item>
        <el-form-item label="员工" prop="search">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入员工姓名或工号"
            clearable
            class="query-control"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="部门" prop="deptIds">
          <DeptSelect v-model="queryParams.deptIds" multiple class="query-control" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
            v-hasPermi="['hrm:attendance:clock:export']"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" stripe border>
        <el-table-column label="员工" prop="employeeName" fixed="left" width="120" show-overflow-tooltip />
        <el-table-column label="工号" prop="jobNumber" fixed="left" width="120" show-overflow-tooltip />
        <el-table-column label="部门" prop="deptName" fixed="left" width="140" show-overflow-tooltip />
        <el-table-column label="岗位" prop="postName" fixed="left" width="140" show-overflow-tooltip />
        <el-table-column
          v-for="day in dayColumns"
          :key="day.date"
          :label="day.day"
          :min-width="168"
          align="center"
        >
          <template slot="header">
            <div class="day-header">
              <span>{{ day.day }}</span>
              <span>{{ day.week }}</span>
            </div>
          </template>
          <template slot-scope="scope">
            <el-button
              v-if="getDailyOverview(scope.row, day.date)"
              type="text"
              class="overview-button"
              :aria-label="`查看 ${day.date} 考勤详情`"
              @click="openDailyDetail(scope.row, day.date)"
            >
              <span class="overview-list">
                <span
                  v-for="(item, index) in getDailyOverview(scope.row, day.date).overviews || []"
                  :key="`${item.text || item.type}-${index}`"
                  class="overview-item"
                >
                  <template v-if="item.type">
                    <span class="overview-type">{{ item.type }}</span>
                    <span class="overview-time">{{ item.time }}</span>
                    <span :class="getOverviewTextClass(item.status)">{{ item.status }}</span>
                  </template>
                  <span v-else class="overview-summary" :class="getOverviewTextClass(item.text)">
                    {{ item.text }}
                  </span>
                </span>
              </span>
            </el-button>
            <span v-else class="text-placeholder">-</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <AttendanceClockDailyDetail ref="dailyDetail" />
  </div>
</template>

<script>
import { exportAttendanceMonthDailyOverview, getAttendanceMonthDailyOverviewPage } from '@/api/hrm/attendance/statistics'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import AttendanceClockDailyDetail from './AttendanceClockDailyDetail.vue'

function formatDate(value, pattern) {
  const date = new Date(value)
  const values = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0')
  }
  return Object.keys(values).reduce((result, token) => result.replace(token, values[token]), pattern)
}

export default {
  name: 'HrmAttendanceClockOverview',
  components: { DeptSelect, AttendanceClockDailyDetail },
  data() {
    return {
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        month: formatDate(new Date(), 'YYYY-MM'),
        search: '',
        deptIds: []
      }
    }
  },
  computed: {
    dayColumns() {
      const parts = this.queryParams.month.split('-').map(Number)
      const daysInMonth = new Date(parts[0], parts[1], 0).getDate()
      return Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(parts[0], parts[1] - 1, index + 1)
        return {
          date: formatDate(date, 'YYYY-MM-DD'),
          day: formatDate(date, 'DD'),
          week: `周${'日一二三四五六'[date.getDay()]}`
        }
      })
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await getAttendanceMonthDailyOverviewPage(this.getQueryParams())
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出数据项？')
        this.exportLoading = true
        const data = await exportAttendanceMonthDailyOverview(this.getQueryParams())
        this.$download.excel(data, '员工月度打卡概况.xls')
      } catch (error) {
        // 用户取消导出或请求失败时不执行下载
      } finally {
        this.exportLoading = false
      }
    },
    openDailyDetail(row, attendanceDate) {
      this.$refs.dailyDetail.open(row.employeeId, attendanceDate)
    },
    getQueryParams() {
      const parts = this.queryParams.month.split('-').map(Number)
      return Object.assign({}, this.queryParams, { year: parts[0], month: parts[1] })
    },
    getDailyOverview(row, attendanceDate) {
      return row.dailyClockMap && row.dailyClockMap[attendanceDate]
    },
    getOverviewTextClass(value) {
      if (!value || value === '休息' || value === '未排班') {
        return 'text-secondary'
      }
      if (value.includes('旷工') || value.includes('缺卡')) {
        return 'text-danger'
      }
      if (value.includes('迟到') || value.includes('早退')) {
        return 'text-warning'
      }
      if (value.includes('正常')) {
        return 'text-success'
      }
      return 'text-primary'
    }
  }
}
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.query-control {
  width: 240px;
}

.day-header,
.overview-list {
  display: flex;
  flex-direction: column;
}

.day-header {
  line-height: 20px;
}

.overview-button {
  width: 100%;
  min-height: 52px;
  height: auto;
  padding: 6px 8px;
  text-align: left;
}

::v-deep .overview-button > span {
  display: block;
  width: 100%;
}

.overview-list {
  width: 100%;
  gap: 2px;
  white-space: normal;
}

.overview-item {
  display: grid;
  grid-template-columns: 32px 48px 1fr;
  align-items: center;
  min-height: 20px;
  column-gap: 4px;
  line-height: 20px;
}

.overview-summary {
  grid-column: span 3;
  text-align: center;
}

.overview-type,
.text-secondary {
  color: #909399;
}

.overview-time {
  color: #303133;
}

.text-placeholder {
  color: #c0c4cc;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.text-primary {
  color: #409eff;
}
</style>
