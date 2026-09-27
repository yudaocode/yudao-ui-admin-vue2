<template>
  <div class="oa-attendance-month-report">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="月份" prop="month">
        <el-date-picker
          v-model="queryParams.month"
          type="month"
          value-format="yyyy-MM"
          placeholder="请选择月份"
          :clearable="false"
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="员工" prop="userId">
        <user-select-v2 v-model="queryParams.userId" style="width: 220px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 月报列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="员工" prop="userName" align="center" min-width="120" />
      <el-table-column label="部门" prop="deptName" align="center" min-width="120" />
      <el-table-column label="上班打卡" prop="clockInCount" align="center" width="110" />
      <el-table-column label="下班打卡" prop="clockOutCount" align="center" width="110" />
      <el-table-column label="正常次数" prop="normalCount" align="center" width="100" />
      <el-table-column label="迟到次数" prop="lateCount" align="center" width="100" />
      <el-table-column label="早退次数" prop="earlyCount" align="center" width="100" />
      <el-table-column
        label="缺少下班打卡天数"
        prop="missingClockOutDays"
        align="center"
        min-width="150"
      />
    </el-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import * as AttendanceApi from '@/api/oa/attendance'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

function getCurrentMonth() {
  const date = new Date()
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
}

export default {
  name: 'OaAttendanceMonthReport',
  components: { UserSelectV2 },
  data() {
    return {
      loading: true,
      list: [],
      queryParams: {
        month: getCurrentMonth(),
        userId: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      const monthDate = dayjs(this.queryParams.month)
      const params = {
        year: monthDate.year(),
        month: monthDate.month() + 1,
        userId: this.queryParams.userId
      }
      return AttendanceApi.getAttendanceMonthReport(params).then(response => {
        this.list = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    }
  }
}
</script>
