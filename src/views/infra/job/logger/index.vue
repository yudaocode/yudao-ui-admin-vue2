<template>
  <div class="app-container">
    <doc-alert title="定时任务" url="https://doc.iocoder.cn/job/" />
    <doc-alert title="异步任务" url="https://doc.iocoder.cn/async-task/" />
    <doc-alert title="消息队列" url="https://doc.iocoder.cn/message-queue/" />
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch" label-width="120px">
      <el-form-item label="处理器的名字" prop="handlerName"><el-input v-model="queryParams.handlerName" placeholder="请输入处理器的名字" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="开始执行时间" prop="beginTime"><el-date-picker v-model="queryParams.beginTime" type="date" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择开始执行时间" clearable /></el-form-item>
      <el-form-item label="结束执行时间" prop="endTime"><el-date-picker v-model="queryParams.endTime" type="date" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择结束执行时间" clearable /></el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择任务状态" clearable>
          <el-option v-for="dict in getDictDatas(DICT_TYPE.INFRA_JOB_LOG_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button><el-button type="success" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport" v-hasPermi="['infra:job:export']">导出</el-button></el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8"><right-toolbar :showSearch.sync="showSearch" @queryTable="getList" /></el-row>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="日志编号" align="center" prop="id" />
      <el-table-column label="任务编号" align="center" prop="jobId" />
      <el-table-column label="处理器的名字" align="center" prop="handlerName" />
      <el-table-column label="处理器的参数" align="center" prop="handlerParam" />
      <el-table-column label="第几次执行" align="center" prop="executeIndex" />
      <el-table-column label="执行时间" align="center" width="180"><template v-slot="scope">{{ parseTime(scope.row.beginTime) }} ~ {{ parseTime(scope.row.endTime) }}</template></el-table-column>
      <el-table-column label="执行时长" align="center" prop="duration"><template v-slot="scope">{{ scope.row.duration }} 毫秒</template></el-table-column>
      <el-table-column label="任务状态" align="center" prop="status"><template v-slot="scope"><dict-tag :type="DICT_TYPE.INFRA_JOB_LOG_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="操作" align="center" width="80"><template v-slot="scope"><el-button size="mini" type="text" icon="el-icon-view" @click="openDetail(scope.row.id)" v-hasPermi="['infra:job:query']">详细</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <job-log-detail ref="detailRef" />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { getJobLogPage, exportJobLog } from '@/api/infra/jobLog'
import JobLogDetail from './JobLogDetail.vue'

export default {
  name: 'InfraJobLog',
  components: { JobLogDetail },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      exportLoading: false,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, jobId: undefined, handlerName: undefined, beginTime: undefined, endTime: undefined, status: undefined }
    }
  },
  created() {
    this.queryParams.jobId = this.$route.query && this.$route.query.id
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return getJobLogPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    openDetail(id) { this.$refs.detailRef.open(id) },
    handleExport() {
      const params = Object.assign({}, this.queryParams, {
        pageNo: undefined,
        pageSize: undefined
      })
      this.$modal.confirm('是否确认导出所有定时任务日志数据项?').then(() => {
        this.exportLoading = true
        return exportJobLog(params)
      }).then(response => this.$download.excel(response, '定时任务日志.xls')).catch(() => {}).finally(() => { this.exportLoading = false })
    }
  }
}
</script>
