<template>
  <div class="app-container">
    <doc-alert title="【考勤】考勤管理" url="https://doc.iocoder.cn/hrm/attendance/" />

    <el-card shadow="never" class="search-card">
      <!-- 搜索工作栏 -->
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="72px">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="queryParams.date"
            type="daterange"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="date-range-control"
          />
        </el-form-item>
        <el-form-item label="日期类型" prop="type">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择日期类型"
            clearable
            class="query-control"
          >
            <el-option
              v-for="dict in holidayTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh" /> 重置</el-button>
          <el-button
            v-hasPermi="['hrm:attendance:holiday:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus" /> 新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="list">
        <el-table-column label="编号" align="center" prop="id" width="100" />
        <el-table-column label="日期" align="center" prop="date" min-width="180">
          <template slot-scope="scope">{{ formatDate(scope.row.date) }}</template>
        </el-table-column>
        <el-table-column label="日期类型" align="center" prop="type" width="140">
          <template slot-scope="scope">
            <dict-tag :type="dictType.HRM_ATTENDANCE_HOLIDAY_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:attendance:holiday:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['hrm:attendance:holiday:delete']"
              type="text"
              class="danger-button"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
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

    <!-- 表单弹窗：添加/修改 -->
    <AttendanceHolidayForm ref="form" @success="getList" />
  </div>
</template>

<script>
import { deleteAttendanceHoliday, getAttendanceHolidayPage } from '@/api/hrm/attendance/holiday'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { formatHrmDate } from '@/views/hrm/utils/format'
import AttendanceHolidayForm from './AttendanceHolidayForm.vue'

export default {
  name: 'HrmAttendanceHoliday',
  components: { AttendanceHolidayForm },
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        date: undefined,
        type: undefined
      }
    }
  },
  computed: {
    dictType() {
      return DICT_TYPE
    },
    holidayTypeOptions() {
      return getDictDatas(DICT_TYPE.HRM_ATTENDANCE_HOLIDAY_TYPE).map(item => ({
        ...item,
        value: Number(item.value)
      }))
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    dateFormatter,
    formatDate: formatHrmDate,
    /** 查询列表 */
    async getList() {
      this.loading = true
      try {
        const params = {
          ...this.queryParams,
          date: this.getDateRangeFromArray(this.queryParams.date)
        }
        const response = await getAttendanceHolidayPage(params)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      if (this.$refs.queryForm) {
        this.$refs.queryForm.resetFields()
      }
      this.queryParams.date = undefined
      this.handleQuery()
    },
    /** 添加/修改操作 */
    openForm(type, id) {
      if (this.$refs.form) {
        this.$refs.form.open(type, id)
      }
    },
    /** 删除按钮操作 */
    async handleDelete(id) {
      if (!id) {
        return
      }
      try {
        await this.$modal.confirm('是否删除所选中数据？')
        await deleteAttendanceHoliday(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消或请求失败时保持当前列表
      }
    },
    getDateRangeFromArray(dateRange) {
      if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) {
        return undefined
      }
      const beginDate = new Date(dateRange[0])
      const endDate = new Date(dateRange[1])
      if (Number.isNaN(beginDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return undefined
      }
      return [`${dateRange[0]} 00:00:00`, `${dateRange[1]} 23:59:59`]
    }
  }
}
</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
}

.search-card ::v-deep .el-card__body {
  padding-bottom: 2px;
}

.date-range-control {
  width: 360px;
}

.query-control {
  width: 240px;
}

.danger-button {
  color: #f56c6c;
}
</style>
