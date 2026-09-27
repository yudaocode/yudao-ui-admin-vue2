<!-- MES 点检保养方案弹窗选择器 -->
<template>
  <el-dialog title="点检方案选择" :visible.sync="dialogVisible" width="70%" append-to-body>
    <el-alert v-if="type != null || status != null" :title="alertTitle" type="info" :closable="false" show-icon class="filter-alert" />
    <el-form :inline="true" :model="queryParams" label-width="85px" size="small" @submit.native.prevent>
      <el-form-item label="计划编号"><el-input v-model="queryParams.code" placeholder="请输入计划编号" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="计划名称"><el-input v-model="queryParams.name" placeholder="请输入计划名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item><el-button icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button></el-form-item>
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
      <el-table-column v-if="multiple" type="selection" :reserve-selection="true" width="50" align="center" />
      <el-table-column v-else width="50" align="center"><template v-slot="scope"><el-radio v-model="selectedRadioId" :label="scope.row.id" class="radio-no-label" @change="handleRadioChange(scope.row)" /></template></el-table-column>
      <el-table-column label="计划编码" align="center" prop="code" width="200" />
      <el-table-column label="计划名称" align="left" prop="name" min-width="150" />
      <el-table-column label="计划类型" align="center" prop="type" width="120"><template v-slot="scope"><dict-tag :type="MES_DV_SUBJECT_TYPE" :value="scope.row.type" /></template></el-table-column>
      <el-table-column label="开始日期" align="center" prop="startDate" width="120"><template v-slot="scope">{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</template></el-table-column>
      <el-table-column label="结束日期" align="center" prop="endDate" width="120"><template v-slot="scope">{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</template></el-table-column>
      <el-table-column label="频率" align="center" width="120"><template v-slot="scope">{{ scope.row.cycleCount }} <dict-tag :type="MES_DV_CYCLE_TYPE" :value="scope.row.cycleType" /></template></el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100"><template v-slot="scope"><dict-tag :type="MES_DV_CHECK_PLAN_STATUS" :value="scope.row.status" /></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <span slot="footer"><el-button type="primary" @click="confirmSelect">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { getDictDataLabel } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { DvCheckPlanApi } from '@/api/mes/dv/checkplan'

const MES_DV_SUBJECT_TYPE = 'mes_dv_subject_type'
const MES_DV_CYCLE_TYPE = 'mes_dv_cycle_type'
const MES_DV_CHECK_PLAN_STATUS = 'mes_dv_check_plan_status'

export default {
  name: 'DvCheckPlanSelectDialog',
  props: {
    multiple: { type: Boolean, default: true },
    type: Number,
    status: Number
  },
  data() {
    return {
      MES_DV_SUBJECT_TYPE,
      MES_DV_CYCLE_TYPE,
      MES_DV_CHECK_PLAN_STATUS,
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      selectedRows: [],
      selectedRadioId: undefined,
      currentRadioRow: undefined,
      preSelectedIds: [],
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, type: undefined, status: undefined }
    }
  },
  computed: {
    alertTitle() {
      const parts = []
      if (this.type != null) parts.push('类型【' + getDictDataLabel(MES_DV_SUBJECT_TYPE, this.type) + '】')
      if (this.status != null) parts.push('状态【' + getDictDataLabel(MES_DV_CHECK_PLAN_STATUS, this.status) + '】')
      return '仅展示' + parts.join('且') + '的方案'
    }
  },
  methods: {
    parseTime,
    handleSelectionChange(rows) {
      if (this.multiple) this.selectedRows = rows
    },
    handleRadioChange(row) {
      this.currentRadioRow = row
    },
    handleRowClick(row) {
      if (this.multiple) return
      this.selectedRadioId = row.id
      this.currentRadioRow = row
    },
    handleRowDblClick(row) {
      if (this.multiple) {
        this.$refs.table.toggleRowSelection(row)
        return
      }
      this.selectedRadioId = row.id
      this.currentRadioRow = row
      this.confirmSelect()
    },
    async getList() {
      this.loading = true
      try {
        const response = await DvCheckPlanApi.getCheckPlanPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
        await this.$nextTick()
        this.applyPreSelection()
      } finally {
        this.loading = false
      }
    },
    applyPreSelection() {
      if (this.preSelectedIds.length === 0) return
      if (this.multiple) {
        this.list.forEach(row => {
          if (this.preSelectedIds.includes(row.id)) this.$refs.table.toggleRowSelection(row, true)
        })
      } else {
        const match = this.list.find(row => this.preSelectedIds.includes(row.id))
        if (match) {
          this.selectedRadioId = match.id
          this.currentRadioRow = match
        }
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.queryParams.code = undefined
      this.queryParams.name = undefined
      return this.handleQuery()
    },
    confirmSelect() {
      const rows = this.multiple ? this.selectedRows : (this.currentRadioRow ? [this.currentRadioRow] : [])
      if (rows.length === 0) {
        this.$modal.msgWarning(this.multiple ? '请至少选择一条数据' : '请选择一条数据')
        return
      }
      this.$emit('selected', rows)
      this.dialogVisible = false
    },
    async open(selectedIds) {
      this.dialogVisible = true
      this.queryParams.code = undefined
      this.queryParams.name = undefined
      this.queryParams.type = this.type
      this.queryParams.status = this.status
      this.queryParams.pageNo = 1
      this.selectedRows = []
      this.selectedRadioId = undefined
      this.currentRadioRow = undefined
      this.preSelectedIds = selectedIds || []
      await this.$nextTick()
      if (this.$refs.table) this.$refs.table.clearSelection()
      await this.getList()
    }
  }
}
</script>

<style scoped>
.filter-alert { margin-bottom: 10px; }
.radio-no-label >>> .el-radio__label { display: none; }
</style>
