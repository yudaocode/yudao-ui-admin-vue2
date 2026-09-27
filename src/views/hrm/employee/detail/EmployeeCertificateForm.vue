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
><el-form-item
  label="证书名称"
  prop="name"
><el-input
  v-model="formData.name"
  :maxlength="255"
  placeholder="请输入证书名称"
/></el-form-item><el-form-item label="证书级别"><el-input
  v-model="formData.level"
  :maxlength="255"
  placeholder="请输入证书级别"
/></el-form-item><el-form-item label="证书编号"><el-input
  v-model="formData.no"
  :maxlength="255"
  placeholder="请输入证书编号"
/></el-form-item><el-form-item
  label="有效开始日期"
  prop="startTime"
><el-date-picker
  v-model="formData.startTime"
  class="full-width"
  type="date"
  value-format="timestamp"
  placeholder="请选择有效开始日期"
/></el-form-item><el-form-item
  label="有效结束日期"
  prop="endTime"
><el-date-picker
  v-model="formData.endTime"
  class="full-width"
  type="date"
  value-format="timestamp"
  placeholder="请选择有效结束日期"
/></el-form-item><el-form-item label="发证机构"><el-input
  v-model="formData.issuingAuthority"
  :maxlength="255"
  placeholder="请输入发证机构"
/></el-form-item><el-form-item label="发证日期"><el-date-picker
  v-model="formData.issuingTime"
  class="full-width"
  type="date"
  value-format="timestamp"
  placeholder="请选择发证日期"
/></el-form-item><el-form-item label="备注"><el-input
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
<script>import { createEmployeeCertificate, updateEmployeeCertificate } from '@/api/hrm/employee/certificate'; export default { name: 'HrmEmployeeCertificateForm', data() { const validate = (rule, value, callback) => { if (this.formData.startTime && this.formData.endTime && Number(this.formData.endTime) < Number(this.formData.startTime)) return callback(new Error('有效结束日期不能早于有效开始日期')); callback() }; return { dialogVisible: false, formLoading: false, formData: {}, formRules: { name: [{ required: true, message: '证书名称不能为空', trigger: 'blur' }], startTime: [{ validator: validate, trigger: 'change' }], endTime: [{ validator: validate, trigger: 'change' }] }} }, computed: { dialogTitle() { return this.formData.id ? '修改证书' : '新增证书' } }, methods: { open(employeeId, row) { this.dialogVisible = true; this.resetForm(); this.formData = Object.assign({}, this.formData, { employeeId }, row) }, async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await (this.formData.id ? updateEmployeeCertificate : createEmployeeCertificate)(this.formData); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }, resetForm() { this.formData = { sort: 1, name: undefined, no: undefined, level: undefined, issuingAuthority: undefined, issuingTime: undefined, startTime: undefined, endTime: undefined, remark: undefined }; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) } }}</script>
<style scoped>.full-width { width:100%; }</style>
