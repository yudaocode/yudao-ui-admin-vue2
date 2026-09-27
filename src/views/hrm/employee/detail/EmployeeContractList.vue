<template><div><div class="toolbar"><el-button
  v-hasPermi="['hrm:employee:update']"
  type="primary"
  plain
  icon="el-icon-plus"
  @click="openForm()"
>新增</el-button></div><el-table
  v-loading="loading"
  :data="list"
  stripe
><el-table-column
  label="合同编号"
  prop="no"
  min-width="150"
/><el-table-column
  label="合同类型"
  prop="type"
  width="110"
><template slot-scope="scope">{{ formatEmployeeContractType(scope.row.type) }}</template></el-table-column><el-table-column
  label="开始日期"
  prop="startTime"
  width="120"
  :formatter="dateFormatter2"
/><el-table-column
  label="结束日期"
  prop="endTime"
  width="120"
  :formatter="dateFormatter2"
/><el-table-column
  label="期限"
  prop="term"
  width="90"
><template slot-scope="scope">{{ scope.row.term != null ? scope.row.term + ' 年' : '-' }}</template></el-table-column><el-table-column
  label="合同状态"
  prop="status"
  width="110"
><template slot-scope="scope">{{ formatEmployeeContractStatus(scope.row.status) }}</template></el-table-column><el-table-column
  label="签约公司"
  prop="signCompany"
  min-width="150"
/><el-table-column
  label="签订日期"
  prop="signTime"
  width="120"
><template slot-scope="scope">{{ formatHrmDate(scope.row.signTime) }}</template></el-table-column><el-table-column
  label="到期提醒"
  prop="expireRemind"
  width="100"
><template slot-scope="scope"><dict-tag
  :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
  :value="scope.row.expireRemind"
/></template></el-table-column><el-table-column
  label="备注"
  prop="remark"
  min-width="160"
/><el-table-column
  label="附件"
  min-width="180"
><template slot-scope="scope"><div
  v-if="scope.row.fileUrls && scope.row.fileUrls.length"
  class="file-list"
><el-link
  v-for="url in scope.row.fileUrls"
  :key="url"
  type="primary"
  :underline="false"
  @click="openSafeUrl(url)"
>{{ getFileNameFromUrl(url) }}</el-link></div><span v-else>-</span></template></el-table-column><el-table-column
  label="操作"
  fixed="right"
  width="120"
><template slot-scope="scope"><el-button
  v-hasPermi="['hrm:employee:update']"
  type="text"
  @click="openForm(scope.row)"
>编辑</el-button><el-button
  v-hasPermi="['hrm:employee:delete']"
  type="text"
  class="danger-button"
  @click="handleDelete(scope.row.id)"
>删除</el-button></template></el-table-column></el-table><employee-contract-form
  ref="form"
  @success="getList"
/></div></template>
<script>import { DICT_TYPE } from '@/utils/dict'; import { getFileNameFromUrl } from '@/utils/file'; import { dateFormatter2 } from '@/utils'; import { openSafeUrl } from '@/utils/url'; import { getEmployeeContractList, deleteEmployeeContract } from '@/api/hrm/employee/contract'; import { formatEmployeeContractStatus, formatEmployeeContractType, formatHrmDate } from '@/views/hrm/utils/format'; import EmployeeContractForm from './EmployeeContractForm.vue'; export default { name: 'HrmEmployeeContractList', components: { EmployeeContractForm }, props: { employeeId: { type: Number, required: true }}, data() { return { DICT_TYPE, loading: true, list: [] } }, created() { this.getList() }, methods: { dateFormatter2, openSafeUrl, getFileNameFromUrl, formatEmployeeContractStatus, formatEmployeeContractType, formatHrmDate, async getList() { this.loading = true; try { const response = await getEmployeeContractList(this.employeeId); this.list = response.data } finally { this.loading = false } }, openForm(row) { this.$refs.form.open(this.employeeId, row) }, async handleDelete(id) { if (!id) return; try { await this.$modal.confirm('是否确认删除该合同?'); await deleteEmployeeContract(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) {} } }}</script>
<style scoped>.toolbar { display:flex; justify-content:flex-end; margin-bottom:12px; }.danger-button { color:#f56c6c; }.file-list { display:flex; flex-direction:column; align-items:flex-start; }</style>
