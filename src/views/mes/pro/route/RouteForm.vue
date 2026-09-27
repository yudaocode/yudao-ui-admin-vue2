<!-- MES 工艺路线表单 -->
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
      label-width="100px"
      :disabled="isDetail"
    >
      <el-row :gutter="20"><el-col :span="12"><el-form-item
        label="编码"
        prop="code"
      ><el-input
        v-model="formData.code"
        placeholder="请输入编码"
        :disabled="isHeaderReadonly"
      ><el-button
        slot="append"
        @click="generateCode"
      >生成</el-button></el-input></el-form-item></el-col><el-col :span="12"><el-form-item
        label="名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入名称"
        :disabled="isHeaderReadonly"
      /></el-form-item></el-col></el-row>
      <el-form-item
        label="说明"
        prop="description"
      ><el-input
        v-model="formData.description"
        type="textarea"
        :rows="3"
        placeholder="请输入工艺路线说明"
        :disabled="isHeaderReadonly"
      /></el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        type="textarea"
        placeholder="请输入备注"
        :disabled="isHeaderReadonly"
      /></el-form-item>
      <template v-if="formData.id"><el-tabs v-model="activeTab"><el-tab-pane
        label="组成工序"
        name="process"
      ><route-process-list
        :route-id="formData.id"
        :form-type="formType"
      /></el-tab-pane><el-tab-pane
        label="关联产品"
        name="product"
      ><route-product-list
        :route-id="formData.id"
        :form-type="formType"
      /></el-tab-pane></el-tabs></template>
    </el-form>
    <span slot="footer"><el-button
      v-if="isEditable"
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >保 存</el-button><el-button
      v-if="isEnable"
      type="success"
      :disabled="formLoading"
      @click="handleEnable"
    >确认启用</el-button><el-button @click="dialogVisible = false">关 闭</el-button></span>
  </el-dialog>
</template>

<script>
import { CommonStatusEnum } from '@/utils/constants'
import { ProRouteApi } from '@/api/mes/pro/route'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
import RouteProcessList from './RouteProcessList.vue'
import RouteProductList from './RouteProductList.vue'

const emptyForm = () => ({ id: undefined, code: '', name: '', description: '', remark: '' })

export default {
  name: 'RouteForm', components: { RouteProcessList, RouteProductList },
  data() { return { dialogVisible: false, formLoading: false, formType: 'create', activeTab: 'process', formData: emptyForm(), formRules: { code: [{ required: true, message: '编码不能为空', trigger: 'blur' }], name: [{ required: true, message: '名称不能为空', trigger: 'blur' }] }} },
  computed: {
    isEditable() { return ['create', 'update'].includes(this.formType) }, isEnable() { return this.formType === 'enable' }, isDetail() { return ['detail', 'enable'].includes(this.formType) }, isHeaderReadonly() { return ['enable', 'detail'].includes(this.formType) },
    dialogTitle() { return ({ create: '新增工艺路线', update: '编辑工艺路线', enable: '启用工艺路线', detail: '工艺路线详情' })[this.formType] || this.formType }
  },
  methods: {
    async generateCode() { this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.PRO_ROUTE_CODE)).data },
    async open(type, id) { this.dialogVisible = true; this.formType = type; this.activeTab = 'process'; this.resetForm(); if (id) { this.formLoading = true; try { const response = await ProRouteApi.getRoute(id); this.formData = response.data } finally { this.formLoading = false } } },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { const response = await ProRouteApi.createRoute({ ...this.formData }); this.$modal.msgSuccess('新增成功'); this.formData.id = response.data; this.formType = 'update' } else { await ProRouteApi.updateRoute({ ...this.formData }); this.$modal.msgSuccess('修改成功') } this.$emit('success') } finally { this.formLoading = false } }) },
    async handleEnable() { try { await this.$modal.confirm('确认启用"' + this.formData.name + '"工艺路线吗？启用前请确认工序和产品 BOM 配置完整。'); this.formLoading = true; await ProRouteApi.updateRouteStatus(this.formData.id, CommonStatusEnum.ENABLE); this.$modal.msgSuccess('启用成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* canceled */ } finally { this.formLoading = false } },
    resetForm() { this.formData = emptyForm(); this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) }
  }
}
</script>
