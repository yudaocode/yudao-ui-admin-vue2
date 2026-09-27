<!-- MES 采购入库单行列表 -->
<template>
  <div>
    <el-button
      v-if="isUpdate"
      type="primary"
      plain
      icon="el-icon-plus"
      class="add-button"
      @click="openForm('create')"
    >添加物料</el-button>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      border
      row-key="id"
    >
      <el-table-column type="expand"><template #default="scope"><item-receipt-detail-list
        :key="'detail-' + scope.row.id + '-' + (detailRefreshKeys[scope.row.id] || 0)"
        :receipt-id="receiptId"
        :line-id="scope.row.id"
        :item-id="scope.row.itemId"
        :form-type="formType"
        @edit-detail="detailId => openDetailForm('update', scope.row.id, scope.row.itemId, detailId)"
      /></template></el-table-column>
      <el-table-column
        label="物料编码"
        align="center"
        prop="itemCode"
        min-width="120"
      /><el-table-column
        label="物料名称"
        align="center"
        prop="itemName"
        min-width="140"
      /><el-table-column
        label="规格型号"
        align="center"
        prop="specification"
        min-width="120"
      /><el-table-column
        label="单位"
        align="center"
        prop="unitMeasureName"
        width="80"
      /><el-table-column
        label="入库数量"
        align="center"
        prop="receivedQuantity"
        width="100"
      /><el-table-column
        label="批次号"
        align="center"
        prop="batchCode"
        min-width="120"
      />
      <el-table-column
        v-if="isUpdate || isStock"
        label="操作"
        align="center"
        width="200"
        fixed="right"
      ><template #default="scope"><el-button
        v-if="isUpdate"
        type="text"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-if="isUpdate"
        type="text"
        class="danger"
        @click="handleDelete(scope.row.id)"
      >删除</el-button><el-button
        v-if="isStock"
        type="text"
        class="success"
        @click="handleStock(scope.row.id)"
      >上架</el-button><printer-label
        v-if="isStock"
        :biz-id="scope.row.batchId"
        :biz-code="scope.row.batchCode"
        biz-type="ITEM_BATCH"
      /></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
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
      >
        <el-row><el-col
          v-if="hasNoticeId"
          :span="8"
        ><el-form-item
          label="到货通知单行"
          prop="arrivalNoticeLineId"
        ><wm-arrival-notice-line-select
          v-model="formData.arrivalNoticeLineId"
          :notice-id="noticeId"
          @change="handleNoticeLineChange"
        /></el-form-item></el-col><el-col :span="8"><el-form-item
          label="物料"
          prop="itemId"
        ><md-item-select
          v-model="formData.itemId"
          placeholder="请选择物料"
          :disabled="!!formData.arrivalNoticeLineId"
        /></el-form-item></el-col><el-col :span="8"><el-form-item
          label="入库数量"
          prop="receivedQuantity"
        ><el-input-number
          v-model="formData.receivedQuantity"
          :precision="2"
          :min="0"
          controls-position="right"
          class="full-width"
        /></el-form-item></el-col></el-row>
        <el-row><el-col :span="8"><el-form-item
          label="生产日期"
          prop="productionDate"
        ><el-date-picker
          v-model="formData.productionDate"
          type="date"
          value-format="timestamp"
          placeholder="请选择生产日期"
          class="full-width"
        /></el-form-item></el-col><el-col :span="8"><el-form-item
          label="有效期"
          prop="expireDate"
        ><el-date-picker
          v-model="formData.expireDate"
          type="date"
          value-format="timestamp"
          placeholder="请选择有效期"
          class="full-width"
        /></el-form-item></el-col><el-col :span="8"><el-form-item
          label="生产批号"
          prop="lotNumber"
        ><el-input
          v-model="formData.lotNumber"
          placeholder="请输入生产批号"
        /></el-form-item></el-col><el-col :span="8"><el-form-item
          label="批次号"
          prop="batchCode"
        ><el-input
          v-model="formData.batchCode"
          disabled
          placeholder="由填写信息自动生成"
        /></el-form-item></el-col></el-row>
        <el-row><el-col :span="24"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
        /></el-form-item></el-col></el-row>
      </el-form><span slot="footer"><el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
    </el-dialog>
    <item-receipt-detail-form
      ref="detailForm"
      :receipt-id="receiptId"
      @success="onDetailFormSuccess"
    />
  </div>
