<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="群选择"
    width="70%"
    append-to-body
  >
    <el-form
      :inline="true"
      :model="queryParams"
      label-width="68px"
      size="small"
    >
      <el-form-item label="群名称">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入群名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="群状态">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择群状态"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="dict in groupStatusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="table"
      v-loading="loading"
      :data="list"
      stripe
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
      >
        <template #default="scope">
          <el-radio
            v-model="selectedRadioId"
            :label="scope.row.id"
            class="radio-no-label"
            @change="handleRadioChange(scope.row)"
          >&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        width="100"
      />
      <el-table-column
        label="头像"
        align="center"
        width="80"
      >
        <template #default="scope"><el-avatar
          :src="scope.row.avatar"
          :size="32"
        >{{ firstCharacter(scope.row.name) }}</el-avatar></template>
      </el-table-column>
      <el-table-column
        label="群名称"
        align="left"
        prop="name"
        min-width="160"
      />
      <el-table-column
        label="群主"
        align="center"
        min-width="160"
      >
        <template #default="scope"><span>{{ scope.row.ownerNickname || '-' }}</span><span class="id-text">({{ scope.row.ownerUserId }})</span></template>
      </el-table-column>
      <el-table-column
        label="成员数"
        align="center"
        prop="memberCount"
        width="90"
      />
      <el-table-column
        label="群状态"
        align="center"
        prop="status"
        width="100"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.IM_GROUP_STATUS"
          :value="scope.row.status"
        /></template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="confirmSelect"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getManagerGroup, getManagerGroupPage } from '@/api/im/manager/group'

export default {
  name: 'GroupSelectDialog',
  props: {
    multiple: { type: Boolean, default: true }
  },
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
      groupStatusOptions: getIntDictOptions(DICT_TYPE.IM_GROUP_STATUS),
      queryParams: { pageNo: 1, pageSize: 10, name: undefined, status: undefined }
    }
  },
  methods: {
    firstCharacter(value) {
      return value ? value.charAt(0) : '?'
    },
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
        if (this.$refs.table) this.$refs.table.toggleRowSelection(row)
        return
      }
      this.selectedRadioId = row.id
      this.currentRadioRow = row
      this.confirmSelect()
    },
    async getList() {
      this.loading = true
      try {
        const response = await getManagerGroupPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
        await this.$nextTick()
        await this.applyPreSelection()
      } finally {
        this.loading = false
      }
    },
    async applyPreSelection() {
      if (this.preSelectedIds.length === 0) return
      if (this.multiple) {
        const table = this.$refs.table
        if (!table) return
        this.list.forEach(row => {
          if (this.preSelectedIds.includes(row.id)) table.toggleRowSelection(row, true)
        })
        return
      }
      const targetId = this.preSelectedIds[0]
      const match = this.list.find(row => row.id === targetId)
      if (match) {
        this.selectedRadioId = match.id
        this.currentRadioRow = match
        return
      }
      try {
        const response = await getManagerGroup(targetId)
        if (response.data) {
          this.selectedRadioId = response.data.id
          this.currentRadioRow = response.data
        }
      } catch (error) {
        console.warn('[GroupSelectDialog] 预选群详情拉取失败', { targetId }, error)
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.queryParams.name = undefined
      this.queryParams.status = undefined
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
      this.queryParams.name = undefined
      this.queryParams.status = undefined
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
.radio-no-label ::v-deep .el-radio__label { display: none; }
.id-text { margin-left: 5px; color: #909399; }
</style>
