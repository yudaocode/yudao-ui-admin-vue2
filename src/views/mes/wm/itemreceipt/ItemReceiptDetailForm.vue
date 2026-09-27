<!-- MES 采购入库上架明细表单 -->
<template><el-dialog
  :title="dialogTitle"
  :visible.sync="dialogVisible"
  width="600px"
  append-to-body
><el-form
  ref="form"
  v-loading="formLoading"
  :model="formData"
  :rules="formRules"
  label-width="110px"
><el-form-item
  label="物料"
  prop="itemId"
><md-item-select
  v-model="formData.itemId"
  disabled
/></el-form-item><el-form-item
  label="入库仓库"
  prop="warehouseId"
><wm-warehouse-select v-model="formData.warehouseId" /></el-form-item><el-form-item
  v-if="formData.warehouseId"
  label="库区"
  prop="locationId"
><wm-warehouse-location-select
  v-model="formData.locationId"
  :warehouse-id="formData.warehouseId"
/></el-form-item><el-form-item
  v-if="formData.locationId"
  label="库位"
  prop="areaId"
><wm-warehouse-area-select
  v-model="formData.areaId"
  :location-id="formData.locationId"
/></el-form-item><el-form-item
  label="数量"
  prop="quantity"
><el-input-number
  v-model="formData.quantity"
  :precision="2"
  :min="0"
  controls-position="right"
  class="full-width"
/></el-form-item></el-form><span slot="footer"><el-button
  type="primary"
  :disabled="formLoading"
  @click="submitForm"
>确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span></el-dialog></template>
<script>
import { WmItemReceiptDetailApi } from '@/api/mes/wm/itemreceipt/detail'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
export default {
  name: 'ItemReceiptDetailForm', components: { MdItemSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect }, props: { receiptId: { type: Number, required: true }},
  data() { return { dialogVisible: false, dialogTitle: '', formLoading: false, formType: '', formData: this.getDefaultForm(), formRules: { itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }], warehouseId: [{ required: true, message: '入库仓库不能为空', trigger: 'change' }], locationId: [{ required: true, message: '库区不能为空', trigger: 'change' }], areaId: [{ required: true, message: '库位不能为空', trigger: 'change' }], quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }] }} },
  methods: {
    getDefaultForm() { return { id: undefined, lineId: undefined, receiptId: undefined, itemId: undefined, quantity: undefined, warehouseId: undefined, locationId: undefined, areaId: undefined } },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) },
    async open(type, lineId, itemId, detailId) { this.dialogVisible = true; this.dialogTitle = type === 'create' ? '添加上架明细' : '编辑上架明细'; this.formType = type; this.resetFormData(); this.formData.lineId = lineId; if (detailId) { this.formLoading = true; try { this.formData = (await WmItemReceiptDetailApi.getItemReceiptDetail(detailId)).data } finally { this.formLoading = false } } else if (itemId) this.formData.itemId = itemId },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { const data = { ...this.formData, receiptId: this.receiptId }; if (this.formType === 'create') await WmItemReceiptDetailApi.createItemReceiptDetail(data); else await WmItemReceiptDetailApi.updateItemReceiptDetail(data); this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功'); this.dialogVisible = false; this.$emit('success', this.formData.lineId) } finally { this.formLoading = false } }) }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
