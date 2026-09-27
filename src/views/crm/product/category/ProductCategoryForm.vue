<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="520px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="父级分类"
        prop="parentId"
      ><el-select
        v-model="form.parentId"
        placeholder="请选择上级分类"
        style="width:100%"
      ><el-option
        :value="0"
        label="顶级分类"
      /><el-option
        v-for="item in categories"
        :key="item.id"
        :value="item.id"
        :label="item.name"
      /></el-select></el-form-item>
      <el-form-item
        label="分类名称"
        prop="name"
      ><el-input
        v-model="form.name"
        placeholder="请输入分类名称"
      /></el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    ><el-button
      type="primary"
      :loading="loading"
      @click="submit"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></div>
  </el-dialog>
</template>
<script>
import { createProductCategory, getProductCategory, getProductCategoryList, updateProductCategory } from '@/api/crm/product/category'

export default {
  name: 'CrmProductCategoryForm',
  data() { return { visible: false, loading: false, dialogTitle: '', formType: 'create', categories: [], form: this.emptyForm(), rules: { parentId: [{ required: true, message: '父级分类不能为空', trigger: 'change' }], name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }] }} },
  methods: {
    emptyForm() { return { id: undefined, name: '', parentId: 0 } },
    open(type, id) {
      this.visible = true; this.formType = type; this.dialogTitle = type === 'update' ? '修改产品分类' : '添加产品分类'; this.form = this.emptyForm()
      const categoryRequest = getProductCategoryList({ parentId: 0 }).then((response) => { this.categories = response.data })
      if (id) { this.loading = true; return Promise.all([categoryRequest, getProductCategory(id).then((response) => { this.form = response.data })]).finally(() => { this.loading = false }) }
      return categoryRequest
    },
    submit() { this.$refs.form.validate((valid) => { if (!valid) return; this.loading = true; const action = this.formType === 'update' ? updateProductCategory : createProductCategory; action(this.form).then(() => { this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false }) }) }
  }
}
</script>
