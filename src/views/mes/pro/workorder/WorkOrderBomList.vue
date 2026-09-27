<!-- MES 生产工单 BOM 列表 -->
<template>
  <div><div
         v-if="isEditable"
         class="toolbar"
       ><el-button
         type="primary"
         plain
         icon="el-icon-plus"
         @click="openForm('create')"
       >添加物料</el-button></div><el-table
      v-loading="loading"
      :data="bomList"
      stripe
      show-overflow-tooltip
    ><el-table-column
      label="BOM 物料编码"
      align="center"
      prop="itemCode"
      width="120"
    /><el-table-column
      label="BOM 物料名称"
      align="center"
      prop="itemName"
      min-width="150"
    /><el-table-column
      label="规格型号"
      align="center"
      prop="itemSpecification"
      width="120"
    /><el-table-column
      label="单位"
      align="center"
      prop="unitMeasureName"
      width="80"
    /><el-table-column
      label="物料/产品"
      align="center"
      prop="itemOrProduct"
      width="100"
    ><template #default="scope"><dict-tag
      :type="DICT_TYPE.MES_MD_ITEM_OR_PRODUCT"
      :value="scope.row.itemOrProduct"
    /></template></el-table-column><el-table-column
      label="预计使用量"
      align="center"
      prop="quantity"
      width="120"
    /><el-table-column
      label="备注"
      align="center"
      prop="remark"
      min-width="120"
    /><el-table-column
      v-if="isEditable || isConfirmed"
      label="操作"
      align="center"
      width="160"
      fixed="right"
    ><template #default="scope"><template v-if="isEditable"><el-button
      type="text"
      @click="openForm('update', scope.row)"
    >编辑</el-button><el-button
      type="text"
      class="danger-text"
      @click="handleDelete(scope.row.id)"
    >删除</el-button></template><el-button
      v-if="isConfirmed && workOrder.type === MesProWorkOrderTypeEnum.SELF && scope.row.itemOrProduct === 'PRODUCT'"
      type="text"
      class="success-text"
      @click="handleGenerateWorkOrder(scope.row)"
    >生成工单</el-button></template></el-table-column></el-table><pagination
      v-show="bomTotal > 0"
      :total="bomTotal"
      :page.sync="bomQueryParams.pageNo"
      :limit.sync="bomQueryParams.pageSize"
      @pagination="getBomList"
    />
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      append-to-body
    ><el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    ><el-form-item
      v-if="bomFormType === 'create'"
      label="物料"
      prop="itemId"
    ><md-product-bom-select
      v-model="formData.itemId"
      :item-id="workOrder.productId"
      @change="handleBomItemChange"
    /></el-form-item><el-form-item
      v-else
      label="物料"
    ><el-input
      :value="formData.itemName"
      disabled
    /></el-form-item><el-form-item
      v-if="bomFormType === 'update'"
      label="单位"
    ><el-input
      :value="formData.unitMeasureName"
      disabled
    /></el-form-item><el-form-item
      label="预计使用量"
      prop="quantity"
    ><el-input-number
      v-model="formData.quantity"
      :min="0"
      :precision="2"
      class="full-width"
    /></el-form-item><el-form-item
      label="备注"
      prop="remark"
    ><el-input
      v-model="formData.remark"
      type="textarea"
      placeholder="请输入备注"
    /></el-form-item></el-form><span slot="footer"><el-button
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span></el-dialog>
  </div>
</template>

<script>
import { ProWorkOrderBomApi } from '@/api/mes/pro/workorder/bom'
import { MesProWorkOrderStatusEnum, MesProWorkOrderTypeEnum } from '@/views/mes/utils/constants'
import { DICT_TYPE } from '@/utils/dict'
import MdProductBomSelect from '@/views/mes/md/item/components/MdProductBomSelect.vue'

const emptyForm = () => ({ id: undefined, workOrderId: undefined, itemId: undefined, itemName: undefined, unitMeasureName: undefined, quantity: undefined, remark: undefined })

export default {
  name: 'WorkOrderBomList', components: { MdProductBomSelect }, props: { workOrderId: { type: Number, required: true }, workOrder: { type: Object, required: true }, formType: { type: String, required: true }},
  data() { return { DICT_TYPE, MesProWorkOrderTypeEnum, loading: false, bomList: [], bomTotal: 0, bomQueryParams: { pageNo: 1, pageSize: 10, workOrderId: this.workOrderId }, dialogVisible: false, formLoading: false, bomFormType: 'create', formData: emptyForm(), formRules: { itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }], quantity: [{ required: true, message: '预计使用量不能为空', trigger: 'blur' }] }} },
  computed: { isEditable() { return ['create', 'update'].includes(this.formType) && this.workOrder.status === MesProWorkOrderStatusEnum.PREPARE }, isConfirmed() { return this.workOrder.status === MesProWorkOrderStatusEnum.CONFIRMED }, dialogTitle() { return this.bomFormType === 'create' ? '添加 BOM 物料' : '编辑 BOM 物料' } }, created() { this.getBomList() },
  methods: {
    async getBomList() { this.loading = true; this.bomQueryParams.workOrderId = this.workOrderId; try { const response = await ProWorkOrderBomApi.getWorkOrderBomPage(this.bomQueryParams); this.bomList = response.data.list; this.bomTotal = response.data.total } finally { this.loading = false } },
    handleGenerateWorkOrder(row) { this.$emit('generate-work-order', row) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该工单 BOM？'); await ProWorkOrderBomApi.deleteWorkOrderBom(id); this.$modal.msgSuccess('删除成功'); await this.getBomList() } catch (error) { /* canceled */ } },
    resetForm() { this.formData = emptyForm(); this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) },
    handleBomItemChange(bom) { if (bom) this.formData.quantity = bom.quantity == null ? undefined : bom.quantity },
    openForm(type, row) { this.resetForm(); this.bomFormType = type; this.dialogVisible = true; this.formData = type === 'create' ? { ...emptyForm(), workOrderId: this.workOrderId } : { ...row } },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.bomFormType === 'create') { await ProWorkOrderBomApi.createWorkOrderBom(this.formData); this.$modal.msgSuccess('新增成功') } else { await ProWorkOrderBomApi.updateWorkOrderBom(this.formData); this.$modal.msgSuccess('修改成功') } this.dialogVisible = false; await this.getBomList() } finally { this.formLoading = false } }) }
  }
}
</script>

<style scoped>.toolbar { margin-bottom: 10px; }.full-width { width: 100%; }.danger-text { color: #f56c6c; }.success-text { color: #67c23a; }</style>
