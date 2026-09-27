<!-- MES 工作站弹窗选择器 -->
<template>
  <el-dialog
    title="工作站选择"
    :visible.sync="dialogVisible"
    width="80%"
    append-to-body
  >
    <el-form
      :inline="true"
      :model="queryParams"
      label-width="85px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item label="工作站编码"><el-input
        v-model="queryParams.code"
        placeholder="请输入工作站编码"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item label="所属工序"><pro-process-select
        v-model="queryParams.processId"
        placeholder="请选择工序"
      /></el-form-item>
      <el-form-item label="所在车间"><md-workshop-select
        v-model="queryParams.workshopId"
        placeholder="请选择车间"
      /></el-form-item>
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
      show-overflow-tooltip
      row-key="id"
      :highlight-current-row="!multiple"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
    >
      <el-table-column
        v-if="multiple"
        type="selection"
        reserve-selection
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
      /></template></el-table-column>
      <el-table-column
        label="工作站编码"
        align="center"
        prop="code"
        width="140"
      /><el-table-column
        label="工作站名称"
        align="center"
        prop="name"
        min-width="160"
      />
      <el-table-column
        label="工作站地点"
        align="center"
        prop="address"
        min-width="140"
      /><el-table-column
        label="所在车间"
        align="center"
        prop="workshopName"
        width="120"
      />
      <el-table-column
        label="所属工序"
        align="center"
        prop="processName"
        width="120"
      /><el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="120"
      />
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
import { MdWorkstationApi } from '@/api/mes/md/workstation'
import { CommonStatusEnum } from '@/utils/constants'
import ProProcessSelect from '@/views/mes/pro/process/components/ProProcessSelect.vue'
import MdWorkshopSelect from './MdWorkshopSelect.vue'

export default {
  name: 'MdWorkstationSelectDialog',
  components: { ProProcessSelect, MdWorkshopSelect },
  props: { multiple: { type: Boolean, default: true }, processId: { type: Number, default: undefined }},
  data() {
    return {
      dialogVisible: false, loading: false, list: [], total: 0, selectedRows: [],
      selectedRadioId: undefined, currentRadioRow: undefined, preSelectedIds: [],
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, processId: undefined, workshopId: undefined, status: CommonStatusEnum.ENABLE }
    }
  },
  methods: {
    handleSelectionChange(rows) { if (this.multiple) this.selectedRows = rows },
    handleRadioChange(row) { this.currentRadioRow = row },
    handleRowClick(row) { if (!this.multiple) { this.selectedRadioId = row.id; this.currentRadioRow = row } },
    handleRowDblClick(row) {
      if (this.multiple) { this.$refs.table.toggleRowSelection(row); return }
      this.handleRowClick(row); this.confirmSelect()
    },
    async getList() {
      this.loading = true
      try {
        const response = await MdWorkstationApi.getWorkstationPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
        await this.$nextTick()
        this.applyPreSelection()
      } finally { this.loading = false }
    },
    applyPreSelection() {
      if (this.preSelectedIds.length === 0) return
      if (this.multiple) {
        this.list.forEach(row => { if (this.preSelectedIds.includes(row.id)) this.$refs.table.toggleRowSelection(row, true) })
      } else {
        const row = this.list.find(item => this.preSelectedIds.includes(item.id))
        if (row) { this.selectedRadioId = row.id; this.currentRadioRow = row }
      }
    },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() },
    resetQuery() {
      Object.assign(this.queryParams, { code: undefined, processId: this.processId, workshopId: undefined, status: CommonStatusEnum.ENABLE })
      return this.handleQuery()
    },
    confirmSelect() {
      const rows = this.multiple ? this.selectedRows : (this.currentRadioRow ? [this.currentRadioRow] : [])
      if (rows.length === 0) { this.$modal.msgWarning(this.multiple ? '请至少选择一条数据' : '请选择一条数据'); return }
      this.$emit('selected', rows); this.dialogVisible = false
    },
    async open(selectedIds) {
      this.dialogVisible = true
      Object.assign(this.queryParams, { code: undefined, processId: this.processId, workshopId: undefined, status: CommonStatusEnum.ENABLE, pageNo: 1 })
      this.selectedRows = []; this.selectedRadioId = undefined; this.currentRadioRow = undefined; this.preSelectedIds = selectedIds || []
      await this.$nextTick(); if (this.$refs.table) this.$refs.table.clearSelection(); await this.getList()
    }
  }
}
</script>

<style scoped>.radio-no-label >>> .el-radio__label { display: none; }</style>
