<!-- MES 工艺路线列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【生产】工序设置、工艺流程"
      url="https://doc.iocoder.cn/mes/pro/process-route/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
      @submit.native.prevent
    ><el-form-item
      label="路线编码"
      prop="code"
    ><el-input
      v-model="queryParams.code"
      placeholder="请输入工艺路线编码"
      clearable
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
      label="路线名称"
      prop="name"
    ><el-input
      v-model="queryParams.name"
      placeholder="请输入工艺路线名称"
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
      v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
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
      v-hasPermi="['mes:pro-route:create']"
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >新增</el-button><el-button
      v-hasPermi="['mes:pro-route:export']"
      type="success"
      plain
      icon="el-icon-download"
      :loading="exportLoading"
      @click="handleExport"
    >导出</el-button></el-form-item></el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
    ><el-table-column
       label="路线编码"
       align="center"
       prop="code"
       min-width="180"
     ><template #default="scope"><el-button
       type="text"
       @click="openForm('detail', scope.row.id)"
     >{{ scope.row.code }}</el-button></template></el-table-column><el-table-column
       label="路线名称"
       align="center"
       prop="name"
       min-width="200"
     /><el-table-column
       label="路线说明"
       align="center"
       prop="description"
       min-width="200"
     />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        min-width="100"
      ><template #default="scope"><el-switch
        v-model="scope.row.status"
        :active-value="0"
        :inactive-value="1"
        :disabled="!checkPermi(['mes:pro-route:update'])"
        @change="handleStatusChange(scope.row)"
      /></template></el-table-column><el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="120"
      /><el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="操作"
        align="center"
        width="220"
        fixed="right"
      ><template #default="scope"><el-tooltip
        :disabled="scope.row.status === CommonStatusEnum.DISABLE"
        content="仅停用状态，才可以操作"
        placement="top"
      ><span><el-button
        v-hasPermi="['mes:pro-route:update']"
        type="text"
        :disabled="scope.row.status !== CommonStatusEnum.DISABLE"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button></span></el-tooltip><el-tooltip
        :disabled="scope.row.status === CommonStatusEnum.DISABLE"
        content="仅停用状态，才可以操作"
        placement="top"
      ><span><el-button
        v-hasPermi="['mes:pro-route:delete']"
        type="text"
        class="danger-text"
        :disabled="scope.row.status !== CommonStatusEnum.DISABLE"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></span></el-tooltip></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /><route-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { CommonStatusEnum } from '@/utils/constants'
import { checkPermi } from '@/utils/permission'
import download from '@/plugins/download'
import { ProRouteApi } from '@/api/mes/pro/route'
import RouteForm from './RouteForm.vue'

export default {
  name: 'MesProRoute', components: { RouteForm },
  data() { return { DICT_TYPE, CommonStatusEnum, loading: true, list: [], total: 0, exportLoading: false, queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, status: undefined }} },
  created() { this.getList() },
  methods: {
    getIntDictOptions, dateFormatter, checkPermi,
    async getList() { this.loading = true; try { const response = await ProRouteApi.getRoutePage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.$refs.queryForm.resetFields(); return this.handleQuery() },
    async handleStatusChange(row) { try { const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'; await this.$modal.confirm('确认要“' + text + '”“' + row.name + '”工艺路线吗?'); await ProRouteApi.updateRouteStatus(row.id, row.status); await this.getList() } catch (error) { row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE } },
    openForm(type, id) { this.$refs.form.open(type, id) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该工艺路线？'); await ProRouteApi.deleteRoute(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* canceled */ } },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有工艺路线？'); this.exportLoading = true; const response = await ProRouteApi.exportRoute(this.queryParams); download.excel(response, '工艺路线.xls') } catch (error) { /* canceled */ } finally { this.exportLoading = false } }
  }
}
</script>

<style scoped>.danger-text { color: #f56c6c; }</style>
