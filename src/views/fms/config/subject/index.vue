<template>
  <div class="app-container fms-subject-page">
    <doc-alert title="【设置】币别、科目、辅助核算、初始余额" url="https://doc.iocoder.cn/fms/config/accounting/" />

    <el-form ref="queryForm" :inline="true" label-width="78px" class="subject-toolbar">
      <el-form-item label="当前账套">
        <el-select v-model="accountSetId" filterable clearable placeholder="请选择账套" style="width: 240px" @change="handleAccountSetChange">
          <el-option v-for="item in accountSets" :key="item.id" :label="item.companyName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="科目类别">
        <el-select v-model="subjectType" style="width: 180px" @change="getList">
          <el-option v-for="item in subjectTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isWritable" v-hasPermi="['fms:config:subject:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
        <el-button v-if="isWritable" v-hasPermi="['fms:config:subject:import']" type="warning" plain icon="el-icon-upload2" @click="handleImport">导入</el-button>
        <el-button v-hasPermi="['fms:config:subject:export']" type="success" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport">导出</el-button>
        <el-dropdown v-if="isWritable && selectedRows.length && canOperate" class="ml10" :disabled="batchLoading" @command="handleBatchCommand">
          <el-button plain :loading="batchLoading" icon="el-icon-operation">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="canUpdate" command="enable">批量启用</el-dropdown-item>
            <el-dropdown-item v-if="canUpdate" command="disable">批量禁用</el-dropdown-item>
            <el-dropdown-item v-if="canDelete" command="delete" divided>批量删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-form-item>
    </el-form>

    <el-alert v-if="!accountSetId" class="mb12" type="info" :closable="false" show-icon title="请先选择已初始化的账套" />
    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children' }"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="isWritable" type="selection" width="48" />
      <el-table-column label="编码" prop="code" min-width="130" />
      <el-table-column label="名称" prop="name" min-width="190" show-overflow-tooltip />
      <el-table-column label="类别" min-width="120">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.FMS_SUBJECT_CATEGORY" :value="String(scope.row.type) + '-' + String(scope.row.category)" />
        </template>
      </el-table-column>
      <el-table-column label="余额方向" prop="balanceDirection" align="center" width="90">
        <template slot-scope="scope"><dict-tag :type="DICT_TYPE.FMS_DEBIT_CREDIT_DIRECTION" :value="scope.row.balanceDirection" /></template>
      </el-table-column>
      <el-table-column label="辅助核算" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ (scope.row.auxiliaryTypeNames || []).join('、') }}</template>
      </el-table-column>
      <el-table-column label="数量" prop="quantityUnit" align="center" width="90">
        <template slot-scope="scope">{{ scope.row.quantityAccounting ? scope.row.quantityUnit : '' }}</template>
      </el-table-column>
      <el-table-column label="现金项" align="center" width="90">
        <template slot-scope="scope"><dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.cash" /></template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="FMS_SUBJECT_STATUS.ENABLED"
            :inactive-value="FMS_SUBJECT_STATUS.DISABLED"
            :disabled="!isWritable || !canUpdate"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="220">
        <template slot-scope="scope">
          <el-button v-if="isWritable && canUpdate" v-hasPermi="['fms:config:subject:update']" type="text" @click="openForm('update', scope.row)">编辑</el-button>
          <el-button v-if="isWritable && canCreate" v-hasPermi="['fms:config:subject:create']" type="text" @click="openForm('create', null, scope.row)">新建下级</el-button>
          <el-button v-if="isWritable && canDelete" v-hasPermi="['fms:config:subject:delete']" type="text" class="danger-text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <fms-subject-form ref="form" @success="getList" />
    <fms-subject-import-form ref="importForm" @success="getList" />
  </div>
</template>

<script>
import { getAccountSetList } from '@/api/fms/config/account-set'
import * as SubjectApi from '@/api/fms/config/subject'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { handleTree } from '@/utils/ruoyi'
import { FMS_SUBJECT_STATUS, FMS_SUBJECT_TYPE, FMS_SUBJECT_TYPE_OPTIONS } from '@/views/fms/utils/constants'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import FmsSubjectForm from './FmsSubjectForm.vue'
import FmsSubjectImportForm from './FmsSubjectImportForm.vue'

