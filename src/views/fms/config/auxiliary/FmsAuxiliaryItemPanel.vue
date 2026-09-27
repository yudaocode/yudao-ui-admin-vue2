<template>
  <div class="fms-auxiliary-item-panel">
    <el-form ref="queryForm" :inline="true" :model="queryParams" class="item-toolbar">
      <el-form-item label="关键词" prop="search">
        <el-input
          v-model="queryParams.search"
          clearable
          placeholder="请输入编码或名称"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-if="isWritable"
          v-hasPermi="['fms:config:auxiliary:create']"
          :disabled="!auxiliaryType"
          icon="el-icon-plus"
          plain
          type="primary"
          @click="openForm()"
        >新增项目</el-button>
        <el-button
          v-if="isWritable"
          v-hasPermi="['fms:config:auxiliary:import']"
          :disabled="!auxiliaryType"
          icon="el-icon-upload2"
          plain
          type="warning"
          @click="handleImport"
        >导入</el-button>
        <el-button
          v-hasPermi="['fms:config:auxiliary:export']"
          :disabled="!auxiliaryType"
          :loading="exportLoading"
          icon="el-icon-download"
          plain
          type="success"
          @click="handleExport"
        >导出</el-button>
        <el-button
          v-if="isWritable"
          v-hasPermi="['fms:config:auxiliary:delete']"
          :disabled="checkedIds.length === 0"
          icon="el-icon-delete"
          plain
          type="danger"
          @click="handleDeleteBatch"
        >批量删除</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      :show-overflow-tooltip="true"
      stripe
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column v-if="isWritable && canDelete" type="selection" width="55" />
      <el-table-column label="编码" min-width="130" prop="code" />
      <el-table-column label="名称" min-width="180" prop="name" />
      <el-table-column label="备注" min-width="180" prop="remark" />
      <el-table-column v-if="isInventory" label="规格" min-width="130" prop="specification" />
      <el-table-column v-if="isInventory" label="单位" min-width="100" prop="unit" />
      <el-table-column label="状态" width="90">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="CommonStatusEnum.ENABLE"
            :disabled="!isWritable || !canUpdate"
            :inactive-value="CommonStatusEnum.DISABLE"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="isWritable && (canUpdate || canDelete)"
        align="center"
        fixed="right"
        label="操作"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            v-if="canUpdate"
            v-hasPermi="['fms:config:auxiliary:update']"
            type="text"
            @click="openForm(scope.row)"
          >编辑</el-button>
          <el-button
            v-if="canDelete"
            v-hasPermi="['fms:config:auxiliary:delete']"
            class="danger-text"
            type="text"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />

    <fms-auxiliary-item-form ref="form" @success="getList" />
    <fms-auxiliary-item-import-form ref="importForm" @success="getList" />
  </div>
</template>

<script>
import { FmsAuxiliaryItemApi } from '@/api/fms/config/auxiliary/item'
import { CommonStatusEnum } from '@/utils/constants'
import { checkPermi } from '@/utils/permission'
import { FMS_AUXILIARY_TYPE } from '@/views/fms/utils/constants'

import FmsAuxiliaryItemForm from './item/FmsAuxiliaryItemForm.vue'
import FmsAuxiliaryItemImportForm from './item/FmsAuxiliaryItemImportForm.vue'

