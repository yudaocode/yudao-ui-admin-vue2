<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" append-to-body width="620px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-form-item label="摘要内容" prop="content">
        <el-input
          v-model="formData.content"
          :rows="4"
          maxlength="500"
          placeholder="请输入摘要内容"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsDigestApi } from '@/api/fms/config/digest'

export default {
  name: 'FmsDigestForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: this.defaultForm(),
      formRules: {
        content: [{ required: true, message: '摘要内容不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    defaultForm(accountSetId) {
      return { id: undefined, accountSetId: Number(accountSetId) || 0, content: '' }
    },
    open(type, accountSetId, row) {
      const resolvedAccountSetId = Number(accountSetId) || 0
      if (!resolvedAccountSetId) return
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增常用摘要' : '修改常用摘要'
      this.formData = Object.assign(this.defaultForm(resolvedAccountSetId), row || {})
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? FmsDigestApi.createDigest(this.formData)
          : FmsDigestApi.updateDigest(this.formData)
        request.then(() => {
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
