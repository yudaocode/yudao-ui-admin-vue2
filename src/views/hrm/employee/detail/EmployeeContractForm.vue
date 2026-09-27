<template><el-dialog
  :title="dialogTitle"
  :visible.sync="dialogVisible"
  width="680px"
  append-to-body
><el-form
  ref="form"
  v-loading="formLoading"
  :model="formData"
  :rules="formRules"
  label-width="112px"
><el-form-item label="合同编号"><el-input
  v-model="formData.no"
  :maxlength="128"
  placeholder="请输入合同编号"
/></el-form-item><el-form-item
  label="合同类型"
  prop="type"
><el-select
  v-model="formData.type"
  class="full-width"
  clearable
  placeholder="请选择合同类型"
  @change="handleContractTypeChange"
><el-option
  v-for="item in HrmEmployeeContractTypeOptions"
  :key="item.value"
  :label="item.label"
  :value="item.value"
/></el-select></el-form-item><el-form-item
  label="开始日期"
  prop="startTime"
><el-date-picker
  v-model="formData.startTime"
  class="full-width"
  type="date"
  value-format="timestamp"
  placeholder="请选择开始日期"
/></el-form-item><el-form-item
  label="结束日期"
  prop="endTime"
><el-date-picker
  v-model="formData.endTime"
  class="full-width"
  type="date"
  value-format="timestamp"
  placeholder="请选择结束日期"
/></el-form-item><el-form-item
  v-if="formData.type !== HrmEmployeeContractType.NON_FIXED_TERM_LABOR_CONTRACT"
  label="期限（年）"
  prop="term"
><el-select
  v-model="formData.term"
  class="full-width"
  placeholder="请选择合同期限"
><el-option
  v-for="item in HrmEmployeeContractTermOptions"
  :key="item.value"
  :label="item.label"
  :value="item.value"
/></el-select></el-form-item><el-form-item
  label="状态"
  prop="status"
><el-select
  v-model="formData.status"
  class="full-width"
  clearable
  placeholder="请选择状态"
><el-option
  v-for="item in HrmEmployeeContractStatusOptions"
  :key="item.value"
  :label="item.label"
  :value="item.value"
/></el-select></el-form-item><el-form-item label="签约公司"><el-input
  v-model="formData.signCompany"
  :maxlength="255"
  placeholder="请输入签约公司"
/></el-form-item><el-form-item
  label="签订日期"
  prop="signTime"
><el-date-picker
  v-model="formData.signTime"
  class="full-width"
  type="date"
  value-format="timestamp"
  placeholder="请选择签订日期"
/></el-form-item><el-form-item label="到期提醒"><el-switch v-model="formData.expireRemind" /></el-form-item><el-form-item label="附件"><file-upload v-model="fileUrlsUploadValue" /></el-form-item><el-form-item label="备注"><el-input
  v-model="formData.remark"
  :maxlength="500"
  :rows="3"
  type="textarea"
  placeholder="请输入备注"
/></el-form-item><el-form-item label="排序"><el-input-number
  v-model="formData.sort"
  :min="0"
  class="full-width"
/></el-form-item></el-form><span slot="footer"><el-button
  type="primary"
  :loading="formLoading"
  @click="submitForm"
>保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span></el-dialog></template>
<script>import { createEmployeeContract, updateEmployeeContract } from '@/api/hrm/employee/contract'; import { HrmEmployeeContractStatus, HrmEmployeeContractStatusOptions, HrmEmployeeContractTermOptions, HrmEmployeeContractType, HrmEmployeeContractTypeOptions } from '@/views/hrm/utils/constants'; export default { name: 'HrmEmployeeContractForm', data() { const validateEnd = (rule, value, callback) => { if (this.formData.startTime != null && this.formData.endTime != null && Number(this.formData.endTime) < Number(this.formData.startTime)) return callback(new Error('合同结束日期不能早于开始日期')); callback() }; return { HrmEmployeeContractType, HrmEmployeeContractTypeOptions, HrmEmployeeContractTermOptions, HrmEmployeeContractStatusOptions, dialogVisible: false, formLoading: false, formData: { fileUrls: [] }, formRules: { type: [{ required: true, message: '合同类型不能为空', trigger: 'change' }], startTime: [{ required: true, message: '开始日期不能为空', trigger: 'change' }], endTime: [{ required: true, message: '结束日期不能为空', trigger: 'change' }, { validator: validateEnd, trigger: 'change' }], term: [{ required: true, message: '合同期限不能为空', trigger: 'change' }], status: [{ required: true, message: '合同状态不能为空', trigger: 'change' }], signTime: [{ required: true, message: '签订日期不能为空', trigger: 'change' }] }} }, computed: { dialogTitle() { return this.formData.id ? '修改合同' : '新增合同' }, fileUrlsUploadValue: { get() { return this.formData.fileUrls.join(',') }, set(value) { this.formData.fileUrls = value ? value.split(',').filter(Boolean) : [] } }}, methods: { open(employeeId, row) { this.dialogVisible = true; this.resetForm(); this.formData = Object.assign({}, this.formData, { employeeId }, row, { fileUrls: row && row.fileUrls ? [...row.fileUrls] : [] }) }, handleContractTypeChange(type) { if (type === HrmEmployeeContractType.NON_FIXED_TERM_LABOR_CONTRACT) { this.formData.term = undefined; this.$refs.form && this.$refs.form.clearValidate('term') } }, async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await (this.formData.id ? updateEmployeeContract : createEmployeeContract)(this.formData); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }, resetForm() { this.formData = { sort: 1, type: HrmEmployeeContractType.FIXED_TERM_LABOR_CONTRACT, term: 1, status: HrmEmployeeContractStatus.NOT_PERFORMED, expireRemind: false, fileUrls: [], no: undefined, startTime: undefined, endTime: undefined, signTime: undefined, signCompany: undefined, remark: undefined }; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) } }}</script>
<style scoped>.full-width { width:100%; }</style>
