<!-- MES 生产工单弹窗选择器 -->
<template>
  <el-dialog
    title="生产工单选择"
    :visible.sync="dialogVisible"
    width="80%"
    append-to-body
  ><el-alert
     v-if="type != null"
     :title="'仅展示【' + getDictLabel(DICT_TYPE.MES_PRO_WORK_ORDER_TYPE, type) + '】类型的工单'"
     type="info"
     :closable="false"
     show-icon
     class="type-alert"
   /><el-form
     :inline="true"
     :model="queryParams"
     label-width="80px"
     size="small"
     @submit.native.prevent
   ><el-form-item label="工单编码"><el-input
     v-model="queryParams.code"
     placeholder="请输入工单编码"
     clearable
     @keyup.enter.native="handleQuery"
   /></el-form-item><el-form-item label="工单名称"><el-input
     v-model="queryParams.name"
     placeholder="请输入工单名称"
     clearable
     @keyup.enter.native="handleQuery"
   /></el-form-item><el-form-item label="产品"><md-item-select
     v-model="queryParams.productId"
     placeholder="请选择产品"
   /></el-form-item><el-form-item label="客户"><md-client-select
     v-model="queryParams.clientId"
     placeholder="请选择客户"
   /></el-form-item><el-form-item label="工单状态"><el-select
     v-model="queryParams.status"
     placeholder="请选择状态"
     clearable
   ><el-option
     v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_WORK_ORDER_STATUS)"
     :key="dict.value"
     :label="dict.label"
     :value="dict.value"
   /></el-select></el-form-item><el-form-item><el-button
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
      label="工单编码"
      align="center"
      prop="code"
      width="180"
    /><el-table-column
      label="工单名称"
      align="center"
      prop="name"
      min-width="200"
    /><el-table-column
      label="工单来源"
      align="center"
      prop="orderSourceType"
      width="100"
    ><template #default="scope"><dict-tag
      :type="DICT_TYPE.MES_PRO_WORK_ORDER_SOURCE_TYPE"
      :value="scope.row.orderSourceType"
    /></template></el-table-column><el-table-column
      label="订单编号"
      align="center"
      prop="orderSourceCode"
      width="140"
    /><el-table-column
      label="产品编号"
      align="center"
      prop="productCode"
      width="120"
    /><el-table-column
      label="产品名称"
      align="center"
      prop="productName"
      min-width="200"
    /><el-table-column
      label="规格型号"
      align="center"
      prop="productSpecification"
      min-width="120"
    /><el-table-column
      label="单位"
      align="center"
      prop="unitMeasureName"
      width="80"
    /><el-table-column
      label="工单数量"
      align="center"
      prop="quantity"
      width="100"
    /><el-table-column
      label="客户编码"
      align="center"
      prop="clientCode"
      width="120"
    /><el-table-column
      label="客户名称"
      align="center"
      prop="clientName"
      min-width="120"
    /><el-table-column
      label="工单状态"
      align="center"
      prop="status"
      width="100"
    ><template #default="scope"><dict-tag
      :type="DICT_TYPE.MES_PRO_WORK_ORDER_STATUS"
      :value="scope.row.status"
    /></template></el-table-column><el-table-column
      label="需求日期"
      align="center"
      prop="requestDate"
      :formatter="dateFormatter2"
      width="120"
    /></el-table><pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /><span slot="footer"><el-button
      type="primary"
      @click="confirmSelect"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span></el-dialog>
</template>

<script>
import { dateFormatter2 } from '@/utils/formatTime'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
import { ProWorkOrderApi } from '@/api/mes/pro/workorder'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'

export default {
  name: 'ProWorkOrderSelectDialog', components: { MdItemSelect, MdClientSelect }, props: { multiple: { type: Boolean, default: true }, status: Number, type: Number },
  data() { return { DICT_TYPE, dialogVisible: false, loading: false, list: [], total: 0, selectedRows: [], selectedRadioId: undefined, currentRadioRow: undefined, preSelectedIds: [], queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, productId: undefined, clientId: undefined, status: undefined, type: undefined }} },
  methods: {
    dateFormatter2, getDictLabel, getIntDictOptions, handleSelectionChange(rows) { if (this.multiple) this.selectedRows = rows }, handleRadioChange(row) { this.currentRadioRow = row }, handleRowClick(row) { if (!this.multiple) { this.selectedRadioId = row.id; this.currentRadioRow = row } }, handleRowDblClick(row) { if (this.multiple) { this.$refs.table.toggleRowSelection(row); return } this.handleRowClick(row); this.confirmSelect() },
    async getList() { this.loading = true; try { const response = await ProWorkOrderApi.getWorkOrderPage(this.queryParams); this.list = response.data.list; this.total = response.data.total; await this.$nextTick(); this.applyPreSelection() } finally { this.loading = false } },
    applyPreSelection() { if (!this.preSelectedIds.length) return; if (this.multiple) this.list.forEach(row => { if (this.preSelectedIds.includes(row.id)) this.$refs.table.toggleRowSelection(row, true) }); else { const row = this.list.find(item => this.preSelectedIds.includes(item.id)); if (row) { this.selectedRadioId = row.id; this.currentRadioRow = row } } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { Object.assign(this.queryParams, { code: undefined, name: undefined, productId: undefined, clientId: undefined, status: this.status, type: this.type }); return this.handleQuery() },
    confirmSelect() { const rows = this.multiple ? this.selectedRows : (this.currentRadioRow ? [this.currentRadioRow] : []); if (!rows.length) { this.$modal.msgWarning(this.multiple ? '请至少选择一条数据' : '请选择一条数据'); return } this.$emit('selected', rows); this.dialogVisible = false },
    async open(selectedIds) { this.dialogVisible = true; Object.assign(this.queryParams, { code: undefined, name: undefined, productId: undefined, clientId: undefined, status: this.status, type: this.type, pageNo: 1 }); this.selectedRows = []; this.selectedRadioId = undefined; this.currentRadioRow = undefined; this.preSelectedIds = selectedIds || []; await this.$nextTick(); if (this.$refs.table) this.$refs.table.clearSelection(); await this.getList() }
  }
}
</script>

<style scoped>.radio-no-label >>> .el-radio__label { display: none; }.type-alert { margin-bottom: 10px; }</style>
