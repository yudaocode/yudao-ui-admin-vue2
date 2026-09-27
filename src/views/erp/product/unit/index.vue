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
        label="单位名字"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入单位名字"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="单位状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择单位状态"
          clearable
        >
          <el-option
            v-for="dict in statusDictDatas"
            :key="dict.value"
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
          v-hasPermi="['erp:product-unit:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['erp:product-unit:export']"
          type="success"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-col>
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
        label="名字"
        align="center"
        prop="name"
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
            v-hasPermi="['erp:product-unit:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['erp:product-unit:delete']"
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

    <product-unit-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import {
  deleteProductUnit,
  exportProductUnit,
  getProductUnitPage
} from '@/api/erp/product/unit'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import ProductUnitForm from './ProductUnitForm.vue'

export default {
  name: 'ErpProductUnit',
  components: { ProductUnitForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      exportLoading: false,
      total: 0,
      list: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return getProductUnitPage(this.queryParams).then((response) => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.form.open('create')
    },
    handleUpdate(row) {
      this.$refs.form.open('update', row.id)
    },
    handleDelete(row) {
      this.$modal.delConfirm().then(() => {
        return deleteProductUnit(row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleExport() {
      this.$modal.exportConfirm().then(() => {
        this.exportLoading = true
        return exportProductUnit(this.queryParams)
      }).then((response) => {
        this.$download.excel(response.data, '产品单位.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    }
  }
}
</script>
