<!-- MES 产品 BOM 子物料弹窗选择器 -->
<template>
  <el-dialog
    title="产品 BOM 物料选择"
    :visible.sync="dialogVisible"
    width="800px"
    append-to-body
  >
    <el-table
      ref="table"
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      row-key="bomItemId"
      highlight-current-row
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
    >
      <el-table-column
        width="50"
        align="center"
      >
        <template #default="scope">
          <el-radio
            v-model="selectedRadioId"
            :label="scope.row.bomItemId"
            class="radio-no-label"
            @change="handleRadioChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="物料编码"
        align="center"
        prop="bomItemCode"
        width="160"
      />
      <el-table-column
        label="物料名称"
        align="left"
        prop="bomItemName"
        min-width="150"
      />
      <el-table-column
        label="规格型号"
        align="left"
        prop="bomItemSpecification"
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
      >
        <template #default="scope"><dict-tag
          :type="MES_MD_ITEM_OR_PRODUCT"
          :value="scope.row.itemOrProduct"
        /></template>
      </el-table-column>
      <el-table-column
        label="用量比例"
        align="center"
        prop="quantity"
        width="100"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="120"
        show-overflow-tooltip
      />
    </el-table>
    <span slot="footer"><el-button
      type="primary"
      @click="confirmSelect"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { MdProductBomApi } from '@/api/mes/md/item/productBom'

const MES_MD_ITEM_OR_PRODUCT = 'mes_md_item_or_product'

export default {
  name: 'MdProductBomSelectDialog',
  data() {
    return { MES_MD_ITEM_OR_PRODUCT, dialogVisible: false, loading: false, list: [], selectedRadioId: undefined, currentRow: undefined }
  },
  methods: {
    handleRadioChange(row) { this.currentRow = row },
    handleRowClick(row) { this.selectedRadioId = row.bomItemId; this.currentRow = row },
    handleRowDblClick(row) { this.handleRowClick(row); this.confirmSelect() },
    confirmSelect() {
      if (!this.currentRow) { this.$modal.msgWarning('请选择一条数据'); return }
      this.$emit('selected', this.currentRow)
      this.dialogVisible = false
    },
    async open(itemId, selectedBomItemId) {
      this.dialogVisible = true
      this.selectedRadioId = selectedBomItemId
      this.currentRow = undefined
      this.loading = true
      try {
        const response = await MdProductBomApi.getProductBomListByItemId(itemId)
        this.list = response.data
        if (selectedBomItemId != null) {
          this.currentRow = this.list.find(row => row.bomItemId === selectedBomItemId)
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>.radio-no-label >>> .el-radio__label { display: none; }</style>