</template>
<script>
import { WmItemReceiptLineApi } from '@/api/mes/wm/itemreceipt/line'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmArrivalNoticeLineSelect from '@/views/mes/wm/arrivalnotice/components/WmArrivalNoticeLineSelect.vue'
import ItemReceiptDetailList from './ItemReceiptDetailList.vue'
import ItemReceiptDetailForm from './ItemReceiptDetailForm.vue'
import PrinterLabel from '@/views/mes/wm/barcode/components/PrinterLabel.vue'
export default {
  name: 'ItemReceiptLineList', components: { MdItemSelect, WmArrivalNoticeLineSelect, ItemReceiptDetailList, ItemReceiptDetailForm, PrinterLabel },
  props: { receiptId: { type: Number, required: true }, noticeId: Number, formType: { type: String, required: true }},
  data() { return { loading: false, list: [], total: 0, queryParams: { pageNo: 1, pageSize: 10, receiptId: undefined }, dialogVisible: false, dialogTitle: '', lineFormType: '', formLoading: false, formData: this.getDefaultForm(), detailRefreshKeys: {}, formRules: { arrivalNoticeLineId: [{ required: true, message: '到货通知单行不能为空', trigger: 'change' }], itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }], receivedQuantity: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }] }} },
  computed: { isUpdate() { return ['create', 'update'].includes(this.formType) }, isStock() { return this.formType === 'stock' }, hasNoticeId() { return !!this.noticeId } },
  watch: { receiptId: { immediate: true, handler(value) { if (value) this.getList() } }},
  methods: {
    getDefaultForm() { return { id: undefined, receiptId: undefined, arrivalNoticeLineId: undefined, itemId: undefined, receivedQuantity: undefined, batchId: undefined, batchCode: undefined, productionDate: undefined, expireDate: undefined, lotNumber: undefined, remark: undefined } },
    async getList() { this.loading = true; try { this.queryParams.receiptId = this.receiptId; const data = (await WmItemReceiptLineApi.getItemReceiptLinePage(this.queryParams)).data; this.list = data.list; this.total = data.total } finally { this.loading = false } },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该入库单行？'); await WmItemReceiptLineApi.deleteItemReceiptLine(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 用户取消时不做处理 */ } },
    handleNoticeLineChange(line) { if (line) { this.formData.itemId = line.itemId; this.formData.receivedQuantity = line.arrivalQuantity } },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) },
    async openForm(type, id) { this.dialogVisible = true; this.dialogTitle = type === 'create' ? '添加物料入库单行' : '修改物料入库单行'; this.lineFormType = type; this.resetFormData(); if (id) { this.formLoading = true; try { this.formData = (await WmItemReceiptLineApi.getItemReceiptLine(id)).data } finally { this.formLoading = false } } },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { const data = { ...this.formData, receiptId: this.receiptId }; if (this.lineFormType === 'create') await WmItemReceiptLineApi.createItemReceiptLine(data); else await WmItemReceiptLineApi.updateItemReceiptLine(data); this.$modal.msgSuccess(this.lineFormType === 'create' ? '新增成功' : '修改成功'); this.dialogVisible = false; await this.getList() } finally { this.formLoading = false } }) },
    handleStock(lineId) { const row = this.list.find(item => item.id === lineId); this.openDetailForm('create', lineId, row && row.itemId) },
    openDetailForm(type, lineId, itemId, detailId) { this.$refs.detailForm.open(type, lineId, itemId, detailId) },
    onDetailFormSuccess(lineId) { this.$set(this.detailRefreshKeys, lineId, (this.detailRefreshKeys[lineId] || 0) + 1) }
  }
}
</script>
<style scoped>.add-button { margin-bottom: 10px; }.full-width { width: 100%; }.danger { color: #f56c6c; }.success { color: #67c23a; }</style>
