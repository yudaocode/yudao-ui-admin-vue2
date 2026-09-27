<template>
  <div class="app-container">
    <doc-alert title="【考勤】考勤管理" url="https://doc.iocoder.cn/hrm/attendance/" />

    <el-card shadow="never" class="search-card">
      <!-- 搜索工作栏 -->
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="考勤组" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入考勤组名称"
            clearable
            class="query-control"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh" /> 重置</el-button>
          <el-button
            v-hasPermi="['hrm:attendance:group:create']"
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
        <el-table-column label="考勤组" prop="name" fixed="left" min-width="160" />
        <el-table-column label="考勤班次" min-width="420">
          <template slot-scope="scope">
            <div class="shift-list">
              <el-tag
                v-for="(shift, index) in scope.row.shifts || []"
                :key="index"
                effect="plain"
              >
                {{ formatWeeks(shift.weeks) }} {{ shift.startTime }}-{{ shift.endTime }}
              </el-tag>
              <span v-if="!scope.row.shifts || !scope.row.shifts.length">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="考勤规则" min-width="120">
          <template>早晚打卡</template>
        </el-table-column>
        <el-table-column label="适用范围" min-width="220">
          <template slot-scope="scope">
            <div v-if="scope.row.deptNames && scope.row.deptNames.length">
              部门：{{ scope.row.deptNames.join('、') }}
            </div>
            <div v-if="scope.row.employeeNames && scope.row.employeeNames.length">
              员工：{{ scope.row.employeeNames.join('、') }}
            </div>
            <span
              v-if="
                (!scope.row.deptNames || !scope.row.deptNames.length) &&
                  (!scope.row.employeeNames || !scope.row.employeeNames.length)
              "
            >
              -
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:attendance:group:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['hrm:attendance:group:delete']"
              type="text"
              class="danger-button"
              :disabled="scope.row.defaultStatus"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 表单弹窗：添加/修改 -->
    <AttendanceGroupForm ref="form" @success="refresh" />
  </div>
</template>

<script>
import { deleteAttendanceGroup, getAttendanceGroupPage } from '@/api/hrm/attendance/group'
import { formatHrmAttendanceWeeks } from '@/views/hrm/utils/format'
import AttendanceGroupForm from './AttendanceGroupForm.vue'

export default {
  name: 'HrmAttendanceGroup',
  components: { AttendanceGroupForm },
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: ''
      }
    }
  },
  mounted() {
    this.refresh()
  },
  methods: {
    formatWeeks: formatHrmAttendanceWeeks,
    /** 查询列表 */
    async getList() {
      this.loading = true
      try {
        const response = await getAttendanceGroupPage(this.queryParams)
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
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    /** 添加/修改操作 */
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    /** 刷新页面数据 */
    async refresh() {
      await this.getList()
    },
    /** 删除按钮操作 */
    async handleDelete(id) {
      if (!id) {
        return
      }
      try {
        await this.$modal.confirm('是否删除所选中数据？')
        await deleteAttendanceGroup(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消或请求失败时保持当前列表
      }
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

.query-control {
  width: 240px;
}

.shift-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.danger-button {
  color: #f56c6c;
}
</style>
