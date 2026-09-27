<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入标签名称" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button :disabled="formLoading" @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as MpTagApi from '@/api/mp/tag'

export default {
  name: 'MpTagForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        accountId: -1,
        name: ''
      }
    },

    /** 打开新增/修改弹窗。 */
    open(type, accountId, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改公众号标签' : '新增公众号标签'
      this.formData = Object.assign(this.defaultForm(), { accountId: accountId === undefined ? -1 : accountId })
      this.formLoading = false
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })

      if (id === undefined || id === null) return
      this.formLoading = true
      MpTagApi.getTag(id)
        .then(response => {
          this.formData = response.data
        })
        .finally(() => {
          this.formLoading = false
        })
    },

    /** 提交表单。 */
    submitForm() {
      if (!this.$refs.formRef) return
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const action = this.formType === 'update' ? MpTagApi.updateTag : MpTagApi.createTag
        action(this.formData)
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    },

    /** 取消并清理表单。 */
    cancel() {
      this.dialogVisible = false
      this.formData = this.defaultForm()
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })
    }
  }
}
</script>
