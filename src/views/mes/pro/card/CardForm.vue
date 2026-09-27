<!-- MES 生产流转卡表单 -->
<template>
  <div><el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="960px"
    append-to-body
  ><el-form
     ref="form"
     v-loading="formLoading"
     :model="formData"
     :rules="formRules"
     label-width="120px"
     :disabled="isDetail"
   ><el-row><el-col :span="12"><el-form-item
      label="流转卡编码"
      prop="code"
    ><el-input
      v-model="formData.code"
      placeholder="请输入流转卡编码"
      :disabled="isHeaderReadonly"
    ><el-button
      slot="append"
      @click="generateCode"
    >生成</el-button></el-input></el-form-item></el-col><el-col :span="12"><el-form-item
      label="生产工单"
      prop="workOrderId"
    ><pro-work-order-select
      v-model="formData.workOrderId"
      :status="MesProWorkOrderStatusEnum.CONFIRMED"
      :disabled="isHeaderReadonly"
    /></el-form-item></el-col></el-row>
     <el-row><el-col :span="8"><el-form-item
       label="产品"
       prop="itemId"
     ><md-item-select
       v-model="formData.itemId"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col><el-col :span="8"><el-form-item
       label="流转数量"
       prop="transferedQuantity"
     ><el-input-number
       v-model="formData.transferedQuantity"
       :min="0"
       :precision="2"
       class="full-width"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col><el-col :span="8"><el-form-item
       label="批次号"
       prop="batchCode"
     ><el-input
       v-model="formData.batchCode"
       placeholder="请输入批次号"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col></el-row><el-form-item
       label="备注"
       prop="remark"
     ><el-input
       v-model="formData.remark"
       type="textarea"
       placeholder="请输入备注"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-form>
    <template v-if="formData.id"><el-divider content-position="center">工序记录</el-divider><card-process-list
      :card-id="formData.id"
      :disabled="!isEditable"
    /></template>
    <span slot="footer"><el-button
      v-if="isEditable"
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >保 存</el-button><el-button
      v-if="isEditable && formData.status === MesProCardStatusEnum.PREPARE"
      type="warning"
      :disabled="formLoading"
      @click="handleSubmit"
    >提 交</el-button><el-button
      v-if="isFinish"
      type="success"
      :disabled="formLoading"
      @click="handleFinish"
    >完 成</el-button><el-button
      v-if="formType === 'detail' && formData.id"
      type="primary"
      plain
      @click="handleBarcode"
    >查看条码</el-button><el-button @click="dialogVisible = false">关 闭</el-button></span></el-dialog><barcode-detail ref="barcodeDetail" /></div>
</template>

<script>
import { ProCardApi } from '@/api/mes/pro/card'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import CardProcessList from './CardProcessList.vue'
import { MesProCardStatusEnum, MesProWorkOrderStatusEnum, MesAutoCodeRuleCode, BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'

const emptyForm = () => ({ id: undefined, code: undefined, workOrderId: undefined, batchCode: undefined, itemId: undefined, transferedQuantity: undefined, status: undefined, remark: undefined })

export default {
  name: 'CardForm', components: { MdItemSelect, ProWorkOrderSelect, CardProcessList, BarcodeDetail },
  data() { return { MesProCardStatusEnum, MesProWorkOrderStatusEnum, dialogVisible: false, formLoading: false, formType: 'create', formData: emptyForm(), originalFormData: '', formRules: { code: [{ required: true, message: '流转卡编码不能为空', trigger: 'blur' }], workOrderId: [{ required: true, message: '生产工单不能为空', trigger: 'change' }], itemId: [{ required: true, message: '产品不能为空', trigger: 'change' }], transferedQuantity: [{ required: true, message: '流转数量不能为空', trigger: 'blur' }] }} },
  computed: { isEditable() { return ['create', 'update'].includes(this.formType) }, isFinish() { return this.formType === 'finish' }, isDetail() { return ['detail', 'finish'].includes(this.formType) }, isHeaderReadonly() { return ['finish', 'detail'].includes(this.formType) }, dialogTitle() { return ({ create: '新增流转卡', update: '编辑流转卡', finish: '完成流转卡', detail: '流转卡详情' })[this.formType] || this.formType } },
  methods: {
    handleBarcode() { this.$refs.barcodeDetail.openByBusiness(this.formData.id, BarcodeBizTypeEnum.PROCARD, this.formData.code) },
    async generateCode() { this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.PRO_CARD_CODE)).data },
    async open(type, id) { this.dialogVisible = true; this.formType = type; this.resetForm(); if (id) { this.formLoading = true; try { const response = await ProCardApi.getCard(id); this.formData = response.data } finally { this.formLoading = false } } this.originalFormData = JSON.stringify(this.formData) },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { const response = await ProCardApi.createCard(this.formData); this.$modal.msgSuccess('新增成功'); this.formData.id = response.data; this.formData.status = MesProCardStatusEnum.PREPARE; this.formType = 'update' } else { await ProCardApi.updateCard(this.formData); this.$modal.msgSuccess('修改成功') } this.originalFormData = JSON.stringify(this.formData); this.$emit('success') } finally { this.formLoading = false } }) },
    handleSubmit() { this.$refs.form.validate(async valid => { if (!valid) return; try { await this.$modal.confirm('确认提交该流转卡？【提交后将不能修改】'); this.formLoading = true; if (JSON.stringify(this.formData) !== this.originalFormData) await ProCardApi.updateCard(this.formData); await ProCardApi.submitCard(this.formData.id); this.$modal.msgSuccess('提交成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* canceled */ } finally { this.formLoading = false } }) },
    async handleFinish() { try { await this.$modal.confirm('确认完成该流转卡？'); this.formLoading = true; await ProCardApi.finishCard(this.formData.id); this.$modal.msgSuccess('完成成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* canceled */ } finally { this.formLoading = false } },
    resetForm() { this.formData = emptyForm(); this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
