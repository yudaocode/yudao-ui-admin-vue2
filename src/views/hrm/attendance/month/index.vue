<template>
  <div class="app-container hrm-attendance-month">
    <doc-alert
      title="【考勤】考勤管理"
      url="https://doc.iocoder.cn/hrm/attendance/"
    />

    <el-card
      shadow="never"
      class="search-card"
    >
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="68px"
        @submit.native.prevent
      >
        <el-form-item
          label="月份"
          prop="month"
        >
          <el-date-picker
            v-model="queryParams.month"
            type="month"
            value-format="yyyy-MM"
            :clearable="false"
            class="query-control"
          />
        </el-form-item>
        <el-form-item
          label="员工"
          prop="search"
        >
          <el-input
            v-model="queryParams.search"
            placeholder="请输入员工姓名或工号"
            clearable
            class="query-control"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="部门"
          prop="deptIds"
        >
          <DeptSelect
            v-model="queryParams.deptIds"
            multiple
            class="query-control"
          />
        </el-form-item>
        <el-form-item
          label="是否全勤"
          prop="fullAttendance"
        >
          <el-select
            v-model="queryParams.fullAttendance"
            placeholder="请选择"
            clearable
            class="query-control"
          >
            <el-option
              v-for="dict in fullAttendanceOptions"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value) === 1"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
          <el-button
            v-hasPermi="['hrm:attendance:statistics:export']"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
      >
        <el-table-column
          label="员工"
          prop="employeeName"
          fixed="left"
          min-width="120"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:attendance:statistics:query']"
              type="text"
              @click="openDetail(scope.row)"
            >{{ scope.row.employeeName }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="工号"
          prop="jobNumber"
          min-width="110"
          show-overflow-tooltip
        />
        <el-table-column
          label="部门"
          prop="deptName"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="岗位"
          prop="postName"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="应出勤天数"
          prop="attendDays"
          width="110"
        />
        <el-table-column
          label="实际出勤天数"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmDays(scope.row.actualDays) }}</template>
        </el-table-column>
        <el-table-column
          label="迟到时长（分钟）"
          prop="lateMinute"
          width="140"
        />
        <el-table-column
          label="迟到次数"
          prop="lateCount"
          width="100"
        />
        <el-table-column
          label="早退时长（分钟）"
          prop="earlyMinute"
          width="140"
        />
        <el-table-column
          label="早退次数"
          prop="earlyCount"
          width="100"
        />
        <el-table-column
          label="旷工天数"
          width="100"
        >
          <template slot-scope="scope">{{ formatHrmDays(scope.row.absenteeismDays) }}</template>
        </el-table-column>
        <el-table-column
          label="缺卡次数"
          prop="misscardCount"
          width="100"
        />
        <el-table-column
          label="请假天数"
          width="100"
        >
          <template slot-scope="scope">{{ formatHrmDays(scope.row.leaveDays) }}</template>
        </el-table-column>
        <el-table-column
          label="考勤扣款"
          width="110"
        >
          <template slot-scope="scope">
            {{ formatHrmMoney(scope.row.attendanceDeductAmount) }} 元
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
  </div>
</template>

<script>
import {
  exportAttendanceMonthRecord,
  getAttendanceMonthRecordPage
} from '@/api/hrm/attendance/statistics'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { formatHrmDays, formatHrmMoney } from '@/views/hrm/utils/format'

function formatMonth(value) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default {
  name: 'HrmAttendanceMonth',
  components: { DeptSelect },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        month: formatMonth(new Date()),
        search: '',
        deptIds: [],
        fullAttendance: undefined
      }
    }
  },
  computed: {
    fullAttendanceOptions() {
      return getDictDatas(DICT_TYPE.HRM_ATTENDANCE_YES_NO)
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    formatHrmDays,
    formatHrmMoney,
    async getList() {
      this.loading = true
      try {
        const response = await getAttendanceMonthRecordPage(this.getQueryParams())
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
        const data = await exportAttendanceMonthRecord(this.getQueryParams())
        this.$download.excel(data, '员工月度考勤汇总.xls')
      } catch (error) {
        // 用户取消导出或请求失败时不执行下载
      } finally {
        this.exportLoading = false
      }
    },
    openDetail(row) {
      this.$router.push({
        name: 'HrmAttendanceMonthDetail',
        params: { employeeId: row.employeeId },
        query: { year: row.year, month: row.month }
      })
    },
    getQueryParams() {
      const parts = this.queryParams.month.split('-').map(Number)
      return Object.assign({}, this.queryParams, { year: parts[0], month: parts[1] })
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
</style>
