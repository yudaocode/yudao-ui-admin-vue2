<template>
  <div class="app-container">
    <doc-alert
      title="【基础】商品、SKU、分类、品牌"
      url="https://doc.iocoder.cn/wms/md/item/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="品牌编号"
        prop="code"
      >
        <el-input
          v-model="queryParams.code"
          clearable
          placeholder="请输入品牌编号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="品牌名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入品牌名称"
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
        <el-button
          v-hasPermi="['wms:item-brand:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['wms:item-brand:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="品牌编号"
        prop="code"
        align="center"
        width="180"
      />
      <el-table-column
        label="品牌名称"
        prop="name"
        align="center"
        min-width="180"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="180"
      >
        <template #default="scope">{{
          parseTime(scope.row.createTime)
        }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="160"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['wms:item-brand:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['wms:item-brand:delete']"
            type="text"
            size="mini"
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
    <item-brand-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { ItemBrandApi } from '@/api/wms/md/item/brand'
import ItemBrandForm from './ItemBrandForm.vue'

export default {
  name: 'WmsItemBrand',
  components: { ItemBrandForm },
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
        name: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return ItemBrandApi.getItemBrandPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.list = data.list
          this.total = data.total
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
      this.resetForm('queryForm')
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleDelete(row) {
      this.$modal
        .confirm('确认删除品牌“' + (row.name || '') + '”吗？')
        .then(() => ItemBrandApi.deleteItemBrand(row.id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.$modal
        .confirm('是否确认导出所有商品品牌数据项？')
        .then(() => {
          this.exportLoading = true
          return ItemBrandApi.exportItemBrand(this.queryParams)
        })
        .then((data) => this.$download.excel(data, '商品品牌.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    }
  }
}
</script>
