<!-- 出库单库存选择器（Vue2 版） -->
<template>
  <el-dialog
    title="库存选择"
    :visible.sync="visible"
    width="1120px"
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
      >
        <el-input
          v-model="queryParams.itemName"
          clearable
          placeholder="请输入商品名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="商品编号"
        prop="itemCode"
      >
        <el-input
          v-model="queryParams.itemCode"
          clearable
          placeholder="请输入商品编号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="规格名称"
        prop="skuName"
      >
        <el-input
          v-model="queryParams.skuName"
          clearable
          placeholder="请输入规格名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="规格编号"
        prop="skuCode"
      >
        <el-input
          v-model="queryParams.skuCode"
          clearable
          placeholder="请输入规格编号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
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
      :row-key="getRowKey"
      :max-height="520"
      border
      stripe
      @selection-change="handleSelectionChange"
      @row-dblclick="handleRowDblClick"
    >
      <el-table-column
        type="selection"
        width="50"
        align="center"
        :reserve-selection="true"
        :selectable="isRowSelectable"
      />
      <el-table-column
        label="商品信息"
        min-width="220"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.itemName || "-" }}</div>
          <div
            v-if="scope.row.itemCode"
            class="sub-text"
          >
            商品编号：{{ scope.row.itemCode }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="规格信息"
        min-width="220"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.skuName || "-" }}</div>
          <div
            v-if="scope.row.skuCode"
            class="sub-text"
          >
            规格编号：{{ scope.row.skuCode }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="仓库"
        min-width="160"
      >
        <template slot-scope="scope">{{
          scope.row.warehouseName || "-"
        }}</template>
      </el-table-column>
      <el-table-column
        label="可用库存"
        width="130"
        align="right"
      >
        <template slot-scope="scope">{{
          formatQuantity(scope.row.availableQuantity)
        }}</template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <span slot="footer">
      <el-button
        type="primary"
        @click="handleConfirm"
      >确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { InventoryApi } from '@/api/wms/inventory'
import { formatQuantity } from '@/views/wms/utils/format'

export default {
  name: 'WmsShipmentInventorySelect',
  props: {
    warehouseId: {
      type: [Number, String],
      default: undefined
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      list: [],
      total: 0,
      selectedMap: {},
      disabledInventoryKeys: {},
      queryParams: this.getDefaultQueryParams()
    }
  },
  methods: {
    formatQuantity,
    getDefaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        itemName: undefined,
        itemCode: undefined,
        skuName: undefined,
        skuCode: undefined
      }
    },
    async open(selectedInventoryKeys) {
      if (
        this.warehouseId === undefined ||
        this.warehouseId === null ||
        this.warehouseId === ''
      ) {
        this.$modal.msgWarning('请先选择仓库')
        return
      }
      this.visible = true
      this.queryParams = this.getDefaultQueryParams()
      this.selectedMap = {}
      this.disabledInventoryKeys = {}
      const keys = Array.isArray(selectedInventoryKeys)
        ? selectedInventoryKeys
        : []
      keys.forEach((key) => {
        this.$set(this.disabledInventoryKeys, key, true)
      })
      await this.$nextTick()
      if (this.$refs.table) this.$refs.table.clearSelection()
      await this.getList()
    },
    async getList() {
      this.loading = true
      const params = Object.assign({}, this.queryParams, {
        type: 'warehouse',
        warehouseId: this.warehouseId,
        onlyPositiveQuantity: true
      })
      try {
        const response = await InventoryApi.getInventoryPage(params)
        const page = response.data
        this.list = page.list.map((inventory) =>
          Object.assign({}, inventory, {
            availableQuantity:
              inventory.availableQuantity === undefined
                ? inventory.quantity
                : inventory.availableQuantity
          })
        )
        this.total = page.total
        await this.$nextTick()
        this.applySelection()
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = this.getDefaultQueryParams()
      this.$nextTick(
        () => this.$refs.queryForm && this.$refs.queryForm.clearValidate()
      )
      this.getList()
    },
    getRowKey(row) {
      return 'inventory-' + (row.id || row.skuId + '-' + row.warehouseId)
    },
    getInventoryKey(row) {
      return row.skuId && row.warehouseId
        ? row.skuId + '-' + row.warehouseId
        : undefined
    },
    isRowSelectable(row) {
      const key = this.getInventoryKey(row)
      return !key || !this.disabledInventoryKeys[key]
    },
    applySelection() {
      if (!this.$refs.table) return
      this.list.forEach((row) => {
        if (this.selectedMap[this.getRowKey(row)]) { this.$refs.table.toggleRowSelection(row, true) }
      })
    },
    handleSelectionChange(rows) {
      const currentKeys = this.list.map((row) => this.getRowKey(row))
      currentKeys.forEach((key) => this.$delete(this.selectedMap, key))
      rows
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
