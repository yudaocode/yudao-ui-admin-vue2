<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" append-to-body width="420px">
    <el-form ref="form" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" maxlength="255" placeholder="请输入分类名称" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsAuxiliaryTypeApi } from '@/api/fms/config/auxiliary/type'
import { readFmsAccountSetId } from '@/views/fms/utils/context'

export default {
  name: 'FmsAuxiliaryTypeForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    defaultForm(accountSetId) {
      return { id: undefined, accountSetId: Number(accountSetId) || 0, name: '' }
    },
    open(row, accountSetId) {
      const resolvedAccountSetId = Number(accountSetId || (row && row.accountSetId) || readFmsAccountSetId(this.$route))
      if (!resolvedAccountSetId) return
      this.dialogVisible = true
      this.dialogTitle = row ? '编辑类别' : '新增类别'
      this.formData = Object.assign(this.defaultForm(resolvedAccountSetId), row || {})
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formData.id
          ? FmsAuxiliaryTypeApi.updateAuxiliaryType(this.formData)
          : FmsAuxiliaryTypeApi.createAuxiliaryType(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formData.id ? '修改成功' : '新增成功')
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
