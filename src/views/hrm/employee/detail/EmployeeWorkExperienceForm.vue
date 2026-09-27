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
  label="工作单位"
  prop="workUnit"
><el-input
  v-model="formData.workUnit"
  :maxlength="255"
  placeholder="请输入工作单位"
/></el-form-item><el-form-item
  label="职务"
  prop="postName"
><el-input
  v-model="formData.postName"
  :maxlength="255"
  placeholder="请输入职务"
/></el-form-item><el-form-item
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
/></el-form-item><el-form-item label="离职原因"><el-input
  v-model="formData.reason"
  :maxlength="1024"
  placeholder="请输入离职原因"
/></el-form-item><el-form-item label="证明人"><el-input
  v-model="formData.witnessName"
  :maxlength="255"
  placeholder="请输入证明人"
/></el-form-item><el-form-item
  label="证明人电话"
  prop="witnessPhone"
><el-input
  v-model="formData.witnessPhone"
  :maxlength="32"
  placeholder="请输入证明人电话"
/></el-form-item><el-form-item label="工作备注"><el-input
  v-model="formData.remark"
  :maxlength="500"
  :rows="3"
  type="textarea"
  placeholder="请输入工作备注"
/></el-form-item><el-form-item label="排序"><el-input-number
  v-model="formData.sort"
  :min="0"
  class="full-width"
/></el-form-item></el-form><span slot="footer"><el-button
  type="primary"
  :loading="formLoading"
  @click="submitForm"
>保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span></el-dialog></template>
<script>import { createEmployeeWorkExperience, updateEmployeeWorkExperience } from '@/api/hrm/employee/work-experience'; export default { name: 'HrmEmployeeWorkExperienceForm', data() { const validate = (rule, value, callback) => { if (this.formData.startTime != null && this.formData.endTime != null && Number(this.formData.endTime) < Number(this.formData.startTime)) return callback(new Error('结束日期不能早于开始日期')); callback() }; return { dialogVisible: false, formLoading: false, formData: {}, formRules: { workUnit: [{ required: true, message: '工作单位不能为空', trigger: 'blur' }], postName: [{ required: true, message: '职务不能为空', trigger: 'blur' }], startTime: [{ validator: validate, trigger: 'change' }], endTime: [{ validator: validate, trigger: 'change' }], witnessPhone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }] }} }, computed: { dialogTitle() { return this.formData.id ? '修改工作经历' : '新增工作经历' } }, methods: { open(employeeId, row) { this.dialogVisible = true; this.resetForm(); this.formData = Object.assign({}, this.formData, { employeeId }, row) }, async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await (this.formData.id ? updateEmployeeWorkExperience : createEmployeeWorkExperience)(this.formData); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }, resetForm() { this.formData = { sort: 1, workUnit: undefined, postName: undefined, startTime: undefined, endTime: undefined, reason: undefined, witnessName: undefined, witnessPhone: undefined, remark: undefined }; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) } }}</script>
<style scoped>.full-width { width:100%; }</style>
