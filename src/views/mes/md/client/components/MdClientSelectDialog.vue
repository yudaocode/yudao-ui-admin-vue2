<!-- MES 客户弹窗选择器（支持单选/多选） -->
<template>
  <el-dialog title="客户选择" :visible.sync="dialogVisible" width="70%" append-to-body>
    <el-form :inline="true" :model="queryParams" label-width="68px" size="small" @submit.native.prevent>
      <el-form-item label="客户编码"><el-input v-model="queryParams.code" placeholder="请输入客户编码" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="客户名称"><el-input v-model="queryParams.name" placeholder="请输入客户名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="客户简称"><el-input v-model="queryParams.nickname" placeholder="请输入客户简称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="英文名称"><el-input v-model="queryParams.englishName" placeholder="请输入客户英文名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
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
      <el-table-column v-else width="50" align="center">
        <template v-slot="scope"><el-radio v-model="selectedRadioId" :label="scope.row.id" class="radio-no-label" @change="handleRadioChange(scope.row)">&nbsp;</el-radio></template>
      </el-table-column>
      <el-table-column label="客户编码" align="center" prop="code" width="200" />
      <el-table-column label="客户名称" align="left" prop="name" min-width="150" />
      <el-table-column label="客户简称" align="center" prop="nickname" width="120" />
      <el-table-column label="客户类型" align="center" prop="type" width="100"><template v-slot="scope"><dict-tag :type="DICT_TYPE.MES_CLIENT_TYPE" :value="scope.row.type" /></template></el-table-column>
      <el-table-column label="联系人" align="center" prop="contact1Name" width="100" />
      <el-table-column label="联系电话" align="center" prop="telephone" width="130" />
      <el-table-column label="联系人-电话" align="center" prop="contact1Telephone" width="130" />
      <el-table-column label="状态" align="center" prop="status" width="80"><template v-slot="scope"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" /></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <span slot="footer"><el-button type="primary" @click="confirmSelect">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { MdClientApi } from '@/api/mes/md/client'
import { DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'MdClientSelectDialog',
  props: { multiple: { type: Boolean, default: true }},
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      selectedRows: [],
      selectedRadioId: undefined,
      currentRadioRow: undefined,
      preSelectedIds: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        nickname: undefined,
        englishName: undefined,
        status: CommonStatusEnum.ENABLE
      }
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
        const response = await MdClientApi.getClientPage(this.queryParams)
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
        if (!this.$refs.table) return
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
      this.queryParams.nickname = undefined
      this.queryParams.englishName = undefined
      this.queryParams.status = CommonStatusEnum.ENABLE
      return this.handleQuery()
    },
    confirmSelect() {
      if (this.multiple) {
        if (this.selectedRows.length === 0) {
          this.$modal.msgWarning('请至少选择一条数据')
          return
        }
        this.$emit('selected', this.selectedRows)
      } else {
        if (!this.currentRadioRow) {
          this.$modal.msgWarning('请选择一条数据')
          return
        }
        this.$emit('selected', [this.currentRadioRow])
      }
      this.dialogVisible = false
    },
    async open(selectedIds) {
      this.dialogVisible = true
      this.queryParams.code = undefined
      this.queryParams.name = undefined
      this.queryParams.nickname = undefined
      this.queryParams.englishName = undefined
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
.radio-no-label /deep/ .el-radio__label { display: none; }
</style>
