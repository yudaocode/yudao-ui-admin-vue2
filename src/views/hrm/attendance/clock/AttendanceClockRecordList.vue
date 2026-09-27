<template>
  <div class="attendance-clock-record-list">
    <el-card shadow="never" class="search-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" @submit.native.prevent>
        <el-form-item label="月份">
          <el-date-picker
            v-model="month"
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
        <el-form-item label="打卡类型" prop="type">
          <el-select v-model="queryParams.type" placeholder="请选择打卡类型" clearable class="query-control">
            <el-option
              v-for="dict in clockTypeDictDatas"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="打卡地点" prop="address">
          <el-input
            v-model="queryParams.address"
            placeholder="请输入打卡地点"
            clearable
            class="query-control"
          />
        </el-form-item>
        <el-form-item label="打卡来源" prop="sourceTypes">
          <el-select
            v-model="queryParams.sourceTypes"
            placeholder="请选择打卡来源"
            clearable
            multiple
            collapse-tags
            class="query-control"
          >
            <el-option
              v-for="dict in clockSourceDictDatas"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
            v-hasPermi="['hrm:attendance:clock:create']"
          >新增</el-button>
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            :disabled="checkedIds.length === 0"
            :loading="batchDeleteLoading"
            @click="handleBatchDelete"
            v-hasPermi="['hrm:attendance:clock:delete']"
          >批量删除</el-button>
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
      <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" :selectable="isManualClock" />
        <el-table-column label="员工" prop="employeeName" width="100" show-overflow-tooltip />
        <el-table-column label="工号" prop="jobNumber" width="100" show-overflow-tooltip />
        <el-table-column label="部门" prop="deptName" width="120" show-overflow-tooltip />
        <el-table-column label="岗位" prop="postName" width="120" show-overflow-tooltip />
        <el-table-column label="打卡类型" prop="type" width="100">
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
        <el-table-column label="打卡来源" prop="sourceType" width="105">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.HRM_ATTENDANCE_CLOCK_SOURCE" :value="scope.row.sourceType" />
          </template>
        </el-table-column>
        <el-table-column label="打卡地点" prop="address" width="130" show-overflow-tooltip />
        <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              :disabled="!isManualClock(scope.row)"
              @click="openForm('update', scope.row.id)"
              v-hasPermi="['hrm:attendance:clock:update']"
            >编辑</el-button>
            <el-button
              type="text"
              class="danger-button"
              :disabled="!isManualClock(scope.row)"
              @click="handleDelete(scope.row.id)"
              v-hasPermi="['hrm:attendance:clock:delete']"
            >删除</el-button>
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

    <AttendanceClockForm ref="form" @success="getList" />
  </div>
</template>

<script>
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import {
  deleteAttendanceClock,
  deleteAttendanceClockList,
  exportAttendanceClock,
  getAttendanceClockPage
} from '@/api/hrm/attendance/clock'
import { HrmAttendanceClockSource } from '@/views/hrm/utils/constants'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import AttendanceClockForm from './AttendanceClockForm.vue'

function formatMonth(value) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthRange(month) {
  const parts = month.split('-').map(Number)
  const start = new Date(parts[0], parts[1] - 1, 1)
  const end = new Date(parts[0], parts[1], 0, 23, 59, 59)
  const format = (value) => {
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
  name: 'HrmAttendanceClockRecordList',
  components: { DeptSelect, AttendanceClockForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      batchDeleteLoading: false,
      total: 0,
      list: [],
      checkedIds: [],
      month: formatMonth(new Date()),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        search: '',
        deptIds: [],
        type: undefined,
        address: '',
        sourceTypes: [],
        attendanceTime: []
      }
    }
  },
  computed: {
    clockTypeDictDatas() {
      return getDictDatas(DICT_TYPE.HRM_ATTENDANCE_CLOCK_TYPE)
    },
    clockSourceDictDatas() {
      return getDictDatas(DICT_TYPE.HRM_ATTENDANCE_CLOCK_SOURCE)
    }
  },
  watch: {
    month: {
      immediate: true,
      handler(value) {
        this.queryParams.attendanceTime = getMonthRange(value)
      }
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
        const response = await getAttendanceClockPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
        this.checkedIds = []
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
      this.month = formatMonth(new Date())
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出数据项？')
        this.exportLoading = true
        const data = await exportAttendanceClock(this.queryParams)
        this.$download.excel(data, '打卡记录.xls')
      } catch (error) {
        // 用户取消导出或请求失败时不执行下载
      } finally {
        this.exportLoading = false
      }
    },
    handleSelectionChange(rows) {
      this.checkedIds = rows.map((row) => row.id)
    },
    isManualClock(row) {
      return row.sourceType === HrmAttendanceClockSource.MANUAL
    },
    async handleDelete(id) {
      if (!id) {
        return
      }
      try {
        await this.$modal.confirm('是否删除所选中数据？')
        await deleteAttendanceClock(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除或请求失败时不刷新列表
      }
    },
    async handleBatchDelete() {
      if (this.checkedIds.length === 0) {
        return
      }
      try {
        await this.$modal.confirm(
          `确定删除选中的 ${this.checkedIds.length} 条打卡记录吗？删除后会立即影响日/月考勤统计。`
        )
        this.batchDeleteLoading = true
        await deleteAttendanceClockList(this.checkedIds)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } finally {
        this.batchDeleteLoading = false
      }
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

.danger-button {
  color: #f56c6c;
}
</style>
