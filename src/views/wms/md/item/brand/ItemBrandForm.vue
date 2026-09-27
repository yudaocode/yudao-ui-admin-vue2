<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="品牌编号"
        prop="code"
      >
        <el-input
          v-model="formData.code"
          maxlength="20"
          placeholder="请输入品牌编号"
        >
          <el-button
            slot="append"
            @click="formData.code = generateWmsCode('B')"
          >生成</el-button>
        </el-input>
      </el-form-item>
      <el-form-item
        label="品牌名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        maxlength="30"
        placeholder="请输入品牌名称"
      /></el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        type="primary"
        :loading="loading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ItemBrandApi } from '@/api/wms/md/item/brand'
import { generateWmsCode } from '@/views/wms/utils/constants'

export default {
  name: 'WmsItemBrandForm',
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      formData: this.getDefaultForm(),
      rules: {
        code: [
          { required: true, message: '品牌编号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '品牌名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    generateWmsCode,
    getDefaultForm() {
      return { id: undefined, code: undefined, name: undefined }
    },
    open(type, id) {
      this.visible = true
      this.formType = type || 'create'
      this.title = this.formType === 'update' ? '修改商品品牌' : '新增商品品牌'
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id === undefined || id === null) return
      this.loading = true
      ItemBrandApi.getItemBrand(id)
        .then((response) => {
          this.formData = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.loading = true
        const action =
          this.formType === 'create'
            ? ItemBrandApi.createItemBrand
            : ItemBrandApi.updateItemBrand
        action(this.formData)
          .then(() => {
            this.$modal.msgSuccess(
              this.formType === 'create' ? '新增成功' : '修改成功'
            )
            this.visible = false
            this.$emit('success')
          })
          .finally(() => {
            this.loading = false
          })
      })
    }
  }
}
</script>
