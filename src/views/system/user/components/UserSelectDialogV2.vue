<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="80%" append-to-body>
    <el-row class="user-select-dialog" :gutter="15">
      <el-col class="user-select-left" :span="5" :xs="24">
        <el-card shadow="never" class="user-select-card">
          <DeptTreeSelect ref="deptTree" @node-click="handleDeptNodeClick" />
        </el-card>
      </el-col>
      <el-col class="user-select-right" :span="19" :xs="24">
        <el-form :inline="true" :model="queryParams" size="small" label-width="72px">
          <el-form-item label="用户名称">
            <el-input v-model="queryParams.username" placeholder="请输入用户名称" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="用户昵称">
            <el-input v-model="queryParams.nickname" placeholder="请输入用户昵称" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号码">
            <el-input v-model="queryParams.mobile" placeholder="请输入手机号码" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option
                v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)"
                :key="parseInt(dict.value)"
                :label="dict.label"
                :value="parseInt(dict.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table
          ref="table"
          v-loading="loading"
          :data="list"
          row-key="id"
          :highlight-current-row="!multiple"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
          @row-dblclick="handleRowDblClick"
        >
          <el-table-column
            v-if="multiple"
            type="selection"
            :selectable="selectable"
            reserve-selection
            width="50"
            align="center"
          />
          <el-table-column v-else width="50" align="center">
            <template v-slot="scope">
              <el-radio
                v-model="selectedRadioId"
                :label="scope.row.id"
                :disabled="scope.row.disabled"
                @change="handleRadioChange(scope.row)"
              >
                <span />
              </el-radio>
            </template>
          </el-table-column>
          <el-table-column label="用户编号" align="center" prop="id" width="100" />
          <el-table-column label="用户名称" align="center" prop="username" width="140" show-overflow-tooltip />
          <el-table-column label="用户昵称" align="center" prop="nickname" width="140" show-overflow-tooltip />
          <el-table-column label="部门" align="center" prop="deptName" width="150" show-overflow-tooltip>
            <template v-slot="scope">{{ scope.row.deptName || (scope.row.dept && scope.row.dept.name) || '-' }}</template>
          </el-table-column>
          <el-table-column label="手机号码" align="center" prop="mobile" width="130" />
          <el-table-column label="状态" align="center" prop="status" width="90">
            <template v-slot="scope">
              <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirmSelect">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { CommonStatusEnum } from '@/utils/constants'
import { listUser } from '@/api/system/user'
import DeptTreeSelect from '@/views/system/dept/components/DeptTreeSelect.vue'

export default {
  name: 'UserSelectDialogV2',
  components: { DeptTreeSelect },
  props: {
    multiple: {
      type: Boolean,
      default: true
    },
    deptId: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      selectedRows: [],
      selectedRadioId: undefined,
      currentRadioRow: undefined,
      preSelectedIds: [],
      preDisabledIds: [],
      activityId: undefined,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        username: undefined,
        nickname: undefined,
        mobile: undefined,
        status: CommonStatusEnum.ENABLE,
        deptId: undefined
      }
    }
  },
  computed: {
    title() {
      return this.multiple ? '选择用户' : '选择用户'
    }
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await listUser(this.queryParams)
        const data = response.data || {}
        this.list = (data.list || []).map((row) => ({
          ...row,
          deptName: row.deptName || (row.dept && row.dept.name),
          disabled: this.preDisabledIds.includes(row.id)
        }))
        this.total = data.total || 0
        await this.$nextTick()
        this.applyPreSelection()
      } finally {
        this.loading = false
      }
    },
    applyPreSelection() {
      if (!this.preSelectedIds.length) return
      if (this.multiple) {
        this.list.forEach((row) => {
          if (this.preSelectedIds.includes(row.id) && this.$refs.table) {
            this.$refs.table.toggleRowSelection(row, true)
          }
        })
      } else {
        const match = this.list.find((row) => this.preSelectedIds.includes(row.id))
        if (match) {
          this.selectedRadioId = match.id
          this.currentRadioRow = match
        }
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.username = undefined
      this.queryParams.nickname = undefined
      this.queryParams.mobile = undefined
      this.queryParams.status = CommonStatusEnum.ENABLE
      this.queryParams.deptId = undefined
      this.$refs.deptTree && this.$refs.deptTree.reset()
      this.handleQuery()
    },
    handleDeptNodeClick(deptId) {
      this.queryParams.deptId = deptId
      this.handleQuery()
    },
    selectable(row) {
      return !row.disabled
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows || []
    },
    handleRadioChange(row) {
      if (row.disabled) return
      this.currentRadioRow = row
      this.selectedRadioId = row.id
    },
    handleRowClick(row) {
      if (row.disabled) return
      if (this.multiple) {
        this.$refs.table && this.$refs.table.toggleRowSelection(row)
      } else {
        this.handleRadioChange(row)
      }
    },
    handleRowDblClick(row) {
      if (row.disabled) return
      if (!this.multiple) {
        this.handleRadioChange(row)
        this.confirmSelect()
      }
    },
    confirmSelect() {
      if (this.multiple) {
        if (!this.selectedRows.length) {
          this.$message.warning('请至少选择一条数据')
          return
        }
        this.$emit('selected', this.selectedRows, this.activityId)
      } else {
        if (!this.currentRadioRow) {
          this.$message.warning('请选择一条数据')
          return
        }
        this.$emit('selected', [this.currentRadioRow], this.activityId)
      }
      this.dialogVisible = false
    },
    async open(selectedIds, disabledIds, activityId) {
      this.preDisabledIds = disabledIds || []
      this.activityId = activityId
      this.dialogVisible = true
      this.queryParams.username = undefined
      this.queryParams.nickname = undefined
      this.queryParams.mobile = undefined
      this.queryParams.status = CommonStatusEnum.ENABLE
      this.queryParams.deptId = this.deptId
      this.queryParams.pageNo = 1
      this.selectedRows = []
      this.selectedRadioId = undefined
      this.currentRadioRow = undefined
      this.preSelectedIds = (selectedIds || []).filter((id) => !this.preDisabledIds.includes(id))
      await this.$nextTick()
      this.$refs.deptTree && this.$refs.deptTree.reset()
      this.$refs.table && this.$refs.table.clearSelection()
      await this.getList()
      if (this.queryParams.deptId && this.$refs.deptTree) {
        this.$refs.deptTree.setCurrent(this.queryParams.deptId)
      }
    }
  }
}
</script>

<style scoped>
.user-select-dialog {
  min-height: 560px;
}

.user-select-left,
.user-select-right {
  min-height: 560px;
}

.user-select-card {
  height: 560px;
}

.user-select-card ::v-deep .el-card__body {
  height: 100%;
  padding: 0;
}
</style>
