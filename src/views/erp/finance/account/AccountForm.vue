<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="520px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="90px"
    >
      <el-form-item
        label="名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入名称"
      /></el-form-item>
      <el-form-item
        label="编码"
        prop="no"
      ><el-input
        v-model="formData.no"
        placeholder="请输入编码"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-radio-group v-model="formData.status"><el-radio
        v-for="item in statuses"
        :key="item.value"
        :label="Number(item.value)"
      >{{ item.label }}</el-radio></el-radio-group></el-form-item>
      <el-form-item
        label="排序"
        prop="sort"
      ><el-input-number
        v-model="formData.sort"
        :min="0"
        :precision="0"
      /></el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        type="textarea"
        placeholder="请输入备注"
      /></el-form-item>
    </el-form>
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
import { createAccount, getAccount, updateAccount } from '@/api/erp/finance/account'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
export default {
  name: 'AccountForm',
  data() { return { visible: false, title: '', loading: false, type: 'create', statuses: getDictDatas(DICT_TYPE.COMMON_STATUS), formData: this.defaults(), rules: { name: [{ required: true, message: '名称不能为空', trigger: 'blur' }], status: [{ required: true, message: '状态不能为空', trigger: 'change' }], sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }] }} },
  methods: {
    defaults() { return { id: undefined, name: undefined, no: undefined, remark: undefined, status: CommonStatusEnum.ENABLE, sort: 0, defaultStatus: false } },
    open(type, id) { this.type = type; this.title = type === 'update' ? '修改结算账户' : '添加结算账户'; this.formData = this.defaults(); this.visible = true; if (id !== undefined && id !== null) { this.loading = true; return getAccount(id).then(response => { this.formData = { ...this.defaults(), ...response.data } }).finally(() => { this.loading = false }) } },
    cancel() { this.visible = false; this.formData = this.defaults() },
    submit() { this.$refs.form.validate(valid => { if (!valid) return; this.loading = true; const call = this.type === 'create' ? createAccount(this.formData) : updateAccount(this.formData); call.then(() => { this.$modal.msgSuccess(this.type === 'create' ? '新增成功' : '修改成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false }) }) }
  }
}
</script>
<style scoped>.dialog-footer{text-align:right}</style>
