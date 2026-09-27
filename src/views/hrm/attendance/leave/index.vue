<template>
  <div class="app-container hrm-attendance-leave">
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
            @change="handleMonthChange"
          />
        </el-form-item>
        <el-form-item
          label="员工"
          prop="employeeKeyword"
        >
          <el-input
            v-model="queryParams.employeeKeyword"
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
          label="请假类型"
          prop="types"
        >
          <el-select
            v-model="queryParams.types"
            placeholder="请选择请假类型"
            clearable
            multiple
            collapse-tags
            class="query-control"
          >
            <el-option
              v-for="item in leaveTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="审批状态"
          prop="approvalStatus"
        >
          <el-select
            v-model="queryParams.approvalStatus"
            placeholder="请选择审批状态"
            clearable
            class="query-control"
          >
            <el-option
              v-for="item in approvalStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="Number(item.value)"
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
            v-hasPermi="['hrm:attendance:leave:export']"
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
        stripe
        @sort-change="handleSortChange"
      >
        <el-table-column
          label="姓名"
          align="center"
          prop="employeeName"
          min-width="110"
          show-overflow-tooltip
        />
        <el-table-column
          label="工号"
          align="center"
          prop="jobNumber"
          min-width="110"
          show-overflow-tooltip
        />
        <el-table-column
          label="部门"
          align="center"
          prop="deptName"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="岗位"
          align="center"
          prop="postName"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="请假类型"
          align="center"
          width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.HRM_ATTENDANCE_LEAVE_TYPE"
              :value="scope.row.type"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="请假开始时间"
          align="center"
          prop="startTime"
          width="170"
          sortable="custom"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="请假结束时间"
          align="center"
          prop="endTime"
          width="170"
          sortable="custom"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="请假天数"
          align="center"
          prop="day"
          width="100"
          sortable="custom"
        >
          <template slot-scope="scope">{{ scope.row.day || 0 }} 天</template>
        </el-table-column>
        <el-table-column
          label="请假事由"
          align="center"
          prop="reason"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          label="备注"
          align="center"
          prop="remark"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          label="审批状态"
          align="center"
          width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
              :value="scope.row.approvalStatus"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.processInstanceId"
              type="text"
              @click="openProcessDetail(scope.row.processInstanceId)"
            >审批进度</el-button>
            <span v-else>-</span>
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
import { exportAttendanceLeave, getAttendanceLeavePage } from '@/api/hrm/attendance/leave'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'

function formatMonth(value) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthRange(month) {
  const parts = month.split('-').map(Number)
  const start = new Date(parts[0], parts[1] - 1, 1)
  const end = new Date(parts[0], parts[1], 0, 23, 59, 59)
  const format = value => {
    const date = new Date(value)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
  }
  return [format(start), format(end)]
}

export default {
  name: 'HrmAttendanceLeave',
  components: { DeptSelect },
  data() {
    const currentMonth = formatMonth(new Date())
    return {
      DICT_TYPE,
      loading: true,
      exportLoading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        month: currentMonth,
        startTime: getMonthRange(currentMonth),
        employeeKeyword: '',
        deptIds: [],
        types: [],
        approvalStatus: undefined,
        sortingFields: []
      }
    }
  },
  computed: {
    leaveTypeOptions() {
      return getDictDatas(DICT_TYPE.HRM_ATTENDANCE_LEAVE_TYPE)
    },
    approvalStatusOptions() {
      return getDictDatas(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await getAttendanceLeavePage(this.getQueryParams())
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    getQueryParams() {
      const params = Object.assign({}, this.queryParams)
      delete params.month
      return params
    },
    handleMonthChange() {
      this.queryParams.startTime = getMonthRange(this.queryParams.month)
      this.handleQuery()
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.startTime = getMonthRange(this.queryParams.month)
      this.handleQuery()
    },
    handleSortChange({ prop, order }) {
      this.queryParams.sortingFields = order
        ? [{ field: prop, order: order === 'ascending' ? 'asc' : 'desc' }]
        : []
      this.handleQuery()
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出数据项？')
        this.exportLoading = true
        const data = await exportAttendanceLeave(this.getQueryParams())
        this.$download.excel(data, '请假记录.xls')
      } catch (error) {
        // 用户取消导出或请求失败时不执行下载
      } finally {
        this.exportLoading = false
      }
    },
    openProcessDetail(processInstanceId) {
      if (!processInstanceId) {
        return
      }
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: { id: processInstanceId }
      })
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
