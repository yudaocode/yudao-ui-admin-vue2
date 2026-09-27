<!-- MES 安灯呼叫记录列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【生产】安灯配置、安灯呼叫"
      url="https://doc.iocoder.cn/mes/pro/andon/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="工作站"
        prop="workstationId"
      ><md-workstation-select
        v-model="queryParams.workstationId"
        placeholder="请选择工作站"
      /></el-form-item><el-form-item
        label="发起人"
        prop="userId"
      ><user-select-v2 v-model="queryParams.userId" /></el-form-item><el-form-item
        label="处置人"
        prop="handlerUserId"
      ><user-select-v2 v-model="queryParams.handlerUserId" /></el-form-item>
      <el-form-item
        label="处理状态"
        prop="status"
      ><el-select
        v-model="queryParams.status"
        placeholder="请选择状态"
        clearable
      ><el-option
        v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_ANDON_STATUS)"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item
        label="发起时间"
        prop="createTime"
      ><el-date-picker
        v-model="queryParams.createTime"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['00:00:00', '23:59:59']"
      /></el-form-item>
      <el-form-item><el-button
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button><el-button
        v-hasPermi="['mes:pro-andon-record:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openRecordForm('create')"
      >新增</el-button><el-button
        v-hasPermi="['mes:pro-andon-config:query']"
        type="warning"
        plain
        icon="el-icon-setting"
        @click="openConfigDialog"
      >安灯设置</el-button><el-button
        v-hasPermi="['mes:pro-andon-record:export']"
        type="success"
        plain
        icon="el-icon-download"
        :loading="exportLoading"
        @click="handleExport"
      >导出</el-button></el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
    ><el-table-column
       label="工作站编码"
       align="center"
       prop="workstationCode"
       width="120"
     /><el-table-column
       label="工作站名称"
       align="center"
       prop="workstationName"
       min-width="120"
     /><el-table-column
       label="工单编码"
       align="center"
       prop="workOrderCode"
       width="140"
     /><el-table-column
       label="工序名称"
       align="center"
       prop="processName"
       width="120"
     /><el-table-column
       label="发起人"
       align="center"
       prop="userNickname"
       width="100"
     /><el-table-column
       label="发起时间"
       align="center"
       prop="createTime"
       :formatter="dateFormatter"
       width="180"
     /><el-table-column
       label="呼叫原因"
       align="center"
       prop="reason"
       min-width="150"
     />
      <el-table-column
        label="级别"
        align="center"
        prop="level"
        width="80"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.MES_PRO_ANDON_LEVEL"
        :value="scope.row.level"
      /></template></el-table-column><el-table-column
        label="处理时间"
        align="center"
        prop="handleTime"
        :formatter="dateFormatter"
        width="180"
      /><el-table-column
        label="处理人"
        align="center"
        prop="handlerUserNickname"
        width="100"
      /><el-table-column
        label="处置状态"
        align="center"
        prop="status"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.MES_PRO_ANDON_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        fixed="right"
      ><template #default="scope"><el-button
        v-if="scope.row.status === MesProAndonStatusEnum.ACTIVE"
        v-hasPermi="['mes:pro-andon-record:update']"
        type="text"
        class="success-text"
        @click="openRecordForm('update', scope.row.id)"
      >处置</el-button><el-button
        v-hasPermi="['mes:pro-andon-record:query']"
        type="text"
        @click="openRecordForm('detail', scope.row.id)"
      >详情</el-button><el-button
        v-if="scope.row.status === MesProAndonStatusEnum.ACTIVE"
        v-hasPermi="['mes:pro-andon-record:delete']"
        type="text"
        class="danger-text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <andon-record-form
      ref="recordForm"
      @success="getList"
    /><andon-config-dialog ref="configDialog" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import download from '@/plugins/download'
import { ProAndonRecordApi } from '@/api/mes/pro/andon/record'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { MesProAndonStatusEnum } from '@/views/mes/utils/constants'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import AndonRecordForm from './AndonRecordForm.vue'
import AndonConfigDialog from '../config/AndonConfigForm.vue'

export default {
  name: 'MesProAndon', components: { MdWorkstationSelect, UserSelectV2, AndonRecordForm, AndonConfigDialog },
  data() { return { DICT_TYPE, MesProAndonStatusEnum, loading: true, total: 0, list: [], exportLoading: false, queryParams: { pageNo: 1, pageSize: 10, workstationId: undefined, userId: undefined, handlerUserId: undefined, status: undefined, createTime: undefined }} },
  created() { this.getList() },
  methods: {
    dateFormatter, getIntDictOptions,
    async getList() { this.loading = true; try { const response = await ProAndonRecordApi.getAndonRecordPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.$refs.queryForm.resetFields(); return this.handleQuery() }, openRecordForm(type, id) { this.$refs.recordForm.open(type, id) }, openConfigDialog() { this.$refs.configDialog.open() },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该安灯呼叫记录？'); await ProAndonRecordApi.deleteAndonRecord(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 用户取消或接口失败时保留当前列表 */ } },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有安灯呼叫记录？'); this.exportLoading = true; const response = await ProAndonRecordApi.exportAndonRecord(this.queryParams); download.excel(response, '安灯呼叫记录.xls') } catch (error) { /* 用户取消或接口失败时不触发下载 */ } finally { this.exportLoading = false } }
  }
}
</script>

<style scoped>.success-text { color: #67c23a; }.danger-text { color: #f56c6c; }</style>
