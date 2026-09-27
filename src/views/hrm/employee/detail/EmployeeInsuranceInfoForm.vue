<template><el-dialog
  title="编辑社保资料"
  :visible.sync="dialogVisible"
  width="720px"
  append-to-body
><el-form
  ref="form"
  v-loading="formLoading"
  :model="formData"
  :rules="formRules"
  label-width="126px"
><el-row :gutter="20"><el-col :span="12"><el-form-item
  label="社保方案"
  prop="schemeId"
><insurance-scheme-select
  v-model="formData.schemeId"
  :clearable="false"
  placeholder="请选择方案"
/></el-form-item></el-col><el-col :span="12"><el-form-item
  label="起缴月份"
  prop="socialSecurityStartMonth"
><el-date-picker
  v-model="formData.socialSecurityStartMonth"
  class="full-width"
  disabled
  type="month"
  value-format="timestamp"
/></el-form-item></el-col></el-row><el-row :gutter="20"><el-col :span="12"><el-form-item
  label="本地首次缴纳社保"
  prop="firstSocialSecurity"
><el-select
  v-model="formData.firstSocialSecurity"
  class="full-width"
><el-option
  v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
  :key="String(dict.value)"
  :label="dict.label"
  :value="dict.value"
/></el-select></el-form-item></el-col><el-col :span="12"><el-form-item
  label="本地首次缴纳公积金"
  prop="firstAccumulationFund"
><el-select
  v-model="formData.firstAccumulationFund"
  class="full-width"
><el-option
  v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
  :key="String(dict.value)"
  :label="dict.label"
  :value="dict.value"
/></el-select></el-form-item></el-col></el-row><el-row :gutter="20"><el-col :span="12"><el-form-item
  label="个人社保号"
  prop="socialSecurityNumber"
><el-input
  v-model="formData.socialSecurityNumber"
  placeholder="请输入个人社保号"
/></el-form-item></el-col><el-col :span="12"><el-form-item
  label="个人公积金号"
  prop="accumulationFundNumber"
><el-input
  v-model="formData.accumulationFundNumber"
  placeholder="请输入个人公积金号"
/></el-form-item></el-col></el-row></el-form><span slot="footer"><el-button
  :disabled="formLoading"
  type="primary"
  @click="submitForm"
>确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span></el-dialog></template>
<script>import { DICT_TYPE, getBoolDictOptions } from '@/utils/dict'; import { getInsuranceEmployeeInfo, saveInsuranceEmployeeInfo } from '@/api/hrm/insurance/employee-info'; import InsuranceSchemeSelect from '@/views/hrm/insurance/scheme/components/InsuranceSchemeSelect.vue'; export default { name: 'HrmEmployeeInsuranceInfoForm', components: { InsuranceSchemeSelect }, data() { return { DICT_TYPE, dialogVisible: false, formLoading: false, formData: this.createDefaultFormData(), formRules: { firstSocialSecurity: [{ required: true, message: '请选择是否本地首次缴纳社保', trigger: 'change' }], firstAccumulationFund: [{ required: true, message: '请选择是否本地首次缴纳公积金', trigger: 'change' }] }} }, methods: { getBoolDictOptions, createDefaultFormData() { return { id: undefined, employeeId: undefined, firstSocialSecurity: false, firstAccumulationFund: false, socialSecurityNumber: '', accumulationFundNumber: '', socialSecurityStartMonth: undefined, schemeId: undefined } }, async open(employeeId) { this.dialogVisible = true; this.resetForm(); this.formData.employeeId = employeeId; this.formLoading = true; try { const response = await getInsuranceEmployeeInfo(employeeId); this.formData = Object.assign(this.createDefaultFormData(), response.data || {}, { employeeId }) } finally { this.formLoading = false } }, async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await saveInsuranceEmployeeInfo(this.formData); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }, resetForm() { this.formData = this.createDefaultFormData(); this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) } }}</script>
<style scoped>.full-width { width:100%; }</style>
