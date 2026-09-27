<template>
  <el-dialog title="新建文档" :visible.sync="dialogVisible" width="520px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="文档名称" prop="title">
        <el-input v-model="formData.title" maxlength="255" placeholder="请输入文档名称" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as KnowledgeDocumentApi from '@/api/pms/kb/content/document'
import { PmsKnowledgeDocumentType, PmsKnowledgeRootId } from '@/views/pms/kb/utils/constants'

function getDefaultFormData() {
  return {
    libraryId: 0,
    folderId: PmsKnowledgeRootId,
    parentId: PmsKnowledgeRootId,
    title: '',
    type: PmsKnowledgeDocumentType.RICH_TEXT
  }
}

export default {
  name: 'PmsKnowledgeDocumentCreateForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: getDefaultFormData(),
      formRules: { title: [{ required: true, message: '请输入文档名称', trigger: 'blur' }] }
    }
  },
  methods: {
    open(libraryId, folderId = PmsKnowledgeRootId, parentId = PmsKnowledgeRootId) {
      this.dialogVisible = true
      this.formData = Object.assign(getDefaultFormData(), { libraryId, folderId, parentId })
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        KnowledgeDocumentApi.createKnowledgeDocument(this.formData).then(() => {
          this.$modal.msgSuccess('创建成功')
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
