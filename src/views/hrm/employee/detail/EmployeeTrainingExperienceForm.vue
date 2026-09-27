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
  label="培训课程"
  prop="course"
><el-input
  v-model="formData.course"
  :maxlength="128"
  placeholder="请输入培训课程"
/></el-form-item><el-form-item label="培训机构"><el-input
  v-model="formData.organizationName"
  :maxlength="128"
  placeholder="请输入培训机构"
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
/></el-form-item><el-form-item label="培训时长"><el-input
  v-model="formData.duration"
  :maxlength="64"
  placeholder="请输入培训时长"
/></el-form-item><el-form-item label="培训成绩"><el-input
  v-model="formData.result"
  :maxlength="64"
  placeholder="请输入培训成绩"
/></el-form-item><el-form-item label="证书名称"><el-input
  v-model="formData.certificateName"
  :maxlength="128"
  placeholder="请输入证书名称"
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
<script>import { createEmployeeTrainingExperience, updateEmployeeTrainingExperience } from '@/api/hrm/employee/training-experience'; export default { name: 'HrmEmployeeTrainingExperienceForm', data() { const validate = (rule, value, callback) => { if (this.formData.startTime != null && this.formData.endTime != null && Number(this.formData.endTime) < Number(this.formData.startTime)) return callback(new Error('结束日期不能早于开始日期')); callback() }; return { dialogVisible: false, formLoading: false, formData: {}, formRules: { course: [{ required: true, message: '培训课程不能为空', trigger: 'blur' }], startTime: [{ validator: validate, trigger: 'change' }], endTime: [{ validator: validate, trigger: 'change' }] }} }, computed: { dialogTitle() { return this.formData.id ? '修改培训经历' : '新增培训经历' } }, methods: { open(employeeId, row) { this.dialogVisible = true; this.resetForm(); this.formData = Object.assign({}, this.formData, { employeeId }, row) }, async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await (this.formData.id ? updateEmployeeTrainingExperience : createEmployeeTrainingExperience)(this.formData); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }, resetForm() { this.formData = { sort: 1, course: undefined, organizationName: undefined, startTime: undefined, endTime: undefined, duration: undefined, result: undefined, certificateName: undefined, remark: undefined }; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) } }}</script>
<style scoped>.full-width { width:100%; }</style>
