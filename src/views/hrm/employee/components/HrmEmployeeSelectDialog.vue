<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="960px" append-to-body>
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" label-width="72px" @submit.native.prevent>
        <el-form-item label="员工姓名">
          <el-input
            v-model="queryParams.name"
            clearable
            placeholder="请输入员工姓名"
            class="field-name"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="工号">
          <el-input
            v-model="queryParams.jobNumber"
            clearable
            placeholder="请输入工号"
            class="field-job-number"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="部门">
          <DeptSelect v-model="queryParams.deptId" class="field-dept" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        ref="table"
        v-loading="loading"
        :data="list"
        :highlight-current-row="!multiple"
        stripe
        row-key="id"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="multiple"
          type="selection"
          width="50"
          align="center"
          reserve-selection
          :selectable="rowSelectable"
        />
        <el-table-column v-else align="center" width="50">
          <template slot-scope="scope">
            <el-radio
              v-model="selectedRadioId"
              class="radio-no-label"
              :disabled="scope.row.disabled"
              :label="scope.row.id"
              @change="selectedRadioRow = scope.row"
            ><span /></el-radio>
          </template>
        </el-table-column>
        <el-table-column align="center" label="员工姓名" min-width="120" prop="name" show-overflow-tooltip />
        <el-table-column align="center" label="工号" min-width="110" prop="jobNumber" show-overflow-tooltip />
        <el-table-column align="center" label="部门" min-width="120" prop="deptName" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.deptName || '-' }}</template>
        </el-table-column>
        <el-table-column align="center" label="手机号" min-width="130" prop="mobile" show-overflow-tooltip />
        <el-table-column align="center" label="入职状态" min-width="100" prop="entryStatus" show-overflow-tooltip>
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.HRM_EMPLOYEE_ENTRY_STATUS" :value="scope.row.entryStatus" />
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <span slot="footer">
      <el-button type="primary" @click="confirmSelect">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { getEmployeeSimpleList, getEmployeeSimplePage } from '@/api/hrm/employee'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'

export default {
  name: 'HrmEmployeeSelectDialog',
  components: { DeptSelect },
  props: {
    title: { type: String, default: '选择员工' },
    multiple: { type: Boolean, default: false },
    entryStatus: { type: Number, default: undefined },
    selectable: { type: Function, default: undefined }
  },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      total: 0,
      list: [],
      queryParams: this.defaultQueryParams(),
      selectedRowMap: new Map(),
      selectedRadioId: undefined,
      selectedRadioRow: undefined,
      disabledIds: []
    }
  },
  methods: {
    defaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        jobNumber: undefined,
        deptId: undefined,
        entryStatus: this.entryStatus
      }
    },
    convertEmployeeSelectRow(employee) {
      if (!employee || employee.id == null) {
        return undefined
      }
      return {
        id: employee.id,
        name: employee.name,
        jobNumber: employee.jobNumber,
        mobile: employee.mobile,
        deptId: employee.deptId,
        deptName: employee.deptName,
        postName: employee.postName,
        postLevel: employee.postLevel,
        leaderEmployeeId: employee.leaderEmployeeId,
        leaderEmployeeName: employee.leaderEmployeeName,
        entryStatus: employee.entryStatus,
        status: employee.status,
        disabled:
          this.disabledIds.includes(employee.id) ||
          (this.entryStatus != null && employee.entryStatus !== this.entryStatus) ||
          (this.selectable ? !this.selectable(employee) : false)
      }
    },
    async getList() {
      this.loading = true
      try {
        const response = await getEmployeeSimplePage(this.queryParams)
        this.list = response.data.list.map(this.convertEmployeeSelectRow).filter((item) => item)
        this.total = response.data.total
        await this.$nextTick()
        this.applyCurrentPageSelection()
      } finally {
        this.loading = false
      }
    },
    applyCurrentPageSelection() {
      if (!this.multiple) {
        const selectedRow = this.list.find((row) => row.id === this.selectedRadioId)
        if (selectedRow) {
          this.selectedRadioRow = selectedRow
        }
        return
      }
      this.list.forEach((row) => {
        this.$refs.table.toggleRowSelection(row, this.selectedRowMap.has(row.id))
      })
    },
    handleSelectionChange(rows) {
      if (!this.multiple) {
        return
      }
      this.list.forEach((row) => this.selectedRowMap.delete(row.id))
      rows.forEach((row) => this.selectedRowMap.set(row.id, row))
    },
    rowSelectable(row) {
      return !row.disabled
    },
    handleRowClick(row) {
      if (this.multiple || row.disabled) {
        return
      }
      this.selectedRadioId = row.id
      this.selectedRadioRow = row
    },
    handleRowDblClick(row) {
      if (row.disabled) {
        return
      }
      if (this.multiple) {
        this.$refs.table.toggleRowSelection(row)
        return
      }
      this.selectedRadioId = row.id
      this.selectedRadioRow = row
      this.confirmSelect()
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.name = undefined
      this.queryParams.jobNumber = undefined
      this.queryParams.deptId = undefined
      this.handleQuery()
    },
    confirmSelect() {
      const rows = this.multiple ? Array.from(this.selectedRowMap.values()) : [this.selectedRadioRow]
      const selectedRows = rows.filter((row) => row)
      if (!selectedRows.length) {
        this.$modal.msgWarning('请选择员工')
        return
      }
      this.$emit('selected', selectedRows)
      this.dialogVisible = false
    },
    async open(selectedIds = [], selectedDisabledIds = []) {
      this.dialogVisible = true
      this.disabledIds = selectedDisabledIds
      this.list = []
      this.total = 0
      this.selectedRowMap = new Map()
      const enabledSelectedIds = selectedIds.filter((id) => !selectedDisabledIds.includes(id))
      this.selectedRadioId = this.multiple ? undefined : enabledSelectedIds[0]
      this.selectedRadioRow = undefined
      if (this.$refs.table) {
        this.$refs.table.clearSelection()
      }
      this.queryParams = this.defaultQueryParams()
      this.loading = true
      try {
        let selectedRows = []
        if (enabledSelectedIds.length) {
          const response = await getEmployeeSimpleList(enabledSelectedIds)
          selectedRows = response.data
        }
        selectedRows.map(this.convertEmployeeSelectRow).forEach((row) => {
          if (row) {
            this.selectedRowMap.set(row.id, row)
          }
        })
        if (!this.multiple) {
          this.selectedRadioRow = this.convertEmployeeSelectRow(selectedRows[0])
        }
        await this.getList()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.field-name {
  width: 200px;
}

.field-job-number {
  width: 180px;
}

.field-dept {
  width: 200px;
}

.radio-no-label ::v-deep .el-radio__label {
  display: none;
}
</style>
