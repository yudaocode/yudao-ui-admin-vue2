<template>
  <div class="app-container">
    <doc-alert title="工作流手册" url="https://doc.iocoder.cn/bpm/" />

    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch" label-width="72px">
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入任务名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
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
      <el-table-column label="流程" align="center" prop="processInstance.name" min-width="180" />
      <el-table-column label="发起人" align="center" min-width="110">
        <template v-slot="scope">{{ userName(scope.row.processInstance && scope.row.processInstance.startUser) }}</template>
      </el-table-column>
      <el-table-column label="发起时间" align="center" prop="createTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="当前任务" align="center" prop="name" min-width="150" />
      <el-table-column label="任务开始时间" align="center" prop="createTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="任务结束时间" align="center" prop="endTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.endTime) }}</template>
      </el-table-column>
      <el-table-column label="审批人" align="center" min-width="110">
        <template v-slot="scope">{{ userName(scope.row.assigneeUser) }}</template>
      </el-table-column>
      <el-table-column label="审批状态" align="center" prop="status" width="120">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.BPM_TASK_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="审批建议" align="center" prop="reason" min-width="180" show-overflow-tooltip />
      <el-table-column label="耗时" align="center" prop="durationInMillis" width="160">
        <template v-slot="scope">{{ formatPast2(scope.row.durationInMillis) }}</template>
      </el-table-column>
      <el-table-column label="流程编号" align="center" prop="processInstanceId" min-width="220" show-overflow-tooltip />
      <el-table-column label="任务编号" align="center" prop="id" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" align="center" fixed="right" width="80">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="handleDetail(scope.row)">历史</el-button>
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
  </div>
</template>

<script>
import { getTaskManagerPage } from '@/api/bpm/task'
import { formatPast2 } from '@/utils'

export default {
  name: 'BpmManagerTask',
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatPast2,
    userName(user) {
      return user ? (user.nickname || user.name || user.id) : ''
    },
    async getList() {
      this.loading = true
      try {
        const response = await getTaskManagerPage(this.queryParams)
        this.list = response.data.list || []
        this.total = response.data.total || 0
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
    },
    handleDetail(row) {
      this.$router.push({ name: 'BpmProcessInstanceDetail', query: { id: row.processInstance && row.processInstance.id } })
    }
  }
}
</script>
