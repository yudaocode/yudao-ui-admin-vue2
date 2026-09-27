<template>
  <el-dialog
    title="库存选择"
    :visible.sync="visible"
    width="1100px"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="商品名称"
        prop="itemName"
      ><el-input
        v-model="queryParams.itemName"
        clearable
        placeholder="请输入商品名称"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="商品编号"
        prop="itemCode"
      ><el-input
        v-model="queryParams.itemCode"
        clearable
        placeholder="请输入商品编号"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="规格名称"
        prop="skuName"
      ><el-input
        v-model="queryParams.skuName"
        clearable
        placeholder="请输入规格名称"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="规格编号"
        prop="skuCode"
      ><el-input
        v-model="queryParams.skuCode"
        clearable
        placeholder="请输入规格编号"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item><el-button
        type="primary"
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
      border
      stripe
      :row-key="getRowKey"
      :max-height="520"
      @selection-change="handleSelectionChange"
      @row-dblclick="handleRowDblClick"
    >
      <el-table-column
        type="selection"
        width="50"
        align="center"
        :selectable="isRowSelectable"
        :reserve-selection="true"
      />
      <el-table-column
        label="商品信息"
        min-width="210"
      ><template slot-scope="scope"><div>{{ scope.row.itemName || "-" }}</div>
        <span class="sub-text">{{ scope.row.itemCode || "" }}</span></template></el-table-column>
      <el-table-column
        label="规格信息"
        min-width="210"
      ><template slot-scope="scope"><div>{{ scope.row.skuName || "-" }}</div>
        <span class="sub-text">{{ scope.row.skuCode || "" }}</span></template></el-table-column>
      <el-table-column
        label="仓库"
        prop="warehouseName"
        min-width="150"
      />
      <el-table-column
        label="可用库存"
        prop="availableQuantity"
        width="130"
        align="right"
      ><template slot-scope="scope">{{
        formatQuantity(scope.row.availableQuantity)
      }}</template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <span slot="footer"><el-button
      type="primary"
      @click="handleConfirm"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { InventoryApi } from '@/api/wms/inventory'
import { formatQuantity } from '@/views/wms/utils/format'

export default {
  name: 'WmsMovementInventorySelect',
  props: { warehouseId: Number },
  data() {
    return {
      visible: false,
      loading: false,
      list: [],
      total: 0,
      selectedMap: {},
      disabledKeys: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        itemName: undefined,
        itemCode: undefined,
        skuName: undefined,
        skuCode: undefined
      }
    }
  },
  methods: {
    formatQuantity,
    open(selectedKeys) {
      if (!this.warehouseId) {
        this.$modal.msgWarning('请先选择来源仓库')
        return
      }
      this.visible = true
      this.disabledKeys = Array.isArray(selectedKeys)
        ? selectedKeys.slice()
        : []
      this.selectedMap = {}
      this.queryParams = {
        pageNo: 1,
        pageSize: 10,
        itemName: undefined,
        itemCode: undefined,
        skuName: undefined,
        skuCode: undefined
      }
      this.$nextTick(
        () => this.$refs.table && this.$refs.table.clearSelection()
      )
      return this.getList()
    },
    getRowKey(row) {
      return (
        row.rowKey ||
        'inventory-' + (row.id || row.skuId + '-' + row.warehouseId)
      )
    },
    getInventoryKey(row) {
      return row.skuId && row.warehouseId
        ? row.skuId + '-' + row.warehouseId
        : undefined
    },
    getList() {
      if (!this.warehouseId) return Promise.resolve()
      this.loading = true
      const params = Object.assign({}, this.queryParams, {
        type: 'warehouse',
        warehouseId: this.warehouseId,
        onlyPositiveQuantity: true
      })
      return InventoryApi.getInventoryPage(params)
        .then((response) => {
          const page = response.data
          this.list = page.list.map((row) =>
            Object.assign({}, row, {
              availableQuantity: row.quantity,
              rowKey: this.getRowKey(row)
            })
          )
          this.total = page.total
          this.$nextTick(() => this.applySelection())
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        pageNo: 1,
        pageSize: 10,
        itemName: undefined,
        itemCode: undefined,
        skuName: undefined,
        skuCode: undefined
      }
      this.getList()
    },
    isRowSelectable(row) {
      const key = this.getInventoryKey(row)
      return !key || this.disabledKeys.indexOf(key) < 0
    },
    applySelection() {
      if (!this.$refs.table) return
      this.list.forEach((row) => {
        if (this.selectedMap[this.getRowKey(row)]) { this.$refs.table.toggleRowSelection(row, true) }
      })
    },
    handleSelectionChange(rows) {
      const keys = this.list.map((row) => this.getRowKey(row))
      keys.forEach((key) => {
        this.$delete(this.selectedMap, key)
      });
      (rows || [])
        .filter((row) => this.isRowSelectable(row))
        .forEach((row) =>
          this.$set(this.selectedMap, this.getRowKey(row), row)
        )
    },
    handleRowDblClick(row) {
      if (!this.isRowSelectable(row)) {
        this.$modal.msgWarning('该库存已添加')
        return
      }
      this.$set(this.selectedMap, this.getRowKey(row), row)
      this.handleConfirm()
    },
    handleConfirm() {
      const rows = Object.keys(this.selectedMap)
        .map((key) => this.selectedMap[key])
        .filter((row) => row && this.isRowSelectable(row))
      if (!rows.length) {
        this.$modal.msgWarning('请选择库存')
        return
      }
      this.$emit('change', rows)
      this.visible = false
    }
  }
}
</script>

<style scoped>
.sub-text {
  color: #909399;
  font-size: 12px;
}
</style>
