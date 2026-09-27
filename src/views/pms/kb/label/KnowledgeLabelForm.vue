<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="460px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="formData.name" maxlength="255" placeholder="请输入标签名称" />
      </el-form-item>
      <el-form-item label="标签颜色" prop="color">
        <el-color-picker v-model="formData.color" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as KnowledgeDocumentLabelApi from '@/api/pms/kb/content/document/label'

function getDefaultFormData() {
  return { id: undefined, name: '', color: '#409EFF', createTime: undefined }
}

export default {
  name: 'PmsKnowledgeLabelForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
        color: [{ required: true, message: '请选择标签颜色', trigger: 'change' }]
      }
    }
  },
  methods: {
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      this.resetForm()
      if (!id) return
      this.formLoading = true
      try {
        const response = await KnowledgeDocumentLabelApi.getKnowledgeDocumentLabel(id)
        this.formData = response.data
      } finally {
        this.formLoading = false
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? KnowledgeDocumentLabelApi.createKnowledgeDocumentLabel(this.formData)
          : KnowledgeDocumentLabelApi.updateKnowledgeDocumentLabel(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.$t(
            this.formType === 'create' ? 'common.createSuccess' : 'common.updateSuccess'
          ))
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
