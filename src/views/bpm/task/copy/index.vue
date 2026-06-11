<template>
  <div class="app-container">
    <doc-alert title="审批转办、委派、抄送" url="https://doc.iocoder.cn/bpm/task-delegation-and-cc/" />

    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch" label-width="72px">
      <el-form-item label="流程名称" prop="processInstanceName">
        <el-input
          v-model="queryParams.processInstanceName"
          placeholder="请输入流程名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="抄送时间" prop="createTime">
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
      <el-table-column label="流程名" align="center" prop="processInstanceName" min-width="180" />
      <el-table-column label="摘要" min-width="180">
        <template v-slot="scope">
          <div v-if="scope.row.summary && scope.row.summary.length">
            <div v-for="(item, index) in scope.row.summary" :key="index" class="task-summary-item">
              {{ item.key }} : {{ item.value }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="流程发起人" align="center" min-width="100">
        <template v-slot="scope">{{ userName(scope.row.startUser) }}</template>
      </el-table-column>
      <el-table-column label="流程发起时间" align="center" prop="processInstanceStartTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.processInstanceStartTime) }}</template>
      </el-table-column>
      <el-table-column label="抄送节点" align="center" prop="activityName" min-width="180" />
      <el-table-column label="抄送人" align="center" min-width="100">
        <template v-slot="scope">{{ userName(scope.row.createUser) || '系统' }}</template>
      </el-table-column>
      <el-table-column label="抄送意见" align="center" prop="reason" width="150" />
      <el-table-column label="抄送时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="80">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="handleDetail(scope.row)">详情</el-button>
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
import { getProcessInstanceCopyPage } from '@/api/bpm/processInstance'

export default {
  name: 'BpmProcessInstanceCopy',
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        processInstanceId: '',
        processInstanceName: '',
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    userName(user) {
      return user ? (user.nickname || user.name || user.id) : ''
    },
    async getList() {
      this.loading = true
      try {
        const response = await getProcessInstanceCopyPage(this.queryParams)
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
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: {
          id: row.processInstanceId,
          activityId: row.activityId || undefined
        }
      })
    }
  }
}
</script>

<style scoped>
.task-summary-item {
  color: #909399;
  line-height: 20px;
}
</style>
