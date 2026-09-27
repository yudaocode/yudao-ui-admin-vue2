<template>
  <div class="app-container oa-attendance-list">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="员工" prop="userId">
        <user-select-v2 v-model="queryParams.userId" style="width: 240px" />
      </el-form-item>
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

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="员工" prop="userName" align="center" min-width="120" />
      <el-table-column label="部门" prop="deptName" align="center" min-width="120" />
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
      <el-table-column label="操作" align="center" fixed="right" width="140">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['oa:attendance:update']"
            type="text"
            size="mini"
            @click="openForm(scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['oa:attendance:delete']"
            type="text"
            size="mini"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
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

    <!-- 修改考勤记录弹窗 -->
    <oa-attendance-form ref="attendanceForm" @success="getList" />
  </div>
</template>

<script>
import * as AttendanceApi from '@/api/oa/attendance'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import OaAttendanceForm from './OaAttendanceForm.vue'

export default {
  name: 'OaAttendanceList',
  components: { OaAttendanceForm, UserSelectV2 },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
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
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return AttendanceApi.getAttendancePage(this.queryParams).then(response => {
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
    openForm(id) {
      this.$refs.attendanceForm.open(id)
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除考勤记录编号为“' + id + '”的数据项？').then(() => {
        return AttendanceApi.deleteAttendance(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
