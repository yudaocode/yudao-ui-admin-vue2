<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="680px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="产品名称"
          prop="name"
        ><el-input
          v-model="form.name"
          placeholder="请输入产品名称"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="负责人"
          prop="ownerUserId"
        ><el-select
          v-model="form.ownerUserId"
          :disabled="!!form.id"
          filterable
          placeholder="请选择负责人"
          style="width:100%"
        ><el-option
          v-for="user in userList"
          :key="user.id"
          :label="user.nickname"
          :value="user.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="产品编码"
          prop="no"
        ><el-input
          v-model="form.no"
          placeholder="请输入产品编码"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="产品类型"
          prop="categoryId"
        ><el-cascader
          v-model="form.categoryId"
          :options="categories"
          :props="categoryProps"
          filterable
          clearable
          placeholder="请选择产品类型"
          style="width:100%"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="价格"
          prop="price"
        ><el-input-number
          v-model="form.price"
          :min="0"
          :precision="2"
          :step="0.1"
          controls-position="right"
          style="width:100%"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="产品单位"
          prop="unit"
        ><el-select
          v-model="form.unit"
          placeholder="请选择单位"
          style="width:100%"
        ><el-option
          v-for="dict in unitDictDatas"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="上架状态"
          prop="status"
        ><el-select
          v-model="form.status"
          placeholder="请选择状态"
          style="width:100%"
        ><el-option
          v-for="dict in statusDictDatas"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="产品描述"
          prop="description"
        ><el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入产品描述"
        /></el-form-item></el-col>
      </el-row>
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
import { createProduct, getProduct, updateProduct } from '@/api/crm/product'
import { getProductCategoryList } from '@/api/crm/product/category'
import { getSimpleUserList } from '@/api/system/user'
import { getCurrentUserId } from '@/utils/auth'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'

export default {
  name: 'CrmProductForm',
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      dialogTitle: '',
      formType: 'create',
      categories: [],
      categoryProps: defaultProps,
      userList: [],
      form: this.emptyForm(),
      rules: {
        name: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
        no: [{ required: true, message: '产品编码不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        categoryId: [{ required: true, message: '产品分类ID不能为空', trigger: 'change' }],
        ownerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        price: [{ required: true, message: '价格不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    unitDictDatas() { return getIntDictOptions(DICT_TYPE.CRM_PRODUCT_UNIT) },
    statusDictDatas() { return getIntDictOptions(DICT_TYPE.CRM_PRODUCT_STATUS) }
  },
  methods: {
    emptyForm() {
      return {
        id: undefined,
        name: undefined,
        no: undefined,
        categoryId: undefined,
        unit: undefined,
        price: undefined,
        status: undefined,
        description: undefined,
        ownerUserId: -1
      }
    },
    open(type, id) {
      this.visible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '修改产品' : '添加产品'
      this.form = this.emptyForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      this.loading = true
      const requests = [getProductCategoryList({}), getSimpleUserList()]
      if (id) requests.push(getProduct(id))
      return Promise.all(requests).then(([categoryResponse, userResponse, productResponse]) => {
        this.categories = handleTree(categoryResponse.data, 'id', 'parentId')
        this.userList = userResponse.data
        if (id) this.form = productResponse.data
        else this.form.ownerUserId = getCurrentUserId()
      }).finally(() => { this.loading = false })
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.loading = true
        const action = this.formType === 'update' ? updateProduct : createProduct
        action(this.form).then(() => { this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false })
      })
    }
  }
}
</script>