export default {
  name: 'FmsSubject',
  components: { FmsSubjectForm, FmsSubjectImportForm },
  data() {
    const dictOptions = getDictDatas(DICT_TYPE.FMS_SUBJECT_TYPE)
      .map(item => ({ label: item.label, value: Number(item.value) }))
      .filter(item => Number.isFinite(item.value))
    return {
      DICT_TYPE,
      FMS_SUBJECT_STATUS,
      loading: false,
      exportLoading: false,
      batchLoading: false,
      accountSets: [],
      accountSetId: readFmsAccountSetId(this.$route),
      subjectType: FMS_SUBJECT_TYPE.ASSET,
      subjectTypeOptions: dictOptions.length ? dictOptions : FMS_SUBJECT_TYPE_OPTIONS,
      list: [],
      selectedRows: []
    }
  },
  computed: {
    currentAccountSet() {
      return this.accountSets.find(item => Number(item.id) === Number(this.accountSetId)) || null
    },
    isWritable() {
      // 主管(1)或会计(3)可修改；后端未返回级别时保守地仅开放查看。
      return !!(this.currentAccountSet && [1, 3].includes(Number(this.currentAccountSet.level)))
    },
    canCreate() { return this.hasPermi('fms:config:subject:create') },
    canUpdate() { return this.hasPermi('fms:config:subject:update') },
    canDelete() { return this.hasPermi('fms:config:subject:delete') },
    canOperate() { return this.canUpdate || this.canDelete }
  },
  created() {
    this.loadAccountSets()
  },
  methods: {
    hasPermi(permission) {
      // v-hasPermi 负责按钮指令；这里仅用于下拉菜单条件，默认不隐藏后端授权入口。
      return !this.$store || !this.$store.getters || !this.$store.getters.permissions || this.checkPermi(permission)
    },
    checkPermi(permission) {
      const permissions = (this.$store && this.$store.getters && this.$store.getters.permissions) || []
      return permissions.includes('*:*:*') || permissions.includes(permission)
    },
    loadAccountSets() {
      return getAccountSetList().then(response => {
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized !== false)
        if (!this.accountSetId || !this.accountSets.some(item => Number(item.id) === Number(this.accountSetId))) {
          const preferred = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
          this.accountSetId = preferred ? preferred.id : 0
        }
        const current = this.currentAccountSet
        if (current) saveFmsAccountSet(current)
        this.getList()
      })
    },
    handleAccountSetChange(id) {
      const current = this.accountSets.find(item => Number(item.id) === Number(id))
      if (current) saveFmsAccountSet(current)
      this.getList()
    },
    getList() {
      if (!this.accountSetId) {
        this.list = []
        return
      }
      this.loading = true
      return SubjectApi.getSubjectList(this.accountSetId, this.subjectType).then(response => {
        const rows = response.data
        this.list = handleTree(rows, 'id', 'parentId')
        this.selectedRows = []
      }).finally(() => {
        this.loading = false
      })
    },
    openForm(type, row, parent) {
      if (!this.accountSetId) return
      this.$refs.form.open(type, this.subjectType, row, parent)
    },
    handleImport() {
      if (this.accountSetId) this.$refs.importForm.open(this.accountSetId)
    },
    handleSelectionChange(rows) { this.selectedRows = rows || [] },
    handleStatusChange(row) {
      if (!this.accountSetId) return
      const nextStatus = row.status
      const text = nextStatus === FMS_SUBJECT_STATUS.ENABLED ? '启用' : '禁用'
      this.$modal.confirm('确认要' + text + '“' + row.code + ' ' + row.name + '”科目吗？').then(() => {
        return SubjectApi.updateSubjectStatus({ accountSetId: this.accountSetId, ids: [row.id], status: nextStatus })
      }).then(() => {
        this.$modal.msgSuccess('状态更新成功')
        this.getList()
      }).catch(() => {
        row.status = nextStatus === FMS_SUBJECT_STATUS.ENABLED ? FMS_SUBJECT_STATUS.DISABLED : FMS_SUBJECT_STATUS.ENABLED
      })
    },
    handleBatchCommand(command) {
      if (command === 'delete') return this.handleBatchDelete()
      const status = command === 'enable' ? FMS_SUBJECT_STATUS.ENABLED : FMS_SUBJECT_STATUS.DISABLED
      const ids = this.selectedRows.map(item => item.id)
      const text = status === FMS_SUBJECT_STATUS.ENABLED ? '启用' : '禁用'
      this.batchLoading = true
      this.$modal.confirm('确认要' + text + '选中的 ' + ids.length + ' 个科目吗？').then(() => {
        return SubjectApi.updateSubjectStatus({ accountSetId: this.accountSetId, ids, status })
      }).then(() => {
        this.$modal.msgSuccess('状态更新成功')
        this.getList()
      }).catch(() => {}).finally(() => { this.batchLoading = false })
    },
    handleDelete(row) {
      this.$modal.confirm('确认删除科目“' + row.code + ' ' + row.name + '”吗？').then(() => {
        return SubjectApi.deleteSubjectList(this.accountSetId, [row.id])
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleBatchDelete() {
      if (!this.selectedRows.length) return
      this.batchLoading = true
      this.$modal.confirm('确认删除选中的 ' + this.selectedRows.length + ' 个科目吗？').then(() => {
        return SubjectApi.deleteSubjectList(this.accountSetId, this.selectedRows.map(item => item.id))
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).finally(() => { this.batchLoading = false })
    },
    handleExport() {
      if (!this.accountSetId || this.exportLoading) return
      this.$modal.confirm('确认导出当前科目数据吗？').then(() => {
        this.exportLoading = true
        return SubjectApi.exportSubject(this.accountSetId, this.subjectType)
      }).then(response => {
        this.$download.excel(response.data, '科目设置.xls')
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.subject-toolbar { margin-bottom: 12px; }
.ml10 { margin-left: 10px; }
.mb12 { margin-bottom: 12px; }
.danger-text { color: #f56c6c; }
</style>
