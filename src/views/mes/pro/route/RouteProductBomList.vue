<!-- MES 工艺路线产品 BOM 列表 -->
<template>
  <div>
    <el-tabs
      v-model="activeProcessId"
      @tab-click="handleTabChange"
    ><el-tab-pane
      v-for="item in processList"
      :key="item.processId"
      :label="item.processName"
      :name="String(item.processId)"
    /></el-tabs>
    <el-row class="toolbar"><el-button
      type="primary"
      plain
      icon="el-icon-plus"
      :disabled="!activeProcessId"
      @click="openForm('create')"
    >添加 BOM 物料</el-button></el-row>
    <el-table
      v-loading="loading"
      :data="bomList"
      stripe
      show-overflow-tooltip
    ><el-table-column
      label="BOM 物料编码"
      align="center"
      prop="itemCode"
      width="150"
    /><el-table-column
      label="BOM 物料名称"
      align="center"
      prop="itemName"
      width="150"
    /><el-table-column
      label="规格型号"
      align="center"
      prop="specification"
      width="150"
    /><el-table-column
      label="单位"
      align="center"
      prop="unitName"
      width="80"
    /><el-table-column
      label="用料比例"
      align="center"
      prop="quantity"
      width="100"
    /><el-table-column
      label="备注"
      align="center"
      prop="remark"
      min-width="120"
    /><el-table-column
      label="操作"
      align="center"
      width="130"
      fixed="right"
    ><template #default="scope"><el-button
      type="text"
      @click="openForm('update', scope.row)"
    >编辑</el-button><el-button
      type="text"
      class="danger-text"
      @click="handleDelete(scope.row.id)"
    >删除</el-button></template></el-table-column></el-table>
    <el-dialog
      :title="formTitle"
      :visible.sync="formVisible"
      width="500px"
      append-to-body
    ><el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    ><el-form-item
      label="BOM 物料"
      prop="itemId"
    ><md-product-bom-select
      v-model="formData.itemId"
      :item-id="productId"
      placeholder="请选择 BOM 物料"
      @change="handleBomItemChange"
    /></el-form-item><el-form-item
      label="用料比例"
      prop="quantity"
    ><el-input-number
      v-model="formData.quantity"
      :min="0"
      :precision="2"
      controls-position="right"
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
    >确 定</el-button><el-button @click="formVisible = false">取 消</el-button></span></el-dialog>
  </div>
</template>

<script>
import { ProRouteProductBomApi } from '@/api/mes/pro/route/productbom'
import { ProRouteProcessApi } from '@/api/mes/pro/route/process'
import MdProductBomSelect from '@/views/mes/md/item/components/MdProductBomSelect.vue'

export default {
  name: 'RouteProductBomList', components: { MdProductBomSelect },
  props: { routeId: { type: Number, required: true }, productId: { type: Number, required: true }, productName: String },
  data() { return { loading: false, bomList: [], processList: [], activeProcessId: '', formVisible: false, formTitle: '', formLoading: false, formType: '', formData: {}, formRules: { itemId: [{ required: true, message: 'BOM 物料不能为空', trigger: 'change' }], quantity: [{ required: true, message: '用料比例不能为空', trigger: 'blur' }] }} },
  created() { this.loadProcessList() },
  methods: {
    async loadProcessList() { const response = await ProRouteProcessApi.getRouteProcessListByRoute(this.routeId); this.processList = response.data; if (this.processList.length) { this.activeProcessId = String(this.processList[0].processId); await this.getBomList() } },
    async getBomList() { if (!this.activeProcessId) return; this.loading = true; try { const response = await ProRouteProductBomApi.getRouteProductBomList({ routeId: this.routeId, processId: Number(this.activeProcessId), productId: this.productId }); this.bomList = response.data } finally { this.loading = false } },
    handleTabChange() { return this.getBomList() },
    openForm(type, row) { this.formVisible = true; this.formTitle = type === 'create' ? '添加 BOM 物料' : '编辑 BOM 物料'; this.formType = type; this.formData = type === 'create' ? { routeId: this.routeId, processId: Number(this.activeProcessId), productId: this.productId, quantity: 1 } : { ...row }; this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) },
    handleBomItemChange(bom) { if (bom) this.formData.quantity = bom.quantity == null ? 1 : bom.quantity },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { await ProRouteProductBomApi.createRouteProductBom(this.formData); this.$modal.msgSuccess('新增成功') } else { await ProRouteProductBomApi.updateRouteProductBom(this.formData); this.$modal.msgSuccess('修改成功') } this.formVisible = false; await this.getBomList() } finally { this.formLoading = false } }) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该产品 BOM？'); await ProRouteProductBomApi.deleteRouteProductBom(id); this.$modal.msgSuccess('删除成功'); await this.getBomList() } catch (error) { /* canceled */ } }
  }
}
</script>

<style scoped>.toolbar { margin-bottom: 10px; }.danger-text { color: #f56c6c; }</style>
