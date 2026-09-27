<!-- MES 物料产品弹窗选择器（支持单选/多选） -->
<template>
  <el-dialog
    title="物料产品选择"
    :visible.sync="dialogVisible"
    width="80%"
    append-to-body
  >
    <el-row :gutter="20">
      <el-col
        :span="5"
        :xs="24"
      ><md-item-type-tree
        ref="typeTree"
        @node-click="handleNodeClick"
      /></el-col>
      <el-col
        :span="19"
        :xs="24"
      >
        <el-form
          :inline="true"
          :model="queryParams"
          label-width="68px"
          size="small"
          @submit.native.prevent
        >
          <el-form-item label="物料编码"><el-input
            v-model="queryParams.code"
            placeholder="请输入物料编码"
            clearable
            @keyup.enter.native="handleQuery"
          /></el-form-item>
          <el-form-item label="物料名称"><el-input
            v-model="queryParams.name"
            placeholder="请输入物料名称"
            clearable
            @keyup.enter.native="handleQuery"
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
          :show-overflow-tooltip="true"
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
          ><template #default="scope"><el-radio
            v-model="selectedRadioId"
            :label="scope.row.id"
            class="radio-no-label"
            @change="handleRadioChange(scope.row)"
          >&nbsp;</el-radio></template></el-table-column>
          <el-table-column
            label="物料编码"
            align="center"
            prop="code"
            width="200"
          />
          <el-table-column
            label="物料名称"
            align="left"
            prop="name"
            min-width="150"
          />
          <el-table-column
            label="规格型号"
            align="left"
            prop="specification"
            min-width="120"
          />
          <el-table-column
            label="单位"
            align="center"
            prop="unitMeasureName"
            width="80"
          />
          <el-table-column
            label="物料/产品"
            align="center"
            prop="itemOrProduct"
            width="100"
          ><template #default="scope"><dict-tag
            :type="MES_ITEM_OR_PRODUCT"
            :value="scope.row.itemOrProduct"
          /></template></el-table-column>
          <el-table-column
            label="所属分类"
            align="center"
            prop="itemTypeName"
            width="120"
          />
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            :formatter="formatDateColumn"
            width="180"
          />
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
    <span slot="footer"><el-button
      type="primary"
      @click="confirmSelect"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { CommonStatusEnum } from '@/utils/constants'
import { formatDate } from '@/utils/formatTime'
import { MdItemApi } from '@/api/mes/md/item'
import MdItemTypeTree from '@/views/mes/md/item/type/components/MdItemTypeTree.vue'

const MES_ITEM_OR_PRODUCT = 'mes_md_item_or_product'

export default {
  name: 'MdItemSelectDialog',
  components: { MdItemTypeTree },
  props: { multiple: { type: Boolean, default: true }},
  data() {
    return {
      MES_ITEM_OR_PRODUCT,
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      selectedRows: [],
      selectedRadioId: undefined,
      currentRadioRow: undefined,
      preSelectedIds: [],
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, itemTypeId: undefined, status: CommonStatusEnum.ENABLE }
    }
  },
  methods: {
    formatDateColumn(row, column, value) {
      return formatDate(value)
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
        this.$refs.table.toggleRowSelection(row)
        return
      }
      this.selectedRadioId = row.id
      this.currentRadioRow = row
      this.confirmSelect()
    },
    handleNodeClick(data) {
      this.queryParams.itemTypeId = data && data.id
      this.handleQuery()
    },
    async getList() {
      this.loading = true
      try {
        const data = (await MdItemApi.getItemPage(this.queryParams)).data
        this.list = data.list
        this.total = data.total
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
        this.list.forEach(row => { if (this.preSelectedIds.includes(row.id)) this.$refs.table.toggleRowSelection(row, true) })
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
      this.queryParams.itemTypeId = undefined
      this.queryParams.status = CommonStatusEnum.ENABLE
      if (this.$refs.typeTree) this.$refs.typeTree.reset()
      return this.handleQuery()
    },
    confirmSelect() {
      if (this.multiple) {
        if (this.selectedRows.length === 0) return this.$modal.msgWarning('请至少选择一条数据')
        this.$emit('selected', this.selectedRows)
      } else {
        if (!this.currentRadioRow) return this.$modal.msgWarning('请选择一条数据')
        this.$emit('selected', [this.currentRadioRow])
      }
      this.dialogVisible = false
    },
    async open(selectedIds) {
      this.dialogVisible = true
      Object.assign(this.queryParams, { pageNo: 1, code: undefined, name: undefined, itemTypeId: undefined, status: CommonStatusEnum.ENABLE })
      if (this.$refs.typeTree) this.$refs.typeTree.reset()
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
