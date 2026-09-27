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
    >
      <el-form-item
        label="产品名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        placeholder="请输入产品名称"
        clearable
        style="width:240px"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-select
        v-model="queryParams.status"
        placeholder="请选择状态"
        clearable
        style="width:160px"
      ><el-option
        v-for="dict in statusDictDatas"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item><el-button
        type="primary"
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button><el-button
        v-hasPermi="['crm:product:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="handleAdd"
      >新增</el-button><el-button
        v-hasPermi="['crm:product:export']"
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
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="产品名称"
        prop="name"
        min-width="150"
      ><template slot-scope="scope"><el-link
        type="primary"
        :underline="false"
        @click="openDetail(scope.row.id)"
      >{{ scope.row.name || '-' }}</el-link></template></el-table-column><el-table-column
        label="产品类型"
        prop="categoryName"
        min-width="120"
      /><el-table-column
        label="产品单位"
        prop="unit"
        width="100"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.CRM_PRODUCT_UNIT"
        :value="scope.row.unit"
      /></template></el-table-column><el-table-column
        label="产品编码"
        prop="no"
        min-width="120"
      />
      <el-table-column
        label="价格（元）"
        prop="price"
        width="120"
        :formatter="erpPriceTableColumnFormatter"
      /><el-table-column
        label="产品描述"
        prop="description"
        width="150"
      /><el-table-column
        label="上架状态"
        prop="status"
        width="100"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.CRM_PRODUCT_STATUS"
        :value="scope.row.status"
      /></template></el-table-column><el-table-column
        label="负责人"
        prop="ownerUserName"
        width="120"
      /><el-table-column
        label="更新时间"
        prop="updateTime"
        width="180"
      ><template slot-scope="scope">{{ parseTime(scope.row.updateTime) }}</template></el-table-column><el-table-column
        label="创建人"
        prop="creatorName"
        width="120"
      /><el-table-column
        label="创建时间"
        prop="createTime"
        width="180"
      ><template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
      <el-table-column
        label="操作"
        width="130"
        fixed="right"
      ><template slot-scope="scope"><el-button
        v-hasPermi="['crm:product:update']"
        size="mini"
        type="text"
        icon="el-icon-edit"
        @click="handleUpdate(scope.row)"
      >编辑</el-button><el-button
        v-hasPermi="['crm:product:delete']"
        size="mini"
        type="text"
        icon="el-icon-delete"
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
    <product-form
      ref="form"
      @success="getList"
    />
  </div>
</template>
<script>
import { deleteProduct, exportProduct, getProductPage } from '@/api/crm/product'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { erpPriceTableColumnFormatter } from '@/utils'
import ProductForm from './ProductForm.vue'
export default {
  name: 'CrmProduct', components: { ProductForm },
  data() { return { DICT_TYPE, loading: true, exportLoading: false, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, name: undefined, status: undefined }} },
  computed: {
    statusDictDatas() { return getIntDictOptions(DICT_TYPE.CRM_PRODUCT_STATUS) }
  },
  created() { this.getList() },
  methods: {
    erpPriceTableColumnFormatter,
    getList() { this.loading = true; return getProductPage(this.queryParams).then((response) => { const page = response.data; this.list = page.list; this.total = page.total }).finally(() => { this.loading = false }) },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() }, resetQuery() { this.$refs.queryForm.resetFields(); this.handleQuery() }, handleAdd() { this.$refs.form.open('create') }, handleUpdate(row) { this.$refs.form.open('update', row.id) }, openDetail(id) { this.$router.push({ name: 'CrmProductDetail', params: { id }}).catch(() => {}) },
    handleDelete(row) { this.$modal.confirm('是否确认删除产品编号为"' + row.id + '"的数据项?').then(() => deleteProduct(row.id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) },
    handleExport() { this.$modal.confirm('是否确认导出所有产品数据项?').then(() => { this.exportLoading = true; return exportProduct(this.queryParams) }).then((response) => { this.$download.excel(response.data, '产品.xls') }).catch(() => {}).finally(() => { this.exportLoading = false }) }
  }
}
</script>
