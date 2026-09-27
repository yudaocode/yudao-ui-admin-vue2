<template>
  <el-dialog :title="title" :visible.sync="visible" width="820px" append-to-body>
    <el-form ref="form" v-loading="loading" :model="formData" :rules="rules" label-width="112px">
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item label="公司编码" prop="companyCode"><el-input v-model="formData.companyCode" maxlength="64" placeholder="请输入公司编码" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="公司名称" prop="companyName"><el-input v-model="formData.companyName" maxlength="255" placeholder="请输入公司名称" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="公司简介"><el-input v-model="formData.companyProfile" type="textarea" :rows="3" maxlength="500" show-word-limit /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="所在行业"><el-input v-model="formData.industry" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="所在地"><el-input v-model="formData.location" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="法人代表"><el-input v-model="formData.legalRepresentative" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="法人身份证号"><el-input v-model="formData.legalRepresentativeIdNumber" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="营业执照号"><el-input v-model="formData.businessLicenseNumber" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="组织机构代码"><el-input v-model="formData.organizationCode" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="备注"><el-input v-model="formData.remark" type="textarea" :rows="2" /></el-form-item></el-col>
      </el-row>
      <el-divider content-position="left">联系方式</el-divider>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item label="联系人"><el-input v-model="formData.contactName" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="办公电话"><el-input v-model="formData.officeTelephone" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="手机号码"><el-input v-model="formData.mobile" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="传真号码"><el-input v-model="formData.faxNumber" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="QQ 号码"><el-input v-model="formData.qqNumber" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="邮箱" prop="email"><el-input v-model="formData.email" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="其他"><el-input v-model="formData.otherContact" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="详细地址"><el-input v-model="formData.address" /></el-form-item></el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="loading" @click="submit">确 定</el-button><el-button @click="visible = false">取 消</el-button></div>
  </el-dialog>
</template>
<script>
import { createAccountSet, getAccountSet, updateAccountSet } from '@/api/fms/config/account-set'
export default {
  name: 'FmsAccountSetForm',
  data() {
    return {
      visible: false,
      title: '',
      loading: false,
      type: 'create',
      formData: this.defaults(),
      rules: {
        companyCode: [{ required: true, message: '公司编码不能为空', trigger: 'blur' }],
        companyName: [{ required: true, message: '公司名称不能为空', trigger: 'blur' }],
        email: [{ type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }]
      }
    }
  },
  methods: {
    defaults() { return { companyCode: '', companyName: '', companyProfile: '', industry: '', location: '', legalRepresentative: '', legalRepresentativeIdNumber: '', businessLicenseNumber: '', organizationCode: '', remark: '', contactName: '', officeTelephone: '', mobile: '', faxNumber: '', qqNumber: '', email: '', otherContact: '', address: '' } },
    open(type, id) { this.type = type; this.title = type === 'update' ? '修改账套' : '新增账套'; this.formData = this.defaults(); this.visible = true; if (id !== undefined && id !== null) { this.loading = true; return getAccountSet(id).then(response => { this.formData = { ...this.defaults(), ...response.data } }).finally(() => { this.loading = false }) } },
    submit() { this.$refs.form.validate(valid => { if (!valid) return; this.loading = true; const call = this.type === 'create' ? createAccountSet(this.formData) : updateAccountSet(this.formData); call.then(() => { this.$modal.msgSuccess(this.type === 'create' ? '新增成功' : '修改成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false }) }) }
  }
}
</script>
