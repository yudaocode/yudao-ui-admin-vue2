<template>
  <div>
    <el-form ref="queryForm" :inline="true" :model="queryParams" size="small" label-width="68px" @submit.native.prevent>
      <el-form-item label="签到天数" prop="day"><el-input v-model="queryParams.day" clearable placeholder="请输入签到天数" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="签到时间" prop="createTime"><el-date-picker v-model="queryParams.createTime" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="编号" align="center" prop="id" width="100" />
      <el-table-column label="签到天数" align="center" prop="day" width="110"><template slot-scope="scope">第 {{ scope.row.day }} 天</template></el-table-column>
      <el-table-column label="获得积分" align="center" prop="point" width="110"><template slot-scope="scope"><el-tag :type="Number(scope.row.point) > 0 ? 'success' : 'danger'">{{ Number(scope.row.point) > 0 ? '+' : '' }}{{ scope.row.point }}</el-tag></template></el-table-column>
      <el-table-column label="签到时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import * as SignInRecordApi from '@/api/member/signin/record'
import { dateFormatter } from '@/utils'

export default {
  name: 'UserSignList',
  props: { userId: { type: [Number, String], required: true }},
  data() {
    return { loading: true, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, userId: undefined, day: undefined, createTime: [] }}
  },
  mounted() { this.queryParams.userId = this.userId; this.getList() },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      this.queryParams.userId = this.userId
      return SignInRecordApi.getSignInRecordPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.$refs.queryForm.resetFields(); this.queryParams.userId = this.userId; this.handleQuery() }
  }
}
</script>
