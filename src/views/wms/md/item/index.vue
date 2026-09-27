<template>
  <div class="app-container">
    <doc-alert
      title="【基础】商品、SKU、分类、品牌"
      url="https://doc.iocoder.cn/wms/md/item/"
    />
    <el-row :gutter="20">
      <el-col
        :span="4"
        :xs="24"
      ><div class="category-panel">
        <item-category-tree
          ref="categoryTree"
          @node-click="handleCategoryNodeClick"
        /></div></el-col>
      <el-col
        :span="20"
        :xs="24"
      >
        <el-form
          ref="queryForm"
          :model="queryParams"
          :inline="true"
          size="small"
          @submit.native.prevent
        >
          <el-form-item
            label="商品编号"
            prop="code"
          ><el-input
            v-model="queryParams.code"
            clearable
            placeholder="请输入商品编号"
            @keyup.enter.native="handleQuery"
          /></el-form-item>
          <el-form-item
            label="商品名称"
            prop="name"
          ><el-input
            v-model="queryParams.name"
            clearable
            placeholder="请输入商品名称"
            @keyup.enter.native="handleQuery"
          /></el-form-item>
          <el-form-item
            label="商品品牌"
            prop="brandId"
          ><item-brand-select v-model="queryParams.brandId" /></el-form-item>
          <el-form-item><el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button><el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button><el-button
            v-hasPermi="['wms:item:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button><el-button
            v-hasPermi="['wms:item:export']"
            type="success"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button></el-form-item>
        </el-form>
        <el-table
          v-loading="loading"
          :data="list"
          :span-method="spanMethod"
          stripe
          :show-overflow-tooltip="true"
        >
          <el-table-column
            label="商品信息"
            min-width="220"
          ><template #default="scope"><div>{{ scope.row.itemName || "-" }}</div>
            <div
              v-if="scope.row.itemCode"
              class="sub-text"
            >
              {{ scope.row.itemCode }}
            </div>
            <div
              v-if="scope.row.brandName"
              class="sub-text"
            >
              品牌：{{ scope.row.brandName }}
            </div>
            <div
              v-if="scope.row.categoryName"
              class="sub-text"
            >
              分类：{{ scope.row.categoryName }}
            </div></template></el-table-column>
          <el-table-column
            label="规格信息"
            min-width="180"
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
            min-width="140"
          ><template #default="scope"><div
                                        v-if="
                                          scope.row.costPrice !== undefined &&
                                            scope.row.costPrice !== null
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
            min-width="140"
          ><template #default="scope"><div
                                        v-if="
                                          scope.row.netWeight !== undefined &&
                                            scope.row.netWeight !== null
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
          <el-table-column
            label="操作"
            align="center"
            width="120"
          ><template #default="scope"><el-button
            v-hasPermi="['wms:item:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.itemId)"
          >修改</el-button><el-button
            v-hasPermi="['wms:item:delete']"
            type="text"
            size="mini"
            @click="handleDelete(scope.row)"
          >删除</el-button></template></el-table-column>
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
    <item-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { ItemApi } from '@/api/wms/md/item'
import ItemForm from './ItemForm.vue'
import ItemCategoryTree from './category/components/ItemCategoryTree.vue'
import ItemBrandSelect from './brand/components/ItemBrandSelect.vue'
import {
  formatDimensionText,
  formatPrice,
  formatWeight
} from '@/views/wms/utils/format'

export default {
  name: 'WmsItem',
  components: { ItemForm, ItemCategoryTree, ItemBrandSelect },
  data() {
    return {
      loading: false,
      exportLoading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        categoryId: undefined,
        brandId: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatDimensionText,
    formatPrice,
    formatWeight,
    getList() {
      this.loading = true
      return ItemApi.getItemPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.list = this.buildItemSkuRows(data.list || [])
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    buildItemSkuRows(items) {
      const rows = [];
      (items || []).forEach((item) => {
        const skus =
          Array.isArray(item.skus) && item.skus.length ? item.skus : [{}]
        skus.forEach((sku) =>
          rows.push(
            Object.assign({}, sku, {
              itemId: item.id,
              itemCode: item.code,
              itemName: item.name,
              categoryId: item.categoryId,
              categoryName: item.categoryName,
              unit: item.unit,
              brandId: item.brandId,
              brandName: item.brandName
            })
          )
        )
      })
      return rows
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.categoryId = undefined
      this.$refs.categoryTree && this.$refs.categoryTree.reset()
      this.handleQuery()
    },
    handleCategoryNodeClick(categoryId) {
      this.queryParams.categoryId = categoryId
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleDelete(row) {
      this.$modal
        .confirm('确认删除商品“' + (row.itemName || '') + '”吗？')
        .then(() => ItemApi.deleteItem(row.itemId))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.$modal
        .confirm('是否确认导出所有商品数据项？')
        .then(() => {
          this.exportLoading = true
          return ItemApi.exportItem(this.queryParams)
        })
        .then((data) => this.$download.excel(data, '商品.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    },
    spanMethod({ rowIndex, columnIndex }) {
      if (columnIndex !== 0 && columnIndex !== 5) { return { rowspan: 1, colspan: 1 } }
      const row = this.list[rowIndex]
      if (
        rowIndex > 0 &&
        this.list[rowIndex - 1] &&
        this.list[rowIndex - 1].itemId === row.itemId
      ) { return { rowspan: 0, colspan: 0 } }
      let rowspan = 1
      for (let index = rowIndex + 1; index < this.list.length; index++) {
        if (!this.list[index] || this.list[index].itemId !== row.itemId) break
        rowspan++
      }
      return { rowspan, colspan: 1 }
    }
  }
}
</script>

<style scoped>
.category-panel {
  min-height: 500px;
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
</style>
