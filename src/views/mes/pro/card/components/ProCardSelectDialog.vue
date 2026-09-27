<!-- MES 流转卡弹窗选择器 -->
<template>
  <el-dialog
    title="流转卡选择"
    :visible.sync="dialogVisible"
    width="70%"
    append-to-body
  ><el-form
     :inline="true"
     :model="queryParams"
     label-width="100px"
     size="small"
     @submit.native.prevent
   ><el-form-item label="流转卡编号" prop="code"><el-input
     v-model="queryParams.code"
     placeholder="请输入流转卡编号"
     clearable
     @keyup.enter.native="handleQuery"
   /></el-form-item><el-form-item label="生产工单" prop="workOrderId"><pro-work-order-select
     v-model="queryParams.workOrderId"
     placeholder="请选择工单"
   /></el-form-item><el-form-item label="产品物料" prop="itemId"><md-item-select
     v-model="queryParams.itemId"
     placeholder="请选择产品物料"
   /></el-form-item><el-form-item label="批次号" prop="batchCode"><el-input
     v-model="queryParams.batchCode"
     placeholder="请输入批次号"
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
      label="流转卡编号"
      align="center"
      prop="code"
      width="160"
    /><el-table-column
      label="生产工单编号"
      align="center"
      prop="workOrderCode"
      width="160"
    /><el-table-column
      label="产品物料编码"
      align="center"
      prop="itemCode"
      width="140"
    /><el-table-column
      label="批次号"
      align="center"
      prop="batchCode"
      width="120"
    /><el-table-column
      label="产品物料名称"
      align="left"
      prop="itemName"
      min-width="150"
    /><el-table-column
      label="规格型号"
      align="center"
      prop="specification"
      width="120"
    /><el-table-column
      label="单位"
      align="center"
      prop="unitMeasureName"
      width="80"
    /><el-table-column
      label="流转数量"
      align="center"
      prop="transferedQuantity"
      width="100"
    /></el-table><pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <span slot="footer"><el-button
      type="primary"
      @click="confirmSelect"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span></el-dialog>
</template>

<script>
import { ProCardApi } from '@/api/mes/pro/card'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'

export default {
  name: 'ProCardSelectDialog', components: { ProWorkOrderSelect, MdItemSelect }, props: { multiple: { type: Boolean, default: true }},
  data() { return { dialogVisible: false, loading: false, list: [], total: 0, selectedRows: [], selectedRadioId: undefined, currentRadioRow: undefined, preSelectedIds: [], queryParams: { pageNo: 1, pageSize: 10, code: undefined, workOrderId: undefined, itemId: undefined, batchCode: undefined }} },
  methods: {
    handleSelectionChange(rows) { if (this.multiple) this.selectedRows = rows }, handleRadioChange(row) { this.currentRadioRow = row }, handleRowClick(row) { if (!this.multiple) { this.selectedRadioId = row.id; this.currentRadioRow = row } }, handleRowDblClick(row) { if (this.multiple) { this.$refs.table.toggleRowSelection(row); return } this.handleRowClick(row); this.confirmSelect() },
    async getList() { this.loading = true; try { const response = await ProCardApi.getCardPage(this.queryParams); this.list = response.data.list; this.total = response.data.total; await this.$nextTick(); this.applyPreSelection() } finally { this.loading = false } },
    applyPreSelection() { if (!this.preSelectedIds.length) return; if (this.multiple) this.list.forEach(row => { if (this.preSelectedIds.includes(row.id)) this.$refs.table.toggleRowSelection(row, true) }); else { const row = this.list.find(item => this.preSelectedIds.includes(item.id)); if (row) { this.selectedRadioId = row.id; this.currentRadioRow = row } } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { Object.assign(this.queryParams, { code: undefined, workOrderId: undefined, itemId: undefined, batchCode: undefined }); return this.handleQuery() },
    confirmSelect() { const rows = this.multiple ? this.selectedRows : (this.currentRadioRow ? [this.currentRadioRow] : []); if (!rows.length) { this.$modal.msgWarning(this.multiple ? '请至少选择一条数据' : '请选择一条数据'); return } this.$emit('selected', rows); this.dialogVisible = false },
    async open(selectedIds) { this.dialogVisible = true; Object.assign(this.queryParams, { code: undefined, workOrderId: undefined, itemId: undefined, batchCode: undefined, pageNo: 1 }); this.selectedRows = []; this.selectedRadioId = undefined; this.currentRadioRow = undefined; this.preSelectedIds = selectedIds || []; await this.$nextTick(); if (this.$refs.table) this.$refs.table.clearSelection(); await this.getList() }
  }
}
</script>

<style scoped>.radio-no-label >>> .el-radio__label { display: none; }</style>
