<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item
        label="上级分类"
        prop="parentId"
      ><el-cascader
        v-model="formData.parentId"
        :options="itemTypeTree"
        :props="treeProps"
        placeholder="请选择上级分类"
        clearable
        class="full-width"
      /></el-form-item>
      <el-form-item
        label="分类编码"
        prop="code"
      ><el-input
        v-model="formData.code"
        placeholder="请输入分类编码"
      ><el-button
        slot="append"
        @click="handleGenerateCode"
      >自动生成</el-button></el-input></el-form-item>
      <el-form-item
        label="分类名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入分类名称"
      /></el-form-item>
      <el-form-item
        label="物料/产品标识"
        prop="itemOrProduct"
      ><el-radio-group v-model="formData.itemOrProduct"><el-radio
        v-for="dict in itemOrProductOptions"
        :key="dict.value"
        :label="dict.value"
      >{{ dict.label }}</el-radio></el-radio-group></el-form-item>
      <el-form-item
        label="显示排序"
        prop="sort"
      ><el-input-number
        v-model="formData.sort"
        :min="0"
        :precision="0"
        class="full-width"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-radio-group v-model="formData.status"><el-radio
        v-for="dict in statusOptions"
        :key="dict.value"
        :label="dict.value"
      >{{ dict.label }}</el-radio></el-radio-group></el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        type="textarea"
        placeholder="请输入备注"
      /></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { handleTree } from '@/utils/tree'
import { CommonStatusEnum } from '@/utils/constants'
import { MdItemTypeApi } from '@/api/mes/md/item/type'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode, MesItemOrProductEnum } from '@/views/mes/utils/constants'
export default {
  name: 'MdItemTypeForm',
  data() {
    return {
      dialogVisible: false, dialogTitle: '', formLoading: false, formType: '', itemTypeTree: [],
      treeProps: { value: 'id', label: 'name', children: 'children', emitPath: false, checkStrictly: true },
      itemOrProductOptions: getStrDictOptions(DICT_TYPE.MES_MD_ITEM_OR_PRODUCT), statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      formData: this.getDefaultForm(),
      formRules: { parentId: [{ required: true, message: '上级分类不能为空', trigger: 'blur' }], code: [{ required: true, message: '分类编码不能为空', trigger: 'blur' }], name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }], itemOrProduct: [{ required: true, message: '物料/产品标识不能为空', trigger: 'blur' }], sort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }], status: [{ required: true, message: '状态不能为空', trigger: 'blur' }] }
    }
  },
  methods: {
    getDefaultForm() { return { id: undefined, parentId: undefined, code: undefined, name: undefined, itemOrProduct: MesItemOrProductEnum.ITEM.value, sort: 0, status: CommonStatusEnum.ENABLE, remark: undefined } },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) },
    async open(type, id, parentId) { this.dialogVisible = true; this.dialogTitle = type === 'create' ? '新增物料产品分类' : '修改物料产品分类'; this.formType = type; this.resetFormData(); if (id) { this.formLoading = true; try { this.formData = (await MdItemTypeApi.getItemType(id)).data } finally { this.formLoading = false } } if (parentId) this.formData.parentId = parentId; await this.getItemTypeTree() },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { await MdItemTypeApi.createItemType(this.formData); this.$modal.msgSuccess('新增成功') } else { await MdItemTypeApi.updateItemType(this.formData); this.$modal.msgSuccess('修改成功') } this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }) },
    async getItemTypeTree() { const response = await MdItemTypeApi.getItemTypeList(); this.itemTypeTree = [{ id: 0, name: '顶级分类', children: handleTree(response.data) }] },
    async handleGenerateCode() { try { this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.MD_ITEM_TYPE_CODE)).data } catch (error) { console.error(error) } }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
