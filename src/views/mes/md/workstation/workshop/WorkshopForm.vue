<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="700px"
    append-to-body
  ><el-form
    ref="form"
    v-loading="formLoading"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    :disabled="isDetail"
  >
    <el-row><el-col :span="12"><el-form-item
      label="车间编码"
      prop="code"
    ><el-input
      v-model="formData.code"
      placeholder="请输入车间编码"
      :disabled="formType === 'update'"
    ><el-button
      v-if="formType === 'create'"
      slot="append"
      @click="generateCode"
    >生成</el-button></el-input></el-form-item></el-col><el-col :span="12"><el-form-item
      label="车间名称"
      prop="name"
    ><el-input
      v-model="formData.name"
      placeholder="请输入车间名称"
    /></el-form-item></el-col></el-row>
    <el-row><el-col :span="12"><el-form-item
      label="面积"
      prop="area"
    ><el-input-number
      v-model="formData.area"
      :precision="2"
      :min="0"
      controls-position="right"
      class="full-width"
    /></el-form-item></el-col><el-col :span="12"><el-form-item
      label="负责人"
      prop="chargeUserId"
    ><el-select
      v-model="formData.chargeUserId"
      placeholder="请选择负责人"
      clearable
      class="full-width"
    ><el-option
      v-for="user in userList"
      :key="user.id"
      :label="user.nickname"
      :value="user.id"
    /></el-select></el-form-item></el-col></el-row>
    <el-row><el-col :span="12"><el-form-item
      label="状态"
      prop="status"
    ><el-radio-group v-model="formData.status"><el-radio
      v-for="dict in statusOptions"
      :key="dict.value"
      :label="dict.value"
    >{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col></el-row><el-row><el-col :span="24"><el-form-item
      label="备注"
      prop="remark"
    ><el-input
      v-model="formData.remark"
      type="textarea"
      placeholder="请输入备注"
    /></el-form-item></el-col></el-row>
  </el-form><span slot="footer"><el-button
    v-if="isDetail && formData.id"
    type="primary"
    plain
    @click="handleBarcode"
  >查看条码</el-button><el-button
    v-if="!isDetail"
    type="primary"
    :disabled="formLoading"
    @click="submitForm"
  >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span><barcode-detail ref="barcodeDetail" /></el-dialog>
</template>
<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { MdWorkshopApi } from '@/api/mes/md/workstation/workshop'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { BarcodeBizTypeEnum, MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
import { getSimpleUserList } from '@/api/system/user'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
export default { name: 'WorkshopForm', components: { BarcodeDetail }, data() { return { dialogVisible: false, formLoading: false, formType: '', userList: [], statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS), formData: this.getDefaultForm(), formRules: { code: [{ required: true, message: '车间编码不能为空', trigger: 'blur' }], name: [{ required: true, message: '车间名称不能为空', trigger: 'blur' }], status: [{ required: true, message: '状态不能为空', trigger: 'blur' }] }} }, computed: { isDetail() { return this.formType === 'detail' }, dialogTitle() { return { create: '新增车间', update: '修改车间', detail: '查看车间' }[this.formType] || this.formType } }, methods: { getDefaultForm() { return { id: undefined, code: undefined, name: undefined, area: undefined, chargeUserId: undefined, status: CommonStatusEnum.ENABLE, remark: undefined } }, resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }, handleBarcode() { this.$refs.barcodeDetail.openByBusiness(this.formData.id, BarcodeBizTypeEnum.WORKSHOP, this.formData.code, this.formData.name) }, async generateCode() { this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.MD_WORKSHOP_CODE)).data }, async open(type, id) { this.dialogVisible = true; this.formType = type; this.resetFormData(); this.userList = (await getSimpleUserList()).data; if (id) { this.formLoading = true; try { this.formData = (await MdWorkshopApi.getWorkshop(id)).data } finally { this.formLoading = false } } }, submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { await MdWorkshopApi.createWorkshop(this.formData); this.$modal.msgSuccess('新增成功') } else { await MdWorkshopApi.updateWorkshop(this.formData); this.$modal.msgSuccess('修改成功') } this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }) } }}
</script>
<style scoped>.full-width { width: 100%; }</style>
