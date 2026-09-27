<!-- MES 生产任务弹窗选择器 -->
<template><el-dialog
  title="生产任务选择"
  :visible.sync="dialogVisible"
  width="80%"
  append-to-body
><el-alert
   v-if="statuses && statuses.length"
   :title="'仅展示状态为【' + statuses.map(status => getDictLabel(DICT_TYPE.MES_PRO_TASK_STATUS, status)).join('、') + '】的任务'"
   type="info"
   :closable="false"
   show-icon
   class="status-alert"
 /><el-form
   :inline="true"
   :model="queryParams"
   label-width="100px"
   size="small"
   @submit.native.prevent
 ><el-form-item label="所属工序"><pro-process-select
   v-model="queryParams.processId"
   placeholder="请选择工序"
 /></el-form-item><el-form-item label="生产工单"><pro-work-order-select
   v-model="queryParams.workOrderId"
   placeholder="请选择生产工单"
 /></el-form-item><el-form-item label="工作站"><md-workstation-select
   v-model="queryParams.workstationId"
   placeholder="请选择工作站"
 /></el-form-item><el-form-item label="任务编号"><el-input
   v-model="queryParams.code"
   placeholder="请输入任务编号"
   clearable
   @keyup.enter.native="handleQuery"
 /></el-form-item><el-form-item label="任务名称"><el-input
   v-model="queryParams.name"
   placeholder="请输入任务名称"
   clearable
   @keyup.enter.native="handleQuery"
 /></el-form-item><el-form-item><el-button
   icon="el-icon-search"
   @click="handleQuery"
 >搜索</el-button><el-button
   icon="el-icon-refresh"
   @click="resetQuery"
 >重置</el-button></el-form-item></el-form>
  <el-table
    ref="table"
    v-loading="loading"
    :data="list"
    stripe
    show-overflow-tooltip
    row-key="id"
    :highlight-current-row="!multiple"
    @selection-change="handleSelectionChange"
    @row-click="handleRowClick"
    @row-dblclick="handleRowDblClick"
  ><el-table-column
    v-if="multiple"
    type="selection"
    reserve-selection
    width="50"
    align="center"
  /><el-table-column
    v-else
    width="50"
    align="center"
  ><template #default="scope"><el-radio
    v-model="selectedRadioId"
    :label="scope.row.id"
    class="radio-no-label"
    @change="handleRadioChange(scope.row)"
  /></template></el-table-column><el-table-column
    label="任务编号"
    align="center"
    prop="code"
    width="180"
  /><el-table-column
    label="任务名称"
    align="left"
    prop="name"
    min-width="140"
  /><el-table-column
    label="工作站编码"
    align="center"
    prop="workstationCode"
    width="140"
  /><el-table-column
    label="工作站名称"
    align="center"
    prop="workstationName"
    width="140"
  /><el-table-column
    label="工序"
    align="center"
    prop="processName"
    width="120"
  /><el-table-column
    label="是否质检"
    align="center"
    prop="checkFlag"
    width="100"
  ><template #default="scope"><dict-tag
    :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
    :value="scope.row.checkFlag"
  /></template></el-table-column><el-table-column
    label="物料编码"
    align="center"
    prop="itemCode"
    width="140"
  /><el-table-column
    label="物料名称"
    align="center"
    prop="itemName"
    width="140"
  /><el-table-column
    label="规格型号"
    align="center"
    prop="itemSpecification"
    width="120"
  /><el-table-column
    label="排产数量"
    align="center"
    prop="quantity"
    width="100"
  /><el-table-column
    label="已生产数量"
    align="center"
    prop="producedQuantity"
    width="110"
  /><el-table-column
    label="开始生产时间"
    align="center"
    prop="startTime"
    width="170"
  ><template #default="scope">{{ formatDate(scope.row.startTime, 'YYYY-MM-DD HH:mm') }}</template></el-table-column><el-table-column
    label="生产时长"
    align="center"
    prop="duration"
    width="100"
  /><el-table-column
    label="预计完成时间"
    align="center"
    prop="endTime"
    width="170"
  ><template #default="scope">{{ formatDate(scope.row.endTime, 'YYYY-MM-DD HH:mm') }}</template></el-table-column><el-table-column
    label="任务状态"
    align="center"
    prop="status"
    width="100"
  ><template #default="scope"><dict-tag
    :type="DICT_TYPE.MES_PRO_TASK_STATUS"
    :value="scope.row.status"
  /></template></el-table-column></el-table><pagination
    v-show="total > 0"
    :total="total"
    :page.sync="queryParams.pageNo"
    :limit.sync="queryParams.pageSize"
    @pagination="getList"
  /><span slot="footer"><el-button
    type="primary"
    @click="confirmSelect"
  >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span></el-dialog></template>

