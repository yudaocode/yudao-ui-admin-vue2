<!-- MES 采购入库单表单 -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="960px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      :disabled="isDetail"
    >
      <el-row>
        <el-col :span="8"><el-form-item
          label="入库单编号"
          prop="code"
        ><el-input
          v-model="formData.code"
          placeholder="请输入入库单编号"
          :disabled="isHeaderReadonly"
        ><el-button
          slot="append"
          :disabled="isHeaderReadonly"
          @click="generateCode"
        >生成</el-button></el-input></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="入库单名称"
          prop="name"
        ><el-input
          v-model="formData.name"
          placeholder="请输入入库单名称"
          :disabled="isHeaderReadonly"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="入库日期"
          prop="receiptDate"
        ><el-date-picker
          v-model="formData.receiptDate"
          type="date"
          value-format="timestamp"
          placeholder="请选择入库日期"
          class="full-width"
          :disabled="isHeaderReadonly"
        /></el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="8"><el-form-item
          label="到货通知单"
          prop="noticeId"
        ><wm-arrival-notice-select
          v-model="formData.noticeId"
          :status="MesWmArrivalNoticeStatusEnum.PENDING_RECEIPT"
          :disabled="isHeaderReadonly"
          @change="handleNoticeChange"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="供应商"
          prop="vendorId"
        ><md-vendor-select
          v-model="formData.vendorId"
          :disabled="isHeaderReadonly"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="采购订单号"
          prop="purchaseOrderCode"
        ><el-input
          v-model="formData.purchaseOrderCode"
          placeholder="请输入采购订单号"
          :disabled="isHeaderReadonly"
        /></el-form-item></el-col>
      </el-row>
      <el-row><el-col :span="24"><el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        type="textarea"
        placeholder="请输入备注"
        :disabled="isHeaderReadonly"
      /></el-form-item></el-col></el-row>
    </el-form>
    <template v-if="formData.id"><el-divider content-position="center">物料信息</el-divider><item-receipt-line-list
      :receipt-id="formData.id"
      :notice-id="formData.noticeId"
      :form-type="formType"
    /></template>
    <span slot="footer"><el-button
      v-if="isEditable"
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >保 存</el-button><el-button
      v-if="isEditable && formData.status === MesWmItemReceiptStatusEnum.PREPARE"
      type="warning"
      :disabled="formLoading"
      @click="handleSubmit"
    >提 交</el-button><el-button
      v-if="isStock"
      type="primary"
      :disabled="formLoading"
      @click="handleStock"
    >执行上架</el-button><el-button
      v-if="isFinish"
      type="success"
      :disabled="formLoading"
      @click="handleFinish"
    >执行入库</el-button><el-button @click="dialogVisible = false">关 闭</el-button></span>
  </el-dialog>
</template>
<script>
import { WmItemReceiptApi } from '@/api/mes/wm/itemreceipt'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import WmArrivalNoticeSelect from '@/views/mes/wm/arrivalnotice/components/WmArrivalNoticeSelect.vue'
import ItemReceiptLineList from './ItemReceiptLineList.vue'
import { MesAutoCodeRuleCode, MesWmArrivalNoticeStatusEnum, MesWmItemReceiptStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'ItemReceiptForm', components: { MdVendorSelect, WmArrivalNoticeSelect, ItemReceiptLineList },
  data() { return { MesWmArrivalNoticeStatusEnum, MesWmItemReceiptStatusEnum, dialogVisible: false, formLoading: false, formType: 'create', formData: this.getDefaultForm(), originalFormData: '', formRules: { code: [{ required: true, message: '入库单编号不能为空', trigger: 'blur' }], receiptDate: [{ required: true, message: '入库日期不能为空', trigger: 'change' }], vendorId: [{ required: true, message: '供应商不能为空', trigger: 'change' }] }} },
  computed: {
    isEditable() { return ['create', 'update'].includes(this.formType) }, isStock() { return this.formType === 'stock' }, isFinish() { return this.formType === 'finish' }, isDetail() { return ['detail', 'finish'].includes(this.formType) }, isHeaderReadonly() { return ['stock', 'detail', 'finish'].includes(this.formType) },
    dialogTitle() { return { create: '新增采购入库单', update: '编辑采购入库单', stock: '执行上架', finish: '执行入库', detail: '采购入库单详情' }[this.formType] || this.formType }
  },
  methods: {
    getDefaultForm() { return { id: undefined, code: undefined, name: undefined, status: undefined, vendorId: undefined, noticeId: undefined, iqcId: undefined, purchaseOrderCode: undefined, receiptDate: undefined, remark: undefined } },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) },
    async generateCode() { this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_ITEM_RECEIPT_CODE)).data },
    handleNoticeChange(notice) { if (notice) { this.formData.vendorId = notice.vendorId; this.formData.purchaseOrderCode = notice.purchaseOrderCode } },
    async open(type, id) { this.dialogVisible = true; this.formType = type; this.resetFormData(); if (id) { this.formLoading = true; try { this.formData = (await WmItemReceiptApi.getItemReceipt(id)).data } finally { this.formLoading = false } } this.originalFormData = JSON.stringify(this.formData) },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { this.formData.id = (await WmItemReceiptApi.createItemReceipt(this.formData)).data; this.formData.status = MesWmItemReceiptStatusEnum.PREPARE; this.formType = 'update'; this.$modal.msgSuccess('新增成功') } else { await WmItemReceiptApi.updateItemReceipt(this.formData); this.$modal.msgSuccess('修改成功') } this.originalFormData = JSON.stringify(this.formData); this.$emit('success') } finally { this.formLoading = false } }) },
    handleSubmit() { this.$refs.form.validate(async valid => { if (!valid) return; try { await this.$modal.confirm('确认提交该采购入库单？【提交后将不能修改】'); this.formLoading = true; if (JSON.stringify(this.formData) !== this.originalFormData) await WmItemReceiptApi.updateItemReceipt(this.formData); await WmItemReceiptApi.submitItemReceipt(this.formData.id); this.$modal.msgSuccess('提交成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* 用户取消或请求失败时保持弹窗 */ } finally { this.formLoading = false } }) },
    async handleStock() { try { await this.$modal.confirm('确认执行上架？'); this.formLoading = true; await WmItemReceiptApi.stockItemReceipt(this.formData.id); this.$modal.msgSuccess('上架成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* 用户取消或请求失败时保持弹窗 */ } finally { this.formLoading = false } },
    async handleFinish() { try { await this.$modal.confirm('确认执行入库？执行后将更新库存台账。'); this.formLoading = true; await WmItemReceiptApi.finishItemReceipt(this.formData.id); this.$modal.msgSuccess('入库成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* 用户取消或请求失败时保持弹窗 */ } finally { this.formLoading = false } }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
