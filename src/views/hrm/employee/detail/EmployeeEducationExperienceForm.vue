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
  label="学历"
  prop="education"
><el-select
  v-model="formData.education"
  class="full-width"
  clearable
  placeholder="请选择学历"
><el-option
  v-for="item in getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_EDUCATION)"
  :key="item.value"
  :label="item.label"
  :value="item.value"
/></el-select></el-form-item><el-form-item
  label="毕业院校"
  prop="graduateSchool"
><el-input
  v-model="formData.graduateSchool"
  :maxlength="255"
  placeholder="请输入毕业院校"
/></el-form-item><el-form-item
  label="专业"
  prop="major"
><el-input
  v-model="formData.major"
  :maxlength="255"
  placeholder="请输入专业"
/></el-form-item><el-form-item
  label="入学日期"
  prop="admissionTime"
><el-date-picker
  v-model="formData.admissionTime"
  class="full-width"
  type="date"
  value-format="timestamp"
  placeholder="请选择入学日期"
/></el-form-item><el-form-item
  label="毕业日期"
  prop="graduationTime"
><el-date-picker
  v-model="formData.graduationTime"
  class="full-width"
  type="date"
  value-format="timestamp"
  placeholder="请选择毕业日期"
/></el-form-item><el-form-item label="教学方式"><el-select
  v-model="formData.teachingMethods"
  class="full-width"
  clearable
  placeholder="请选择教学方式"
><el-option
  v-for="item in HrmEmployeeTeachingMethodOptions"
  :key="item.value"
  :label="item.label"
  :value="item.value"
/></el-select></el-form-item><el-form-item
  label="第一学历"
  prop="firstDegree"
><el-switch v-model="formData.firstDegree" /></el-form-item><el-form-item label="排序"><el-input-number
  v-model="formData.sort"
  :min="0"
  class="full-width"
/></el-form-item></el-form><span slot="footer"><el-button
  type="primary"
  :loading="formLoading"
  @click="submitForm"
>保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span></el-dialog></template>
<script>import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'; import { createEmployeeEducationExperience, updateEmployeeEducationExperience } from '@/api/hrm/employee/education-experience'; import { HrmEmployeeTeachingMethodOptions } from '@/views/hrm/utils/constants'; export default { name: 'HrmEmployeeEducationExperienceForm', data() { const validate = (rule, value, callback) => { if (this.formData.admissionTime != null && this.formData.graduationTime != null && Number(this.formData.graduationTime) < Number(this.formData.admissionTime)) return callback(new Error('毕业日期不能早于入学日期')); callback() }; return { DICT_TYPE, HrmEmployeeTeachingMethodOptions, dialogVisible: false, formLoading: false, formData: {}, formRules: { education: [{ required: true, message: '学历不能为空', trigger: 'change' }], graduateSchool: [{ required: true, message: '毕业院校不能为空', trigger: 'blur' }], major: [{ required: true, message: '专业不能为空', trigger: 'blur' }], admissionTime: [{ validator: validate, trigger: 'change' }], graduationTime: [{ validator: validate, trigger: 'change' }], firstDegree: [{ required: true, message: '是否第一学历不能为空', trigger: 'change' }] }} }, computed: { dialogTitle() { return this.formData.id ? '修改教育经历' : '新增教育经历' } }, methods: { getIntDictOptions, open(employeeId, row) { this.dialogVisible = true; this.resetForm(); this.formData = Object.assign({}, this.formData, { employeeId }, row) }, async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await (this.formData.id ? updateEmployeeEducationExperience : createEmployeeEducationExperience)(this.formData); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }, resetForm() { this.formData = { sort: 1, firstDegree: false, education: undefined, graduateSchool: undefined, major: undefined, admissionTime: undefined, graduationTime: undefined, teachingMethods: undefined }; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) } }}</script>
<style scoped>.full-width { width:100%; }</style>
