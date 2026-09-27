<!-- MES 点检保养项目弹窗选择器 -->
<template>
  <el-dialog title="点检保养项目选择" :visible.sync="dialogVisible" width="70%" append-to-body>
    <el-form :inline="true" :model="queryParams" label-width="85px" size="small" @submit.native.prevent>
      <el-form-item label="项目编码"><el-input v-model="queryParams.code" placeholder="请输入项目编码" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="项目名称"><el-input v-model="queryParams.name" placeholder="请输入项目名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="项目类型">
        <el-select v-model="queryParams.type" placeholder="请选择项目类型" clearable>
          <el-option v-for="dict in subjectTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
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
      <el-table-column v-else width="50" align="center">
        <template v-slot="scope"><el-radio v-model="selectedRadioId" :label="scope.row.id" class="radio-no-label" @change="handleRadioChange(scope.row)" /></template>
      </el-table-column>
      <el-table-column label="项目编码" align="center" prop="code" width="200" />
      <el-table-column label="项目名称" align="left" prop="name" min-width="150" />
      <el-table-column label="项目类型" align="center" prop="type" width="120">
        <template v-slot="scope"><dict-tag :type="MES_DV_SUBJECT_TYPE" :value="scope.row.type" /></template>
      </el-table-column>
      <el-table-column label="项目内容" align="center" prop="content" min-width="150" />
      <el-table-column label="标准" align="center" prop="standard" min-width="120" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template v-slot="scope"><dict-tag :type="COMMON_STATUS" :value="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="120" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <span slot="footer">
      <el-button type="primary" @click="confirmSelect">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { DvSubjectApi } from '@/api/mes/dv/subject'

const COMMON_STATUS = 'common_status'
const MES_DV_SUBJECT_TYPE = 'mes_dv_subject_type'

export default {
  name: 'DvSubjectSelectDialog',
  props: {
    multiple: { type: Boolean, default: true },
    subjectType: Number
  },
  data() {
    return {
      COMMON_STATUS,
      MES_DV_SUBJECT_TYPE,
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      selectedRows: [],
      selectedRadioId: undefined,
      currentRadioRow: undefined,
      preSelectedIds: [],
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, type: undefined, status: CommonStatusEnum.ENABLE },
      subjectTypeOptions: getIntDictOptions(MES_DV_SUBJECT_TYPE),
      statusOptions: getIntDictOptions(COMMON_STATUS)
    }
  },
  methods: {
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
        const response = await DvSubjectApi.getSubjectPage(this.queryParams)
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
      this.queryParams.type = undefined
      this.queryParams.status = CommonStatusEnum.ENABLE
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
      this.queryParams.type = this.subjectType
      this.queryParams.status = CommonStatusEnum.ENABLE
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
.radio-no-label >>> .el-radio__label { display: none; }
</style>