<script>
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { ProTaskApi } from '@/api/mes/pro/task'
import ProProcessSelect from '@/views/mes/pro/process/components/ProProcessSelect.vue'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'

export default {
  name: 'ProTaskSelectDialog', components: { ProProcessSelect, ProWorkOrderSelect, MdWorkstationSelect }, props: { multiple: { type: Boolean, default: true }, statuses: Array },
  data() { return { DICT_TYPE, dialogVisible: false, loading: false, list: [], total: 0, selectedRows: [], selectedRadioId: undefined, currentRadioRow: undefined, preSelectedIds: [], externalWorkstationId: undefined, queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, processId: undefined, workOrderId: undefined, workstationId: undefined, statuses: undefined }} },
  methods: {
    formatDate, getDictLabel, handleSelectionChange(rows) { if (this.multiple) this.selectedRows = rows }, handleRadioChange(row) { this.currentRadioRow = row }, handleRowClick(row) { if (!this.multiple) { this.selectedRadioId = row.id; this.currentRadioRow = row } }, handleRowDblClick(row) { if (this.multiple) { this.$refs.table.toggleRowSelection(row); return } this.handleRowClick(row); this.confirmSelect() },
    async getList() { this.loading = true; try { const response = await ProTaskApi.getTaskPage(this.queryParams); this.list = response.data.list; this.total = response.data.total; await this.$nextTick(); this.applyPreSelection() } finally { this.loading = false } }, applyPreSelection() { if (!this.preSelectedIds.length) return; if (this.multiple) this.list.forEach(row => { if (this.preSelectedIds.includes(row.id)) this.$refs.table.toggleRowSelection(row, true) }); else { const row = this.list.find(item => this.preSelectedIds.includes(item.id)); if (row) { this.selectedRadioId = row.id; this.currentRadioRow = row } } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { Object.assign(this.queryParams, { code: undefined, name: undefined, processId: undefined, workOrderId: undefined, workstationId: this.externalWorkstationId, statuses: this.statuses }); return this.handleQuery() }, confirmSelect() { const rows = this.multiple ? this.selectedRows : (this.currentRadioRow ? [this.currentRadioRow] : []); if (!rows.length) { this.$modal.msgWarning(this.multiple ? '请至少选择一条数据' : '请选择一条数据'); return } this.$emit('selected', rows); this.dialogVisible = false },
    async open(selectedIds, workOrderId, workstationId) { this.dialogVisible = true; this.externalWorkstationId = workstationId; Object.assign(this.queryParams, { code: undefined, name: undefined, processId: undefined, workOrderId, workstationId, statuses: this.statuses, pageNo: 1 }); this.selectedRows = []; this.selectedRadioId = undefined; this.currentRadioRow = undefined; this.preSelectedIds = selectedIds || []; await this.$nextTick(); if (this.$refs.table) this.$refs.table.clearSelection(); await this.getList() }
  }
}
</script>

<style scoped>.radio-no-label >>> .el-radio__label { display: none; }.status-alert { margin-bottom: 10px; }</style>
