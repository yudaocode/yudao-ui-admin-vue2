<!-- MES 设备弹窗选择器 -->
<template>
  <el-dialog title="设备选择" :visible.sync="dialogVisible" width="80%" append-to-body>
    <el-row :gutter="20">
      <el-col :span="4" :xs="24"><machinery-type-tree @node-click="handleTypeNodeClick" /></el-col>
      <el-col :span="20" :xs="24">
        <el-form :inline="true" :model="queryParams" label-width="85px" size="small" @submit.native.prevent>
          <el-form-item label="设备编码"><el-input v-model="queryParams.code" placeholder="请输入设备编码" clearable @keyup.enter.native="handleQuery" /></el-form-item>
          <el-form-item label="设备名称"><el-input v-model="queryParams.name" placeholder="请输入设备名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
          <el-form-item label="所属车间"><el-select v-model="queryParams.workshopId" placeholder="请选择所属车间" clearable><el-option v-for="item in workshopList" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
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
          <el-table-column label="设备编码" align="center" prop="code" width="120" />
          <el-table-column label="设备名称" align="left" prop="name" min-width="120" />
          <el-table-column label="品牌" align="left" prop="brand" min-width="120" />
          <el-table-column label="规格型号" align="left" prop="specification" min-width="120" />
          <el-table-column label="所属车间" align="center" prop="workshopName" width="120" />
          <el-table-column label="设备状态" align="center" prop="status" width="100"><template v-slot="scope"><dict-tag :type="MES_DV_MACHINERY_STATUS" :value="scope.row.status" /></template></el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160"><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <span slot="footer"><el-button type="primary" @click="confirmSelect">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { DvMachineryApi } from '@/api/mes/dv/machinery'
import { MdWorkshopApi } from '@/api/mes/md/workstation/workshop'
import MachineryTypeTree from '../type/components/MachineryTypeTree.vue'

const MES_DV_MACHINERY_STATUS = 'mes_dv_machinery_status'

export default {
  name: 'DvMachinerySelectDialog',
  components: { MachineryTypeTree },
  props: { multiple: { type: Boolean, default: true }},
  data() {
    return {
      MES_DV_MACHINERY_STATUS,
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      selectedRows: [],
      selectedRadioId: undefined,
      currentRadioRow: undefined,
      preSelectedIds: [],
      workshopList: [],
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, workshopId: undefined, machineryTypeId: undefined }
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
        const response = await DvMachineryApi.getMachineryPage(this.queryParams)
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
      this.queryParams.workshopId = undefined
      return this.handleQuery()
    },
    handleTypeNodeClick(row) {
      this.queryParams.machineryTypeId = row ? row.id : undefined
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
      this.queryParams.workshopId = undefined
      this.queryParams.machineryTypeId = undefined
      this.queryParams.pageNo = 1
      this.selectedRows = []
      this.selectedRadioId = undefined
      this.currentRadioRow = undefined
      this.preSelectedIds = selectedIds || []
      if (this.workshopList.length === 0) {
        const response = await MdWorkshopApi.getWorkshopSimpleList()
        this.workshopList = response.data
      }
      await this.$nextTick()
      if (this.$refs.table) this.$refs.table.clearSelection()
      await this.getList()
    }
  }
}
</script>

<style scoped>.radio-no-label >>> .el-radio__label { display: none; }</style>
