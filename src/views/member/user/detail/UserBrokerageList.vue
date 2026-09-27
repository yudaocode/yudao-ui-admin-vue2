<template>
  <div>
    <el-form ref="queryForm" :inline="true" :model="queryParams" size="small" label-width="68px" @submit.native.prevent>
      <el-form-item label="用户类型" prop="level"><el-radio-group v-model="queryParams.level" @change="handleQuery"><el-radio-button label="">全部</el-radio-button><el-radio-button label="1">一级推广人</el-radio-button><el-radio-button label="2">二级推广人</el-radio-button></el-radio-group></el-form-item>
      <el-form-item label="绑定时间" prop="bindUserTime"><el-date-picker v-model="queryParams.bindUserTime" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="用户编号" align="center" prop="id" width="100" />
      <el-table-column label="头像" align="center" width="70"><template slot-scope="scope"><el-avatar :src="scope.row.avatar" :size="32">{{ (scope.row.nickname || '会').slice(0, 1) }}</el-avatar></template></el-table-column>
      <el-table-column label="昵称" align="center" prop="nickname" min-width="100" />
      <el-table-column label="等级" align="center" width="110"><template slot-scope="scope"><el-tag>{{ Number(scope.row.bindUserId) === Number(bindUserId) ? '一级' : '二级' }}</el-tag></template></el-table-column>
      <el-table-column label="绑定时间" align="center" prop="bindUserTime" width="180" :formatter="dateFormatter" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import * as BrokerageUserApi from '@/api/mall/trade/brokerage/user'
import { dateFormatter } from '@/utils'

export default {
  name: 'UserBrokerageList',
  props: { bindUserId: { type: [Number, String], required: true }},
  data() {
    return { loading: true, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, bindUserId: undefined, level: '', bindUserTime: [] }}
  },
  mounted() { this.getList() },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      this.queryParams.bindUserId = this.bindUserId
      return BrokerageUserApi.getBrokerageUserPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.$refs.queryForm.resetFields(); this.queryParams.level = ''; this.queryParams.bindUserId = this.bindUserId; this.handleQuery() }
  }
}
</script>
