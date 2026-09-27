<!-- MES 工艺路线产品列表 -->
<template>
  <div>
    <el-row
      v-if="isEditable"
      class="toolbar"
    ><el-button
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >关联产品</el-button></el-row>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
    ><el-table-column
      label="产品物料编码"
      align="center"
      prop="itemCode"
      width="150"
    /><el-table-column
      label="产品物料名称"
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
      label="生产数量"
      align="center"
      prop="quantity"
      width="100"
    /><el-table-column
      label="生产用时"
      align="center"
      width="120"
    ><template #default="scope"><span v-if="scope.row.productionTime">{{ scope.row.productionTime }} <dict-tag
      :type="DICT_TYPE.MES_TIME_UNIT_TYPE"
      :value="scope.row.timeUnitType"
    /></span></template></el-table-column><el-table-column
      label="备注"
      align="center"
      prop="remark"
      min-width="120"
    /><el-table-column
      v-if="isEditable"
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
      width="960px"
      append-to-body
    ><el-form
       ref="form"
       :model="formData"
       :rules="formRules"
       label-width="100px"
     ><el-row :gutter="20"><el-col :span="12"><el-form-item
       label="产品"
       prop="itemId"
     ><md-item-select v-model="formData.itemId" /></el-form-item></el-col><el-col :span="12"><el-form-item
       label="生产数量"
       prop="quantity"
     ><el-input-number
       v-model="formData.quantity"
       :min="1"
       controls-position="right"
       class="full-width"
     /></el-form-item></el-col><el-col :span="12"><el-form-item
       label="生产用时"
       prop="productionTime"
     ><el-input-number
       v-model="formData.productionTime"
       :min="0"
       :precision="2"
       controls-position="right"
       class="full-width"
     /></el-form-item></el-col><el-col :span="12"><el-form-item
       label="时间单位"
       prop="timeUnitType"
     ><el-select
       v-model="formData.timeUnitType"
       placeholder="请选择"
       class="full-width"
     ><el-option
       v-for="dict in getStrDictOptions(DICT_TYPE.MES_TIME_UNIT_TYPE)"
       :key="dict.value"
       :label="dict.label"
       :value="dict.value"
     /></el-select></el-form-item></el-col></el-row><el-form-item
       label="备注"
       prop="remark"
     ><el-input
       v-model="formData.remark"
       type="textarea"
       placeholder="请输入备注"
     /></el-form-item></el-form>
      <template v-if="formType2 === 'update' && formData.id"><el-divider content-position="left">产品 BOM 配置</el-divider><route-product-bom-list
        :route-id="routeId"
        :product-id="formData.itemId"
        :product-name="formData.itemName"
      /></template>
      <span slot="footer"><el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确 定</el-button><el-button @click="formVisible = false">取 消</el-button></span></el-dialog>
  </div>
</template>

<script>
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProRouteProductApi } from '@/api/mes/pro/route/product'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import RouteProductBomList from './RouteProductBomList.vue'

export default {
  name: 'RouteProductList', components: { MdItemSelect, RouteProductBomList }, props: { routeId: { type: Number, required: true }, formType: { type: String, required: true }},
  data() { return { DICT_TYPE, loading: false, list: [], formVisible: false, formTitle: '', formLoading: false, formType2: '', formData: {}, formRules: { itemId: [{ required: true, message: '产品不能为空', trigger: 'change' }] }} },
  computed: { isEditable() { return ['create', 'update'].includes(this.formType) } }, watch: { routeId: { immediate: true, handler(value) { if (value) this.getList() } }},
  methods: {
    getStrDictOptions,
    async getList() { this.loading = true; try { const response = await ProRouteProductApi.getRouteProductListByRoute(this.routeId); this.list = response.data } finally { this.loading = false } },
    openForm(type, row) { this.formVisible = true; this.formTitle = type === 'create' ? '关联产品' : '编辑产品'; this.formType2 = type; this.formData = type === 'create' ? { routeId: this.routeId, itemId: undefined, quantity: 1, productionTime: 1, timeUnitType: 'MINUTE', remark: undefined } : { ...row }; this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType2 === 'create') { await ProRouteProductApi.createRouteProduct(this.formData); this.$modal.msgSuccess('新增成功') } else { await ProRouteProductApi.updateRouteProduct(this.formData); this.$modal.msgSuccess('修改成功') } this.formVisible = false; await this.getList() } finally { this.formLoading = false } }) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该关联产品？'); await ProRouteProductApi.deleteRouteProduct(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* canceled */ } }
  }
}
</script>

<style scoped>.toolbar { margin-bottom: 10px; }.full-width { width: 100%; }.danger-text { color: #f56c6c; }</style>
