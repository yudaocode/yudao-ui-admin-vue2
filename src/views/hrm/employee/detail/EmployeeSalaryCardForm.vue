<template><el-dialog
  title="编辑工资卡"
  :visible.sync="dialogVisible"
  width="640px"
  append-to-body
><el-form
  ref="form"
  v-loading="formLoading"
  :model="formData"
  :rules="formRules"
  label-width="92px"
><el-row :gutter="20"><el-col :span="12"><el-form-item
  label="银行卡号"
  prop="bankCardNumber"
><el-input
  v-model="formData.bankCardNumber"
  placeholder="请输入银行卡号"
/></el-form-item></el-col><el-col :span="12"><el-form-item
  label="开户地区"
  prop="bankAreaId"
><area-select
  v-model="formData.bankAreaId"
  placeholder="请选择开户地区"
/></el-form-item></el-col></el-row><el-row :gutter="20"><el-col :span="12"><el-form-item
  label="银行名称"
  prop="bankName"
><el-input
  v-model="formData.bankName"
  placeholder="请输入银行名称"
/></el-form-item></el-col><el-col :span="12"><el-form-item
  label="开户支行"
  prop="bankBranchName"
><el-input
  v-model="formData.bankBranchName"
  placeholder="请输入开户支行"
/></el-form-item></el-col></el-row></el-form><span slot="footer"><el-button
  :disabled="formLoading"
  type="primary"
  @click="submitForm"
>确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span></el-dialog></template>
<script>import { getEmployeeSalaryCard, saveEmployeeSalaryCard } from '@/api/hrm/employee/salary-card'; import AreaSelect from '@/views/system/area/components/AreaSelect.vue'; export default { name: 'HrmEmployeeSalaryCardForm', components: { AreaSelect }, data() { return { dialogVisible: false, formLoading: false, formData: this.createDefaultFormData(), formRules: { bankCardNumber: [{ required: true, message: '银行卡号不能为空', trigger: 'blur' }] }} }, methods: { createDefaultFormData() { return { id: undefined, employeeId: undefined, bankCardNumber: '', bankAreaId: undefined, bankName: '', bankBranchName: '' } }, async open(employeeId) { this.dialogVisible = true; this.resetForm(); this.formData.employeeId = employeeId; this.formLoading = true; try { const response = await getEmployeeSalaryCard(employeeId); this.formData = Object.assign(this.createDefaultFormData(), response.data || {}, { employeeId }) } finally { this.formLoading = false } }, async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await saveEmployeeSalaryCard(this.formData); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }, resetForm() { this.formData = this.createDefaultFormData(); this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) } }}</script>
