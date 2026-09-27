<template>
  <div class="app-container">
    <doc-alert
      title="【基础】物料产品、分类、计量单位"
      url="https://doc.iocoder.cn/mes/md/product/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="分类名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        placeholder="请输入分类名称"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-select
        v-model="queryParams.status"
        placeholder="请选择状态"
        clearable
      ><el-option
        v-for="dict in statusOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item><el-button
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button><el-button
        v-hasPermi="['mes:md-item-type:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增</el-button><el-button
        type="danger"
        plain
        icon="el-icon-sort"
        @click="toggleExpandAll"
      >展开/折叠</el-button></el-form-item>
    </el-form>
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      row-key="id"
      :default-expand-all="isExpandAll"
    >
      <el-table-column
        label="分类名称"
        align="left"
        prop="name"
      /><el-table-column
        label="分类编码"
        align="center"
        prop="code"
      />
      <el-table-column
        label="物料/产品"
        align="center"
        prop="itemOrProduct"
      ><template v-slot="scope"><dict-tag
        :type="DICT_TYPE.MES_MD_ITEM_OR_PRODUCT"
        :value="scope.row.itemOrProduct"
      /></template></el-table-column>
      <el-table-column
        label="排序"
        align="center"
        prop="sort"
      /><el-table-column
        label="状态"
        align="center"
        prop="status"
      ><template v-slot="scope"><dict-tag
        :type="DICT_TYPE.COMMON_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      ><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
      ><template v-slot="scope"><el-button
        v-hasPermi="['mes:md-item-type:create']"
        type="text"
        @click="openForm('create', undefined, scope.row.id)"
      >新增子分类</el-button><el-button
        v-hasPermi="['mes:md-item-type:update']"
        type="text"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-if="scope.row.parentId !== 0"
        v-hasPermi="['mes:md-item-type:delete']"
        type="text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <md-item-type-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { handleTree } from '@/utils/tree'
import { MdItemTypeApi } from '@/api/mes/md/item/type'
import MdItemTypeForm from './MdItemTypeForm.vue'
export default {
  name: 'MesMdItemType', components: { MdItemTypeForm },
  data() { return { DICT_TYPE, loading: true, list: [], queryParams: { name: undefined, status: undefined }, statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS), isExpandAll: true, refreshTable: true } },
  created() { this.getList() },
  methods: {
    parseTime,
    async getList() { this.loading = true; try { const response = await MdItemTypeApi.getItemTypeList(this.queryParams); this.list = handleTree(response.data) } finally { this.loading = false } },
    handleQuery() { return this.getList() }, resetQuery() { this.resetForm('queryForm'); return this.handleQuery() }, openForm(type, id, parentId) { this.$refs.form.open(type, id, parentId) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除物料产品分类？'); await MdItemTypeApi.deleteItemType(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除 */ } },
    async toggleExpandAll() { this.refreshTable = false; this.isExpandAll = !this.isExpandAll; await this.$nextTick(); this.refreshTable = true }
  }
}
</script>
