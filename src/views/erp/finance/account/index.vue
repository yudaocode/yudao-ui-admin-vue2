<template>
  <div class="app-container"><doc-alert
                               title="【财务】采购付款、销售收款"
                               url="https://doc.iocoder.cn/sale/finance-payment-receipt/"
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
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
      label="编码"
      prop="no"
    ><el-input
      v-model="queryParams.no"
      placeholder="请输入编码"
      clearable
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
      label="备注"
      prop="remark"
    ><el-input
      v-model="queryParams.remark"
      placeholder="请输入备注"
      clearable
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item><el-button
      type="primary"
      icon="el-icon-search"
      @click="handleQuery"
    >搜索</el-button><el-button
      icon="el-icon-refresh"
      @click="resetQuery"
    >重置</el-button><el-button
      v-hasPermi="['erp:account:create']"
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >新增</el-button><el-button
      v-hasPermi="['erp:account:export']"
      type="success"
      plain
      icon="el-icon-download"
      :loading="exportLoading"
      @click="handleExport"
    >导出</el-button></el-form-item></el-form>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    ><el-table-column
      label="名称"
      prop="name"
      align="center"
    /><el-table-column
      label="编码"
      prop="no"
      align="center"
    /><el-table-column
      label="备注"
      prop="remark"
      align="center"
    /><el-table-column
      label="状态"
      prop="status"
      align="center"
    ><template #default="scope"><dict-tag
      :type="DICT_TYPE.COMMON_STATUS"
      :value="scope.row.status"
    /></template></el-table-column><el-table-column
      label="排序"
      prop="sort"
      align="center"
    /><el-table-column
      label="是否默认"
      prop="defaultStatus"
      align="center"
    ><template #default="scope"><el-switch
      v-model="scope.row.defaultStatus"
      @change="changeDefault(scope.row)"
    /></template></el-table-column><el-table-column
      label="创建时间"
      prop="createTime"
      align="center"
      width="180"
    ><template #default="scope"><span>{{ parseTime(scope.row.createTime) }}</span></template></el-table-column><el-table-column
      label="操作"
      align="center"
    ><template #default="scope"><el-button
      v-hasPermi="['erp:account:update']"
      size="mini"
      type="text"
      @click="openForm('update', scope.row.id)"
    >修改</el-button><el-button
      v-hasPermi="['erp:account:delete']"
      size="mini"
      type="text"
      @click="handleDelete(scope.row.id)"
    >删除</el-button></template></el-table-column></el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /><AccountForm
      ref="form"
      @success="getList"
    />
  </div>
</template>
<script>
import { DICT_TYPE } from '@/utils/dict'
import { getAccountPage, updateAccountDefaultStatus, deleteAccount, exportAccount } from '@/api/erp/finance/account'
import AccountForm from './AccountForm.vue'
export default { name: 'ErpAccount', components: { AccountForm }, data() { return { DICT_TYPE, loading: true, exportLoading: false, list: [], total: 0, queryParams: { pageNo: 1, pageSize: 10, name: undefined, no: undefined, remark: undefined }} }, created() { this.getList() }, methods: {
  getList() { this.loading = true; return getAccountPage(this.queryParams).then(response => { this.list = response.data.list; this.total = response.data.total }).finally(() => { this.loading = false }) },
  handleQuery() { this.queryParams.pageNo = 1; this.getList() }, resetQuery() { this.resetForm('queryForm'); this.handleQuery() }, openForm(type, id) { this.$refs.form.open(type, id) },
  changeDefault(row) { const val = row.defaultStatus; const text = val ? '设置' : '取消'; this.$modal.confirm('确认要' + text + '"' + row.name + '"默认吗？').then(() => updateAccountDefaultStatus(row.id, val)).then(() => { this.getList() }).catch(() => { row.defaultStatus = !val }) },
  handleDelete(id) { this.$modal.confirm('是否确认删除结算账户编号为"' + id + '"的数据项?').then(() => deleteAccount(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) },
  handleExport() { this.$modal.confirm('是否确认导出所有结算账户数据项?').then(() => { this.exportLoading = true; return exportAccount(this.queryParams) }).then(response => this.$download.excel(response.data, '结算账户.xls')).catch(() => {}).finally(() => { this.exportLoading = false }) }
}}
</script>
