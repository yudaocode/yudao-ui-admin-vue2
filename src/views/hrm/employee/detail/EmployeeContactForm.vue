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
  label="联系人"
  prop="name"
><el-input
  v-model="formData.name"
  :maxlength="64"
  placeholder="请输入联系人"
/></el-form-item><el-form-item label="关系"><el-input
  v-model="formData.relation"
  :maxlength="64"
  placeholder="请输入关系"
/></el-form-item><el-form-item label="电话"><el-input
  v-model="formData.phone"
  :maxlength="40"
  placeholder="请输入电话"
/></el-form-item><el-form-item label="工作单位"><el-input
  v-model="formData.workUnit"
  :maxlength="128"
  placeholder="请输入工作单位"
/></el-form-item><el-form-item label="职务"><el-input
  v-model="formData.postName"
  :maxlength="128"
  placeholder="请输入职务"
/></el-form-item><el-form-item label="地址"><el-input
  v-model="formData.address"
  :maxlength="255"
  placeholder="请输入地址"
/></el-form-item><el-form-item label="排序"><el-input-number
  v-model="formData.sort"
  :min="0"
  class="full-width"
/></el-form-item></el-form><span slot="footer"><el-button
  type="primary"
  :loading="formLoading"
  @click="submitForm"
>保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span></el-dialog></template>
<script>import { createEmployeeContact, updateEmployeeContact } from '@/api/hrm/employee/contact'; export default { name: 'HrmEmployeeContactForm', data() { return { dialogVisible: false, formLoading: false, formData: {}, formRules: { name: [{ required: true, message: '联系人不能为空', trigger: 'blur' }] }} }, computed: { dialogTitle() { return this.formData.id ? '修改联系人' : '新增联系人' } }, methods: { open(employeeId, row) { this.dialogVisible = true; this.resetForm(); this.formData = Object.assign({}, this.formData, { employeeId }, row) }, async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { await (this.formData.id ? updateEmployeeContact : createEmployeeContact)(this.formData); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }, resetForm() { this.formData = { sort: 1, name: undefined, relation: undefined, phone: undefined, workUnit: undefined, postName: undefined, address: undefined }; this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) } }}</script>
<style scoped>.full-width { width:100%; }</style>
