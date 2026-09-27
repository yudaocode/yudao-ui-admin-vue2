<template><el-card
  v-loading="loading"
  shadow="never"
  class="section-card"
><div
  slot="header"
  class="card-header"
><span>工资卡</span><div><el-button
  v-hasPermi="['hrm:employee:update']"
  type="primary"
  plain
  icon="el-icon-edit"
  @click="openForm"
>编辑</el-button><el-button
  v-if="salaryCard && salaryCard.id"
  v-hasPermi="['hrm:employee:update']"
  type="danger"
  plain
  icon="el-icon-delete"
  @click="handleDelete"
>删除</el-button></div></div><el-descriptions
  :column="3"
  border
><el-descriptions-item label="银行卡号">{{ salaryCard && salaryCard.bankCardNumber || '-' }}</el-descriptions-item><el-descriptions-item label="开户地区">{{ salaryCard && salaryCard.bankAreaName || '-' }}</el-descriptions-item><el-descriptions-item label="银行名称">{{ salaryCard && salaryCard.bankName || '-' }}</el-descriptions-item><el-descriptions-item
  label="开户支行"
  :span="3"
>{{ salaryCard && salaryCard.bankBranchName || '-' }}</el-descriptions-item></el-descriptions><employee-salary-card-form
  ref="form"
  @success="getSalaryCard"
/></el-card></template>
<script>import { getEmployeeSalaryCard, deleteEmployeeSalaryCard } from '@/api/hrm/employee/salary-card'; import EmployeeSalaryCardForm from './EmployeeSalaryCardForm.vue'; export default { name: 'HrmEmployeeSalaryCardInfo', components: { EmployeeSalaryCardForm }, props: { employeeId: { type: Number, required: true }}, data() { return { loading: true, salaryCard: undefined } }, created() { this.getSalaryCard() }, methods: { async getSalaryCard() { this.loading = true; try { const response = await getEmployeeSalaryCard(this.employeeId); this.salaryCard = response.data } finally { this.loading = false } }, openForm() { this.$refs.form.open(this.employeeId) }, async handleDelete() { try { await this.$modal.confirm('确定删除当前员工的工资卡信息吗？'); await deleteEmployeeSalaryCard(this.employeeId); this.$modal.msgSuccess('工资卡删除成功'); await this.getSalaryCard() } catch (error) {} } }}</script>
<style scoped>.section-card { margin-bottom:16px; }.card-header { display:flex; align-items:center; justify-content:space-between; }</style>
