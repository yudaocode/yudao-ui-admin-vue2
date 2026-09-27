<!-- MES 工作记录列表 -->
<template>
  <div class="app-container"><doc-alert
                               title="【生产】工作记录"
                               url="https://doc.iocoder.cn/mes/pro/work-record/"
                             /><work-record-status-bar @change="getList" />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
      size="small"
      @submit.native.prevent
    ><el-form-item
      label="用户"
      prop="userId"
    ><user-select-v2
      v-model="queryParams.userId"
      placeholder="请选择用户"
    /></el-form-item><el-form-item
      label="工作站"
      prop="workstationId"
    ><md-workstation-select
      v-model="queryParams.workstationId"
      placeholder="请选择工作站"
    /></el-form-item><el-form-item
      label="操作类型"
      prop="type"
    ><el-select
      v-model="queryParams.type"
      placeholder="请选择操作类型"
      clearable
    ><el-option
      v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_WORK_RECORD_TYPE)"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
    /></el-select></el-form-item><el-form-item
      label="操作时间"
      prop="createTime"
    ><el-date-picker
      v-model="queryParams.createTime"
      value-format="yyyy-MM-dd HH:mm:ss"
      type="daterange"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :default-time="['00:00:00', '23:59:59']"
    /></el-form-item><el-form-item><el-button
      icon="el-icon-search"
      @click="handleQuery"
    >搜索</el-button><el-button
      icon="el-icon-refresh"
      @click="resetQuery"
    >重置</el-button><el-button
      v-hasPermi="['mes:pro-workrecord:export']"
      type="success"
      plain
      icon="el-icon-download"
      :loading="exportLoading"
      @click="handleExport"
    >导出</el-button></el-form-item></el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
      row-key="id"
    ><el-table-column
      label="编号"
      align="center"
      prop="id"
      width="80"
    /><el-table-column
      label="用户"
      align="center"
      prop="userNickname"
    /><el-table-column
      label="工作站编码"
      align="center"
      prop="workstationCode"
    /><el-table-column
      label="工作站名称"
      align="center"
      prop="workstationName"
    /><el-table-column
      label="操作类型"
      align="center"
      prop="type"
      width="100"
    ><template #default="scope"><dict-tag
      :type="DICT_TYPE.MES_PRO_WORK_RECORD_TYPE"
      :value="scope.row.type"
    /></template></el-table-column><el-table-column
      label="创建时间"
      align="center"
      prop="createTime"
      :formatter="dateFormatter"
      width="180"
    /></el-table>
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
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/plugins/download'
import { ProWorkRecordApi } from '@/api/mes/pro/workrecord'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import WorkRecordStatusBar from './WorkRecordStatusBar.vue'

export default {
  name: 'MesProWorkRecordLog', components: { MdWorkstationSelect, UserSelectV2, WorkRecordStatusBar },
  data() { return { DICT_TYPE, loading: true, total: 0, list: [], exportLoading: false, queryParams: { pageNo: 1, pageSize: 10, userId: undefined, workstationId: undefined, type: undefined, createTime: undefined }} },
  created() { this.getList() },
  methods: {
    dateFormatter, getIntDictOptions,
    async getList() { this.loading = true; try { const response = await ProWorkRecordApi.getWorkRecordLogPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.$refs.queryForm.resetFields(); return this.handleQuery() },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有工作记录？'); this.exportLoading = true; const response = await ProWorkRecordApi.exportWorkRecordLog(this.queryParams); download.excel(response, '工作记录.xls') } catch (error) { /* canceled */ } finally { this.exportLoading = false } }
  }
}
</script>
