<template>
  <div class="app-container">
    <doc-alert
      title="【产品】产品信息、分类、单位"
      url="https://doc.iocoder.cn/erp/product/"
    />

    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="分类"
        prop="categoryId"
      >
        <Treeselect
          v-model="queryParams.categoryId"
          :options="categoryList"
          :normalizer="normalizer"
          :show-count="true"
          :default-expand-level="1"
          :clearable="true"
          placeholder="请选择分类"
          class="product-category-select"
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
        <el-button
          v-hasPermi="['erp:product:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="handleAdd"
        >新增</el-button>
        <el-button
          v-hasPermi="['erp:product:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="条码"
        align="center"
        prop="barCode"
        min-width="130"
      />
      <el-table-column
        label="名称"
        align="center"
        prop="name"
        min-width="140"
      />
      <el-table-column
        label="规格"
        align="center"
        prop="standard"
        min-width="120"
      />
      <el-table-column
        label="分类"
        align="center"
        prop="categoryName"
        min-width="120"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unitName"
        width="90"
      />
      <el-table-column
        label="采购价格"
        align="center"
        prop="purchasePrice"
        width="110"
      >
        <template #default="scope">{{ formatPrice(scope.row.purchasePrice) }}</template>
      </el-table-column>
      <el-table-column
        label="销售价格"
        align="center"
        prop="salePrice"
        width="110"
      >
        <template #default="scope">{{ formatPrice(scope.row.salePrice) }}</template>
      </el-table-column>
      <el-table-column
        label="最低价格"
        align="center"
        prop="minPrice"
        width="110"
      >
        <template #default="scope">{{ formatPrice(scope.row.minPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        width="90"
      >
        <template #default="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="130"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['erp:product:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['erp:product:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <product-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {
  deleteProduct,
  exportProduct,
  getProductPage
} from '@/api/erp/product/product'
import { getProductCategorySimpleList } from '@/api/erp/product/category'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { handleTree } from '@/utils/ruoyi'
import ProductForm from './ProductForm.vue'

export default {
  name: 'ErpProduct',
  components: { Treeselect, ProductForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      exportLoading: false,
      total: 0,
      list: [],
      categoryList: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        categoryId: undefined
      }
    }
  },
  created() {
    this.getList()
    this.getCategoryList()
  },
  methods: {
    getList() {
      this.loading = true
      return getProductPage(this.queryParams).then((response) => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    getCategoryList() {
      return getProductCategorySimpleList().then((response) => {
        this.categoryList = handleTree(response.data, 'id', 'parentId')
      })
    },
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children && node.children.length ? node.children : undefined
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.form.open('create')
    },
    handleUpdate(row) {
      this.$refs.form.open('update', row.id)
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除产品编号为"' + row.id + '"的数据项?').then(() => {
        return deleteProduct(row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出所有产品数据项?').then(() => {
        this.exportLoading = true
        return exportProduct(this.queryParams)
      }).then((response) => {
        this.$download.excel(response.data, '产品.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    },
    formatPrice(value) {
      if (value === undefined || value === null || value === '') return ''
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(2) : ''
    }
  }
}
</script>

<style scoped>
.product-category-select {
  width: 240px;
}
</style>
