<!-- MES 生产工单表单 -->
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
      label="工单编码"
      prop="code"
    ><el-input
      v-model="formData.code"
      placeholder="请输入工单编码"
      :disabled="isHeaderReadonly"
    ><el-button
      slot="append"
      :disabled="isHeaderReadonly"
      @click="generateCode"
    >生成</el-button></el-input></el-form-item></el-col><el-col :span="12"><el-form-item
      label="工单名称"
      prop="name"
    ><el-input
      v-model="formData.name"
      placeholder="请输入工单名称"
      :disabled="isHeaderReadonly"
    /></el-form-item></el-col></el-row>
     <el-row><el-col :span="8"><el-form-item
       label="工单来源"
       prop="orderSourceType"
     ><el-select
       v-model="formData.orderSourceType"
       placeholder="请选择工单来源"
       class="full-width"
       :disabled="isHeaderReadonly"
     ><el-option
       v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_WORK_ORDER_SOURCE_TYPE)"
       :key="dict.value"
       :label="dict.label"
       :value="dict.value"
     /></el-select></el-form-item></el-col><el-col
       v-if="formData.orderSourceType === MesProWorkOrderSourceTypeEnum.ORDER"
       :span="8"
     ><el-form-item
       label="来源单据编号"
       prop="orderSourceCode"
     ><el-input
       v-model="formData.orderSourceCode"
       placeholder="请输入来源单据编号"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col><el-col :span="8"><el-form-item
       label="工单类型"
       prop="type"
     ><el-select
       v-model="formData.type"
       placeholder="请选择工单类型"
       class="full-width"
       :disabled="isHeaderReadonly"
     ><el-option
       v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_WORK_ORDER_TYPE)"
       :key="dict.value"
       :label="dict.label"
       :value="dict.value"
     /></el-select></el-form-item></el-col></el-row>
     <el-row><el-col :span="8"><el-form-item
       label="产品"
       prop="productId"
     ><md-item-select
       v-model="formData.productId"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col><el-col :span="8"><el-form-item
       label="工单数量"
       prop="quantity"
     ><el-input-number
       v-model="formData.quantity"
       :min="1"
       :precision="2"
       class="full-width"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col><el-col
       v-if="formData.orderSourceType === MesProWorkOrderSourceTypeEnum.ORDER"
       :span="8"
     ><el-form-item
       label="客户"
       prop="clientId"
     ><md-client-select
       v-model="formData.clientId"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col></el-row>
     <el-row><el-col
       v-if="formData.type === MesProWorkOrderTypeEnum.OUTSOURCE || formData.type === MesProWorkOrderTypeEnum.PURCHASE"
       :span="8"
     ><el-form-item
       label="供应商"
       prop="vendorId"
     ><md-vendor-select
       v-model="formData.vendorId"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col><el-col :span="8"><el-form-item
       label="批次号"
       prop="batchCode"
     ><el-input
       v-model="formData.batchCode"
       placeholder="请输入批次号"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col><el-col :span="8"><el-form-item
       label="需求日期"
       prop="requestDate"
     ><el-date-picker
       v-model="formData.requestDate"
       type="date"
       placeholder="请选择需求日期"
       value-format="timestamp"
       class="full-width"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-col><el-col
       v-if="formType !== 'create'"
       :span="8"
     ><el-form-item
       label="工单状态"
       prop="status"
     ><dict-tag
       :type="DICT_TYPE.MES_PRO_WORK_ORDER_STATUS"
       :value="formData.status == null ? '' : formData.status"
     /></el-form-item></el-col></el-row><el-form-item
       label="备注"
       prop="remark"
     ><el-input
       v-model="formData.remark"
       type="textarea"
       placeholder="请输入备注"
       :disabled="isHeaderReadonly"
     /></el-form-item></el-form>
    <template v-if="formData.id"><el-tabs
      v-model="activeTab"
      class="work-tabs"
    ><el-tab-pane
      label="工单 BOM"
      name="bom"
    ><work-order-bom-list
      :work-order-id="formData.id"
      :work-order="formData"
      :form-type="formType"
      @generate-work-order="handleGenerateWorkOrder"
    /></el-tab-pane><el-tab-pane
      label="物料需求"
      name="item"
    ><work-order-item-list :work-order-id="formData.id" /></el-tab-pane></el-tabs></template>
    <span slot="footer"><el-button
      v-if="isEditable"
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >保 存</el-button><el-button
      v-if="isEditable && formData.status === MesProWorkOrderStatusEnum.PREPARE"
      type="warning"
      :disabled="formLoading"
      @click="handleConfirm"
    >确 认</el-button><el-button
      v-if="isConfirm"
      type="warning"
      :disabled="formLoading"
      @click="handleConfirm"
    >确 认</el-button><el-button
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
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProWorkOrderApi } from '@/api/mes/pro/workorder'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import WorkOrderBomList from './WorkOrderBomList.vue'
import WorkOrderItemList from './WorkOrderItemList.vue'
import { MesProWorkOrderSourceTypeEnum, MesProWorkOrderTypeEnum, MesProWorkOrderStatusEnum, MesAutoCodeRuleCode, BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'

const emptyForm = () => ({ id: undefined, parentId: undefined, code: undefined, name: undefined, type: undefined, orderSourceType: undefined, orderSourceCode: undefined, productId: undefined, quantity: undefined, clientId: undefined, vendorId: undefined, batchCode: undefined, requestDate: undefined, status: undefined, remark: undefined })

export default {
  name: 'WorkOrderForm', components: { MdItemSelect, MdClientSelect, MdVendorSelect, WorkOrderBomList, WorkOrderItemList, BarcodeDetail },
  data() { return { DICT_TYPE, MesProWorkOrderSourceTypeEnum, MesProWorkOrderTypeEnum, MesProWorkOrderStatusEnum, dialogVisible: false, formLoading: false, formType: 'create', activeTab: 'bom', formData: emptyForm(), originalFormData: '', formRules: { code: [{ required: true, message: '工单编码不能为空', trigger: 'blur' }], name: [{ required: true, message: '工单名称不能为空', trigger: 'blur' }], type: [{ required: true, message: '工单类型不能为空', trigger: 'change' }], orderSourceType: [{ required: true, message: '工单来源不能为空', trigger: 'change' }], productId: [{ required: true, message: '产品不能为空', trigger: 'change' }], quantity: [{ required: true, message: '工单数量不能为空', trigger: 'blur' }], requestDate: [{ required: true, message: '需求日期不能为空', trigger: 'change' }] }} },
  computed: { isEditable() { return ['create', 'update'].includes(this.formType) }, isConfirm() { return this.formType === 'confirm' }, isFinish() { return this.formType === 'finish' }, isDetail() { return ['detail', 'confirm', 'finish'].includes(this.formType) }, isHeaderReadonly() { return ['confirm', 'finish', 'detail'].includes(this.formType) }, dialogTitle() { if (['create', 'update'].includes(this.formType) && this.formData.parentId) return this.formType === 'create' ? '新增子工单' : '编辑子工单'; return ({ create: '新增工单', update: '编辑工单', confirm: '确认工单', finish: '完成工单', detail: '工单详情' })[this.formType] || this.formType } },
  watch: { 'formData.orderSourceType'(value) { if (value !== MesProWorkOrderSourceTypeEnum.ORDER) { this.formData.orderSourceCode = undefined; this.formData.clientId = undefined } }, 'formData.type'(value) { if (value !== MesProWorkOrderTypeEnum.OUTSOURCE && value !== MesProWorkOrderTypeEnum.PURCHASE) this.formData.vendorId = undefined } },
  methods: {
    getIntDictOptions, handleBarcode() { this.$refs.barcodeDetail.openByBusiness(this.formData.id, BarcodeBizTypeEnum.WORKORDER, this.formData.code, this.formData.name) }, async generateCode() { this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.PRO_WORK_ORDER_CODE)).data },
    async open(type, id, parentRow) { this.dialogVisible = true; this.formType = type; this.activeTab = 'bom'; this.resetForm(); if (id) { this.formLoading = true; try { const response = await ProWorkOrderApi.getWorkOrder(id); this.formData = response.data } finally { this.formLoading = false } } if (parentRow) Object.assign(this.formData, { parentId: parentRow.id, type: parentRow.type, orderSourceType: parentRow.orderSourceType, orderSourceCode: parentRow.orderSourceCode, clientId: parentRow.clientId, vendorId: parentRow.vendorId, requestDate: parentRow.requestDate }); this.originalFormData = JSON.stringify(this.formData) },
    handleGenerateWorkOrder(bomRow) { const current = { ...this.formData }; this.resetForm(); this.formType = 'create'; this.activeTab = 'bom'; Object.assign(this.formData, { parentId: current.id, type: current.type, orderSourceType: current.orderSourceType, orderSourceCode: current.orderSourceCode, clientId: current.clientId, vendorId: current.vendorId, requestDate: current.requestDate, productId: bomRow.itemId, quantity: bomRow.quantity, name: `${bomRow.itemName}【${bomRow.quantity}】${bomRow.unitMeasureName || ''}` }); this.$modal.msgInfo('已从 BOM 物料预填子工单，请补充工单编码等信息后保存') },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { const response = await ProWorkOrderApi.createWorkOrder(this.formData); this.$modal.msgSuccess('新增成功'); this.formData.id = response.data; this.formData.status = MesProWorkOrderStatusEnum.PREPARE; this.formType = 'update' } else { await ProWorkOrderApi.updateWorkOrder(this.formData); this.$modal.msgSuccess('修改成功') } this.originalFormData = JSON.stringify(this.formData); this.$emit('success') } finally { this.formLoading = false } }) },
    async handleConfirm() { if (this.isEditable) { const valid = await new Promise(resolve => this.$refs.form.validate(resolve)); if (!valid) return } try { await this.$modal.confirm('确认要完成工单编制吗？确认后将不能更改。'); this.formLoading = true; if (this.isEditable && JSON.stringify(this.formData) !== this.originalFormData) await ProWorkOrderApi.updateWorkOrder(this.formData); await ProWorkOrderApi.confirmWorkOrder(this.formData.id); this.$modal.msgSuccess('工单已确认'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* canceled */ } finally { this.formLoading = false } },
    async handleFinish() { try { await this.$modal.confirm('确认要完成该工单吗？'); this.formLoading = true; await ProWorkOrderApi.finishWorkOrder(this.formData.id); this.$modal.msgSuccess('工单已完成'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* canceled */ } finally { this.formLoading = false } },
    resetForm() { this.formData = emptyForm(); this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) }
  }
}
</script>

<style scoped>.full-width { width: 100%; }.work-tabs { margin-top: 15px; }</style>