export default {
  name: 'FmsAuxiliaryItemPanel',
  components: { FmsAuxiliaryItemForm, FmsAuxiliaryItemImportForm },
  props: {
    accountSetId: { type: [Number, String], default: undefined },
    auxiliaryType: { type: Object, default: null },
    isWritable: { type: Boolean, default: false }
  },
  data() {
    return {
      CommonStatusEnum,
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      checkedIds: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        accountSetId: 0,
        auxiliaryTypeId: 0,
        search: ''
      },
      requestSequence: 0
    }
  },
  computed: {
    auxiliaryTypeId() {
      return Number(this.auxiliaryType && this.auxiliaryType.id) || 0
    },
    contextKey() {
      return String(Number(this.accountSetId) || 0) + ':' + String(this.auxiliaryTypeId)
    },
    isInventory() {
      return Number(this.auxiliaryType && this.auxiliaryType.type) === FMS_AUXILIARY_TYPE.INVENTORY
    },
    canUpdate() {
      return checkPermi(['fms:config:auxiliary:update'])
    },
    canDelete() {
      return checkPermi(['fms:config:auxiliary:delete'])
    }
  },
  watch: {
    contextKey: {
      immediate: true,
      handler() {
        this.queryParams.accountSetId = Number(this.accountSetId) || 0
        this.queryParams.auxiliaryTypeId = this.auxiliaryTypeId
        this.queryParams.pageNo = 1
        this.queryParams.search = ''
        this.checkedIds = []
        this.getList()
      }
    }
  },
  methods: {
    getList() {
      const params = Object.assign({}, this.queryParams)
      const sequence = ++this.requestSequence
      if (!params.accountSetId || !params.auxiliaryTypeId) {
        this.list = []
        this.total = 0
        this.loading = false
        return
      }
      this.loading = true
      return FmsAuxiliaryItemApi.getAuxiliaryItemPage(params).then(response => {
        if (sequence !== this.requestSequence || this.contextKey !== String(params.accountSetId) + ':' + String(params.auxiliaryTypeId)) return
        const data = response.data
        this.list = data.list
        this.total = Number(data.total) || 0
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    openForm(row) {
      if (!this.auxiliaryType) return
      this.$refs.form.open(this.auxiliaryType, row, Number(this.accountSetId))
    },
    handleStatusChange(row) {
      const nextStatus = row.status
      const text = nextStatus === CommonStatusEnum.ENABLE ? '启用' : '停用'
      this.$modal.confirm('确认要“' + text + '”“' + row.name + '”辅助核算项目吗？').then(() => {
        return FmsAuxiliaryItemApi.updateAuxiliaryItemStatus(row.accountSetId, row.id, nextStatus)
      }).then(() => {
        this.getList()
      }).catch(() => {
        row.status = nextStatus === CommonStatusEnum.ENABLE
          ? CommonStatusEnum.DISABLE
          : CommonStatusEnum.ENABLE
      })
    },
    handleDelete(row) {
      this.$modal.confirm('确认删除辅助核算项目“' + row.code + ' ' + row.name + '”吗？').then(() => {
        return FmsAuxiliaryItemApi.deleteAuxiliaryItemList(row.accountSetId, [row.id])
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleDeleteBatch() {
      if (!this.checkedIds.length) return
      this.$modal.confirm('确认删除选中的 ' + this.checkedIds.length + ' 个辅助核算项目吗？').then(() => {
        return FmsAuxiliaryItemApi.deleteAuxiliaryItemList(this.queryParams.accountSetId, this.checkedIds)
      }).then(() => {
        this.checkedIds = []
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleImport() {
      if (!this.auxiliaryType) return
      this.$refs.importForm.open(this.queryParams.accountSetId, this.auxiliaryType)
    },
    handleExport() {
      if (!this.auxiliaryType || this.exportLoading) return
      this.$modal.confirm('确认导出当前辅助核算项目吗？').then(() => {
        this.exportLoading = true
        return FmsAuxiliaryItemApi.exportAuxiliaryItem(Object.assign({}, this.queryParams))
      }).then(response => {
        this.$download.excel(response.data, this.auxiliaryType.name + '.xlsx')
      }).catch(() => {
      }).finally(() => {
        this.exportLoading = false
      })
    },
    handleRowCheckboxChange(rows) {
      this.checkedIds = (rows || []).map(item => item.id)
    }
  }
}
</script>

<style scoped>
.item-toolbar { margin-bottom: 12px; }
.danger-text { color: #f56c6c; }
</style>
