<!-- MES 到货通知单弹窗选择器 -->
<template>
  <el-dialog
    title="到货通知单选择"
    :visible.sync="dialogVisible"
    width="70%"
    append-to-body
  >
    <el-form
      :inline="true"
      :model="queryParams"
      label-width="100px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item label="通知单编号"><el-input
        v-model="queryParams.code"
        placeholder="请输入通知单编号"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item label="通知单名称"><el-input
        v-model="queryParams.name"
        placeholder="请输入通知单名称"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item label="采购订单编号"><el-input
        v-model="queryParams.purchaseOrderCode"
        placeholder="请输入采购订单编号"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item label="供应商"><md-vendor-select
        v-model="queryParams.vendorId"
        class="field"
      /></el-form-item>
      <el-form-item label="到货日期"><el-date-picker
        v-model="queryParams.arrivalDate"
        type="daterange"
        value-format="yyyy-MM-dd HH:mm:ss"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['00:00:00', '23:59:59']"
      /></el-form-item>
      <el-form-item label="单据状态"><el-select
        v-model="queryParams.status"
        placeholder="请选择单据状态"
        clearable
        class="field"
      ><el-option
        v-for="dict in statusOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item><el-button
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button></el-form-item>
    </el-form>
    <el-table
      ref="table"
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      row-key="id"
      :highlight-current-row="!multiple"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
    >
      <el-table-column
        v-if="multiple"
        type="selection"
        :reserve-selection="true"
        width="50"
        align="center"
      />
      <el-table-column
        v-else
        width="50"
        align="center"
      ><template #default="scope"><el-radio
        v-model="selectedRadioId"
        :label="scope.row.id"
        class="radio-no-label"
        @change="handleRadioChange(scope.row)"
      >&nbsp;</el-radio></template></el-table-column>
      <el-table-column
        label="通知单编号"
        align="center"
        prop="code"
        width="180"
      /><el-table-column
        label="通知单名称"
        align="left"
        prop="name"
        min-width="150"
      /><el-table-column
        label="采购订单编号"
        align="center"
        prop="purchaseOrderCode"
        width="160"
      /><el-table-column
        label="供应商名称"
        align="center"
        prop="vendorName"
        width="160"
      /><el-table-column
        label="联系人"
        align="center"
        prop="contactName"
        width="100"
      /><el-table-column
        label="联系方式"
        align="center"
        prop="contactTelephone"
        width="130"
      />
      <el-table-column
        label="到货日期"
        align="center"
        prop="arrivalDate"
        width="120"
      ><template #default="scope">{{ formatDay(scope.row.arrivalDate) }}</template></el-table-column>
      <el-table-column
        label="单据状态"
        align="center"
        prop="status"
        width="100"
      ><template #default="scope"><dict-tag
        :type="ARRIVAL_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <span slot="footer"><el-button
      type="primary"
      @click="confirmSelect"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>
<script>
import { getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { WmArrivalNoticeApi } from '@/api/mes/wm/arrivalnotice'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
const ARRIVAL_STATUS = 'mes_wm_arrival_notice_status'
export default {
  name: 'WmArrivalNoticeSelectDialog', components: { MdVendorSelect }, props: { multiple: { type: Boolean, default: true }, status: Number },
  data() { return { ARRIVAL_STATUS, statusOptions: getIntDictOptions(ARRIVAL_STATUS), dialogVisible: false, loading: false, list: [], total: 0, selectedRows: [], selectedRadioId: undefined, currentRadioRow: undefined, preSelectedIds: [], queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, purchaseOrderCode: undefined, vendorId: undefined, arrivalDate: undefined, status: undefined }} },
  methods: {
    formatDay(value) { return formatDate(value, 'YYYY-MM-DD') },
    handleSelectionChange(rows) { if (this.multiple) this.selectedRows = rows }, handleRadioChange(row) { this.currentRadioRow = row }, handleRowClick(row) { if (!this.multiple) { this.selectedRadioId = row.id; this.currentRadioRow = row } },
    handleRowDblClick(row) { if (this.multiple) this.$refs.table.toggleRowSelection(row); else { this.selectedRadioId = row.id; this.currentRadioRow = row; this.confirmSelect() } },
    async getList() { this.loading = true; try { const data = (await WmArrivalNoticeApi.getArrivalNoticePage(this.queryParams)).data; this.list = data.list; this.total = data.total; await this.$nextTick(); this.applyPreSelection() } finally { this.loading = false } },
    applyPreSelection() { if (!this.preSelectedIds.length) return; if (this.multiple) this.list.forEach(row => { if (this.preSelectedIds.includes(row.id)) this.$refs.table.toggleRowSelection(row, true) }); else { const row = this.list.find(item => this.preSelectedIds.includes(item.id)); if (row) { this.selectedRadioId = row.id; this.currentRadioRow = row } } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() },
    resetQuery() { Object.assign(this.queryParams, { code: undefined, name: undefined, purchaseOrderCode: undefined, vendorId: undefined, arrivalDate: undefined, status: this.status }); return this.handleQuery() },
    confirmSelect() { if (this.multiple) { if (!this.selectedRows.length) return this.$modal.msgWarning('请至少选择一条数据'); this.$emit('selected', this.selectedRows) } else { if (!this.currentRadioRow) return this.$modal.msgWarning('请选择一条数据'); this.$emit('selected', [this.currentRadioRow]) } this.dialogVisible = false },
    async open(selectedIds) { this.dialogVisible = true; Object.assign(this.queryParams, { pageNo: 1, code: undefined, name: undefined, purchaseOrderCode: undefined, vendorId: undefined, arrivalDate: undefined, status: this.status != null ? this.status : undefined }); this.selectedRows = []; this.selectedRadioId = undefined; this.currentRadioRow = undefined; this.preSelectedIds = selectedIds || []; await this.$nextTick(); if (this.$refs.table) this.$refs.table.clearSelection(); await this.getList() }
  }
}
</script>
<style scoped>.field { width: 220px; }.radio-no-label /deep/ .el-radio__label { display: none; }</style>
