<template>
  <div class="app-container">
    <doc-alert title="会员等级、积分、签到" url="https://doc.iocoder.cn/member/level/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item label="签到用户" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入签到用户"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="签到天数" prop="day">
        <el-input
          v-model="queryParams.day"
          placeholder="请输入签到天数"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="签到时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="签到用户" align="center" prop="nickname" />
      <el-table-column label="签到天数" align="center" prop="day">
        <template v-slot="scope">第 {{ scope.row.day }} 天</template>
      </el-table-column>
      <el-table-column label="获得积分" align="center" prop="point" width="100">
        <template v-slot="scope">
          <el-tag v-if="scope.row.point > 0" size="mini" type="success">+{{ scope.row.point }}</el-tag>
          <el-tag v-else size="mini" type="danger">{{ scope.row.point }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="签到时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getSignInRecordPage } from '@/api/member/signin/record'
import { dateFormatter } from '@/utils'

export default {
  name: 'SignInRecord',
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        nickname: null,
        day: null,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await getSignInRecordPage(this.queryParams)
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
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>

<style scoped>
.el-form {
  margin-bottom: 8px;
}
</style>
