<template>
  <el-dialog
    title="商品选择"
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
        prop="name"
      ><el-input
        v-model="queryParams.name"
        clearable
        placeholder="请输入规格名称"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="规格编号"
        prop="code"
      ><el-input
        v-model="queryParams.code"
        clearable
        placeholder="请输入规格编号"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="条码"
        prop="barCode"
      ><el-input
        v-model="queryParams.barCode"
        clearable
        placeholder="请输入条码"
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
      row-key="id"
      :max-height="520"
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
      ><template #default="scope"><div>{{ scope.row.itemName || "-" }}</div>
        <div
          v-if="scope.row.itemCode"
          class="sub-text"
        >
          商品编号：{{ scope.row.itemCode }}
        </div>
        <div
          v-if="scope.row.brandName"
          class="sub-text"
        >
          品牌：{{ scope.row.brandName }}
        </div></template></el-table-column>
      <el-table-column
        label="规格信息"
        min-width="220"
      ><template #default="scope"><div>{{ scope.row.name || "-" }}</div>
        <div
          v-if="scope.row.code"
          class="sub-text"
        >
          编号：{{ scope.row.code }}
        </div>
        <div
          v-if="scope.row.barCode"
          class="sub-text"
        >
          条码：{{ scope.row.barCode }}
        </div></template></el-table-column>
      <el-table-column
        label="金额(元)"
        min-width="150"
      ><template #default="scope"><div
                                    v-if="
                                      scope.row.costPrice !== undefined && scope.row.costPrice !== null
                                    "
                                  >
                                    成本价：{{ formatPrice(scope.row.costPrice) }}
                                  </div>
        <div
          v-if="
            scope.row.sellingPrice !== undefined &&
              scope.row.sellingPrice !== null
          "
        >
          销售价：{{ formatPrice(scope.row.sellingPrice) }}
        </div></template></el-table-column>
      <el-table-column
        label="重量(kg)"
        min-width="150"
      ><template #default="scope"><div
                                    v-if="
                                      scope.row.netWeight !== undefined && scope.row.netWeight !== null
                                    "
                                  >
                                    净重：{{ formatWeight(scope.row.netWeight) }}
                                  </div>
        <div
          v-if="
            scope.row.grossWeight !== undefined &&
              scope.row.grossWeight !== null
          "
        >
          毛重：{{ formatWeight(scope.row.grossWeight) }}
        </div></template></el-table-column>
      <el-table-column
        label="长宽高(cm)"
        min-width="180"
        align="right"
      ><template #default="scope">{{
        formatDimensionText(
          scope.row.length,
          scope.row.width,
          scope.row.height
        ) || "-"
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
import { ItemSkuApi } from '@/api/wms/md/item/sku'
import {
  formatDimensionText,
  formatPrice,
  formatWeight
} from '@/views/wms/utils/format'

export default {
  name: 'WmsItemSkuSelect',
  props: { value: Array, modelValue: Array },
  data() {
    return {
      visible: false,
      loading: false,
      list: [],
      total: 0,
      multiple: true,
      selectedIds: [],
      disabledIds: [],
      selectedMap: {},
      queryParams: this.getDefaultQueryParams()
    }
  },
  methods: {
    formatDimensionText,
    formatPrice,
    formatWeight,
    getDefaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        itemName: undefined,
        itemCode: undefined,
        name: undefined,
        code: undefined,
        barCode: undefined
      }
    },
    open(selectedIds, options) {
      this.visible = true
      this.multiple = !options || options.multiple !== false
      this.selectedIds = Array.isArray(selectedIds) ? selectedIds.slice() : []
      this.disabledIds =
        options && options.preselectDisabled === false
          ? []
          : this.selectedIds.slice()
      this.selectedMap = {}
      this.queryParams = this.getDefaultQueryParams()
      this.$nextTick(
        () => this.$refs.table && this.$refs.table.clearSelection()
      )
      return this.getList()
    },
    getList() {
      this.loading = true
      return ItemSkuApi.getItemSkuPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.list = data.list
          this.total = data.total
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
      this.queryParams = this.getDefaultQueryParams()
      this.$nextTick(
        () => this.$refs.queryForm && this.$refs.queryForm.clearValidate()
      )
      this.getList()
    },
    isRowSelectable(row) {
      return !row.id || this.disabledIds.indexOf(row.id) < 0
    },
    applySelection() {
      if (!this.$refs.table) return
      this.list.forEach((row) => {
        if (
          row.id &&
          (this.selectedIds.indexOf(row.id) >= 0 || this.selectedMap[row.id])
        ) { this.$refs.table.toggleRowSelection(row, true) }
      })
    },
    handleSelectionChange(rows) {
      if (!this.multiple) {
        const row = rows
          .filter((item) => item.id && this.disabledIds.indexOf(item.id) < 0)
          .pop()
        this.selectedMap = row ? { [row.id]: row } : {}
        if (row) this.$emit('change', [row])
        return
      }
      const pageIds = this.list
        .map((row) => row.id)
        .filter((id) => id !== undefined && this.disabledIds.indexOf(id) < 0)
      pageIds.forEach((id) => {
        delete this.selectedMap[id]
      })
      rows.forEach((row) => {
        if (row.id) this.selectedMap[row.id] = row
      })
    },
    handleRowDblClick(row) {
      if (row.id && this.disabledIds.indexOf(row.id) >= 0) return
      if (!this.multiple) {
        this.$emit('change', [row])
        this.visible = false
        return
      }
      this.$refs.table && this.$refs.table.toggleRowSelection(row)
    },
    handleConfirm() {
      const rows = Object.keys(this.selectedMap)
        .map((id) => this.selectedMap[id])
        .filter((row) => row && this.disabledIds.indexOf(row.id) < 0)
      if (!rows.length) {
        this.$modal.msgWarning('请至少选择一条数据')
        return
      }
      this.$emit('change', rows)
      this.$emit('input', rows)
      this.$emit('update:modelValue', rows)
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
