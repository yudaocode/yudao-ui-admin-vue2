<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="700px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    ><el-row :gutter="16">
      <el-col
        v-for="item in fields"
        :key="item.prop"
        :span="item.span || 12"
      ><el-form-item
        :label="item.label"
        :prop="item.prop"
      ><el-input
        v-if="item.prop !== 'remark'"
        v-model="formData[item.prop]"
        :placeholder="'请输入' + item.label"
      /><el-input
        v-else
        v-model="formData.remark"
        type="textarea"
        placeholder="请输入备注"
      /></el-form-item></el-col>
      <el-col :span="12"><el-form-item
        label="开启状态"
        prop="status"
      ><el-radio-group v-model="formData.status"><el-radio
        v-for="item in statuses"
        :key="item.value"
        :label="Number(item.value)"
      >{{ item.label }}</el-radio></el-radio-group></el-form-item></el-col>
      <el-col :span="12"><el-form-item
        label="排序"
        prop="sort"
      ><el-input-number
        v-model="formData.sort"
        :min="0"
        :precision="0"
      /></el-form-item></el-col>
    </el-row></el-form>
    <div
      slot="footer"
      class="dialog-footer"
    ><el-button
      type="primary"
      :loading="loading"
      @click="submit"
    >确 定</el-button><el-button @click="cancel">取 消</el-button></div>
  </el-dialog>
</template>
<script>
import { createCustomer, getCustomer, updateCustomer } from '@/api/erp/sale/customer'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
export default {
  name: 'CustomerForm',
  data() { return { visible: false, title: '', loading: false, type: 'create', statuses: getDictDatas(DICT_TYPE.COMMON_STATUS), fields: [{ prop: 'name', label: '名称' }, { prop: 'contact', label: '联系人' }, { prop: 'mobile', label: '手机号码' }, { prop: 'telephone', label: '联系电话' }, { prop: 'email', label: '电子邮箱' }, { prop: 'fax', label: '传真' }, { prop: 'taxNo', label: '纳税人识别号' }, { prop: 'taxPercent', label: '税率(%)' }, { prop: 'bankName', label: '开户行' }, { prop: 'bankAccount', label: '开户账号' }, { prop: 'bankAddress', label: '开户地址' }, { prop: 'remark', label: '备注', span: 24 }], formData: this.defaults(), rules: { name: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }], status: [{ required: true, message: '状态不能为空', trigger: 'change' }], sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }] }} },
  methods: {
    defaults() { return { id: undefined, name: undefined, contact: undefined, mobile: undefined, telephone: undefined, email: undefined, fax: undefined, remark: undefined, status: CommonStatusEnum.ENABLE, sort: 0, taxNo: undefined, taxPercent: undefined, bankName: undefined, bankAccount: undefined, bankAddress: undefined } },
    open(type, id) { this.type = type; this.title = type === 'update' ? '修改客户' : '添加客户'; this.formData = this.defaults(); this.visible = true; if (id !== undefined && id !== null) { this.loading = true; return getCustomer(id).then(response => { this.formData = { ...this.defaults(), ...response.data } }).finally(() => { this.loading = false }) } },
    cancel() { this.visible = false; this.formData = this.defaults() },
    submit() { this.$refs.form.validate(valid => { if (!valid) return; this.loading = true; const call = this.type === 'create' ? createCustomer(this.formData) : updateCustomer(this.formData); call.then(() => { this.$modal.msgSuccess(this.type === 'create' ? '新增成功' : '修改成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false }) }) }
  }
}
</script>
<style scoped>.dialog-footer{text-align:right}</style>
