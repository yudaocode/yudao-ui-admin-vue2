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
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="开启状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择开启状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusDictDatas"
            :key="parseInt(dict.value)"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
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

    <el-row
      :gutter="10"
      class="mb8"
    >
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['erp:product-category:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['erp:product-category:export']"
          type="success"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="list"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        label="编码"
        align="center"
        prop="code"
      />
      <el-table-column
        label="名称"
        align="center"
        prop="name"
      />
      <el-table-column
        label="排序"
        align="center"
        prop="sort"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
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
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['erp:product-category:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['erp:product-category:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <product-category-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import {
  deleteProductCategory,
  exportProductCategory,
  getProductCategoryList
} from '@/api/erp/product/category'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { handleTree } from '@/utils/ruoyi'
import ProductCategoryForm from './ProductCategoryForm.vue'

export default {
  name: 'ErpProductCategory',
  components: { ProductCategoryForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      exportLoading: false,
      list: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        name: undefined,
        status: undefined
      },
      isExpandAll: true,
      refreshTable: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return getProductCategoryList(this.queryParams).then((response) => {
        this.list = handleTree(response.data, 'id', 'parentId')
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
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
      this.$modal.confirm('是否确认删除产品分类编号为"' + row.id + '"的数据项?').then(() => {
        return deleteProductCategory(row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出所有产品分类数据项?').then(() => {
        this.exportLoading = true
        return exportProductCategory(this.queryParams)
      }).then((response) => {
        this.$download.excel(response.data, '产品分类.xls')
      }).finally(() => {
        this.exportLoading = false
      })
    },
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    }
  }
}
</script>
