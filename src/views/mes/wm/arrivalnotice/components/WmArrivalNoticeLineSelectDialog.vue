<!-- MES 到货通知单行弹窗选择器 -->
<template><el-dialog
  title="到货通知单行选择"
  :visible.sync="dialogVisible"
  width="70%"
  append-to-body
><el-table
  v-loading="loading"
  :data="list"
  stripe
  :show-overflow-tooltip="true"
  row-key="id"
  highlight-current-row
  @row-click="handleRowClick"
  @row-dblclick="handleRowDblClick"
><el-table-column
  width="50"
  align="center"
><template #default="scope"><el-radio
  v-model="selectedRadioId"
  :label="scope.row.id"
  class="radio-no-label"
  @change="currentRadioRow = scope.row"
>&nbsp;</el-radio></template></el-table-column><el-table-column
  label="物料编码"
  align="center"
  prop="itemCode"
  width="120"
/><el-table-column
  label="物料名称"
  align="center"
  prop="itemName"
  min-width="150"
/><el-table-column
  label="规格型号"
  align="center"
  prop="specification"
  min-width="120"
/><el-table-column
  label="单位"
  align="center"
  prop="unitMeasureName"
  width="80"
/><el-table-column
  label="到货数量"
  align="center"
  prop="arrivalQuantity"
  width="100"
/><el-table-column
  label="是否检验"
  align="center"
  prop="iqcCheckFlag"
  width="90"
><template #default="scope"><el-tag
  :type="scope.row.iqcCheckFlag ? 'success' : 'info'"
  size="small"
>{{ scope.row.iqcCheckFlag ? '是' : '否' }}</el-tag></template></el-table-column><el-table-column
  label="合格数量"
  align="center"
  prop="qualifiedQuantity"
  width="100"
/><el-table-column
  label="检验单号"
  align="center"
  prop="iqcCode"
  width="140"
/><el-table-column
  label="备注"
  align="center"
  prop="remark"
  min-width="120"
/></el-table><pagination
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
import { WmArrivalNoticeLineApi } from '@/api/mes/wm/arrivalnotice/line'
export default {
  name: 'WmArrivalNoticeLineSelectDialog', props: { noticeId: Number },
  data() { return { dialogVisible: false, loading: false, list: [], total: 0, selectedRadioId: undefined, currentRadioRow: undefined, preSelectedIds: [], queryParams: { pageNo: 1, pageSize: 10, noticeId: undefined }} },
  methods: {
    handleRowClick(row) { this.selectedRadioId = row.id; this.currentRadioRow = row }, handleRowDblClick(row) { this.handleRowClick(row); this.confirmSelect() },
    async getList() { if (!this.noticeId) { this.list = []; this.total = 0; return } this.loading = true; try { this.queryParams.noticeId = this.noticeId; const data = (await WmArrivalNoticeLineApi.getArrivalNoticeLinePage(this.queryParams)).data; this.list = data.list; this.total = data.total; const row = this.list.find(item => this.preSelectedIds.includes(item.id)); if (row) this.handleRowClick(row) } finally { this.loading = false } },
    confirmSelect() { if (!this.currentRadioRow) return this.$modal.msgWarning('请选择一条数据'); this.$emit('selected', [this.currentRadioRow]); this.dialogVisible = false },
    async open(selectedIds) { this.dialogVisible = true; this.queryParams.pageNo = 1; this.selectedRadioId = undefined; this.currentRadioRow = undefined; this.preSelectedIds = selectedIds || []; await this.getList() }
  }
}
</script>
<style scoped>.radio-no-label /deep/ .el-radio__label { display: none; }</style>
