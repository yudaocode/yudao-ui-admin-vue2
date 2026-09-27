<template>
  <div class="app-container">
    <doc-alert
      title="【产品】产品管理、产品分类"
      url="https://doc.iocoder.cn/crm/product/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    ><el-form-item
      label="名称"
      prop="name"
    ><el-input
      v-model="queryParams.name"
      placeholder="请输入名称"
      clearable
      style="width:240px"
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item><el-button
      type="primary"
      icon="el-icon-search"
      @click="handleQuery"
    >搜索</el-button><el-button
      icon="el-icon-refresh"
      @click="resetQuery"
    >重置</el-button><el-button
      v-hasPermi="['crm:product-category:create']"
      type="primary"
      plain
      icon="el-icon-plus"
      @click="handleAdd"
    >新增</el-button></el-form-item></el-form>
    <el-table
      v-loading="loading"
      :data="list"
      row-key="id"
      default-expand-all
    ><el-table-column
      label="分类编号"
      prop="id"
      width="120"
      align="center"
    /><el-table-column
      label="分类名称"
      prop="name"
    /><el-table-column
      label="创建时间"
      prop="createTime"
      width="180"
    ><template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column><el-table-column
      label="操作"
      width="130"
    ><template slot-scope="scope"><el-button
      v-hasPermi="['crm:product-category:update']"
      size="mini"
      type="text"
      icon="el-icon-edit"
      @click="handleUpdate(scope.row)"
    >修改</el-button><el-button
      v-hasPermi="['crm:product-category:delete']"
      size="mini"
      type="text"
      icon="el-icon-delete"
      @click="handleDelete(scope.row)"
    >删除</el-button></template></el-table-column></el-table>
    <product-category-form
      ref="form"
      @success="getList"
    />
  </div>
</template>
<script>
import { deleteProductCategory, getProductCategoryList } from '@/api/crm/product/category'
import { handleTree } from '@/utils/ruoyi'
import ProductCategoryForm from './ProductCategoryForm.vue'
export default {
  name: 'CrmProductCategory', components: { ProductCategoryForm }, data() { return { loading: true, list: [], queryParams: { name: undefined }} }, created() { this.getList() },
  methods: {
    getList() { this.loading = true; return getProductCategoryList(this.queryParams).then((response) => { this.list = handleTree(response.data, 'id', 'parentId') }).finally(() => { this.loading = false }) },
    handleQuery() { this.getList() }, resetQuery() { this.$refs.queryForm.resetFields(); this.handleQuery() }, handleAdd() { this.$refs.form.open('create') }, handleUpdate(row) { this.$refs.form.open('update', row.id) },
    handleDelete(row) { this.$modal.confirm('是否确认删除分类编号为"' + row.id + '"的数据项?').then(() => deleteProductCategory(row.id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) }
  }
}
</script>
