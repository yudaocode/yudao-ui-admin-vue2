<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" append-to-body width="520px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" maxlength="255" placeholder="请输入分类名称" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button :loading="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsVoucherTemplateCategoryApi } from '@/api/fms/config/voucher-template-category'

export default {
  name: 'FmsVoucherTemplateCategoryForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.createDefaultForm(),
      formRules: {
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    createDefaultForm(accountSetId) {
      return { id: undefined, accountSetId: Number(accountSetId) || 0, name: '' }
    },
    open(type, accountSetId, row) {
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增凭证模板分类' : '修改凭证模板分类'
      this.formData = Object.assign(this.createDefaultForm(accountSetId), row || {}, {
        accountSetId: Number(accountSetId) || 0
      })
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const operation = this.formType === 'create'
          ? FmsVoucherTemplateCategoryApi.createVoucherTemplateCategory(this.formData)
          : FmsVoucherTemplateCategoryApi.updateVoucherTemplateCategory(this.formData)
        operation.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    }
  }
}
</script>
