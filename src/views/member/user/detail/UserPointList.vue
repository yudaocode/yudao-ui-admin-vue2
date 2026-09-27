<template>
  <div>
    <el-form ref="queryForm" :inline="true" :model="queryParams" size="small" label-width="68px" @submit.native.prevent>
      <el-form-item label="业务类型" prop="bizType"><el-select v-model="queryParams.bizType" clearable placeholder="请选择业务类型"><el-option v-for="item in bizTypeDictDatas" :key="item.value" :label="item.label" :value="toNumber(item.value)" /></el-select></el-form-item>
      <el-form-item label="积分标题" prop="title"><el-input v-model="queryParams.title" clearable placeholder="请输入积分标题" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="获得时间" prop="createDate"><el-date-picker v-model="queryParams.createDate" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" width="100" />
      <el-table-column label="获得时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
      <el-table-column label="获得积分" align="center" prop="point" width="100"><template slot-scope="scope"><el-tag :type="Number(scope.row.point) > 0 ? 'success' : 'danger'">{{ Number(scope.row.point) > 0 ? '+' : '' }}{{ scope.row.point }}</el-tag></template></el-table-column>
      <el-table-column label="总积分" align="center" prop="totalPoint" width="100" />
      <el-table-column label="标题" align="center" prop="title" min-width="150" />
      <el-table-column label="描述" align="center" prop="description" min-width="180" />
      <el-table-column label="业务编码" align="center" prop="bizId" width="130" />
      <el-table-column label="业务类型" align="center" prop="bizType" width="130"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.MEMBER_POINT_BIZ_TYPE" :value="scope.row.bizType" /></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import * as RecordApi from '@/api/member/point/record'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'

export default {
  name: 'UserPointList',
  props: { userId: { type: [Number, String], required: true }},
  data() {
    return { DICT_TYPE, loading: true, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, userId: undefined, bizType: undefined, title: undefined, createDate: [] }}
  },
  computed: { bizTypeDictDatas() { return getDictDatas(DICT_TYPE.MEMBER_POINT_BIZ_TYPE) } },
  mounted() { this.queryParams.userId = this.userId; this.getList() },
  methods: {
    dateFormatter,
    toNumber(value) { return value === '' || value === null || value === undefined ? value : Number(value) },
    getList() {
      this.loading = true
      this.queryParams.userId = this.userId
      return RecordApi.getRecordPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.$refs.queryForm.resetFields(); this.queryParams.userId = this.userId; this.handleQuery() }
  }
}
</script>
