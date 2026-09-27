<template>
  <div class="app-container"><doc-alert
                               title="【基础】车间设置、工作站设置"
                               url="https://doc.iocoder.cn/mes/md/workshop/"
                             />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
      @submit.native.prevent
    ><el-form-item
      label="车间编码"
      prop="code"
    ><el-input
      v-model="queryParams.code"
      placeholder="请输入车间编码"
      clearable
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
      label="车间名称"
      prop="name"
    ><el-input
      v-model="queryParams.name"
      placeholder="请输入车间名称"
      clearable
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
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
    /></el-select></el-form-item><el-form-item><el-button
      icon="el-icon-search"
      @click="handleQuery"
    >搜索</el-button><el-button
      icon="el-icon-refresh"
      @click="resetQuery"
    >重置</el-button><el-button
      v-hasPermi="['mes:md-workshop:create']"
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >新增</el-button></el-form-item></el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    ><el-table-column
      label="车间编码"
      align="center"
      prop="code"
    ><template v-slot="scope"><el-link
      type="primary"
      @click="openForm('detail', scope.row.id)"
    >{{ scope.row.code }}</el-link></template></el-table-column><el-table-column
      label="车间名称"
      align="center"
      prop="name"
      width="150"
    /><el-table-column
      label="面积"
      align="center"
      prop="area"
    /><el-table-column
      label="负责人"
      align="center"
      prop="chargeUserName"
    /><el-table-column
      label="状态"
      align="center"
      prop="status"
    ><template v-slot="scope"><dict-tag
      :type="DICT_TYPE.COMMON_STATUS"
      :value="scope.row.status"
    /></template></el-table-column><el-table-column
      label="备注"
      align="center"
      prop="remark"
    /><el-table-column
      label="操作"
      align="center"
      width="150"
    ><template v-slot="scope"><el-button
      v-hasPermi="['mes:md-workshop:update']"
      type="text"
      @click="openForm('update', scope.row.id)"
    >编辑</el-button><el-button
      v-hasPermi="['mes:md-workshop:delete']"
      type="text"
      @click="handleDelete(scope.row.id)"
    >删除</el-button></template></el-table-column></el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /><workshop-form
      ref="form"
      @success="getList"
    />
  </div>
</template>
<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { MdWorkshopApi } from '@/api/mes/md/workstation/workshop'
import WorkshopForm from './WorkshopForm.vue'
export default { name: 'MesMdWorkshop', components: { WorkshopForm }, data() { return { DICT_TYPE, loading: true, list: [], total: 0, statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS), queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, status: undefined }} }, created() { this.getList() }, methods: { async getList() { this.loading = true; try { const response = await MdWorkshopApi.getWorkshopPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } }, handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.resetForm('queryForm'); return this.handleQuery() }, openForm(type, id) { this.$refs.form.open(type, id) }, async handleDelete(id) { try { await this.$modal.confirm('是否确认删除车间？'); await MdWorkshopApi.deleteWorkshop(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除 */ } } }}
</script>
