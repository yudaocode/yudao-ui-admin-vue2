<template>
  <Dialog title="上传文件" v-model="dialogVisible" width="560px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="文件" prop="content">
        <UploadFile
          v-model="formData.content"
          :file-size="PmsKnowledgeUploadFileSize"
          :file-type="allowedFileTypes"
          :is-show-tip="true"
          :limit="1"
          @input="handleFileChange"
          @update:fileSize="handleFileSizeChange"
        />
      </el-form-item>
      <el-form-item label="文件名称" prop="title">
        <el-input v-model="formData.title" maxlength="255" placeholder="上传后自动填充，可修改" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as KnowledgeDocumentApi from '@/api/pms/kb/content/document'
import {
  PmsKnowledgeDocumentType,
  PmsKnowledgeRootId,
  PmsKnowledgeUploadFileSize,
  PmsKnowledgeUploadFileTypes
} from '@/views/pms/kb/utils/constants'
import UploadFile from '@/components/UploadFile'
import Dialog from '@/components/Dialog'

function getDefaultFormData() {
  return {
    libraryId: 0,
    folderId: PmsKnowledgeRootId,
    parentId: PmsKnowledgeRootId,
    title: '',
    type: PmsKnowledgeDocumentType.FILE,
    content: '',
    fileType: undefined,
    fileSize: undefined
  }
}

export default {
  name: 'PmsKnowledgeFileUploadForm',
  components: { UploadFile, Dialog },
  data() {
    return {
      PmsKnowledgeUploadFileSize,
      allowedFileTypes: [...PmsKnowledgeUploadFileTypes],
      dialogVisible: false,
      formLoading: false,
      formData: getDefaultFormData(),
      formRules: {
        title: [{ required: true, message: '请输入文件名称', trigger: 'blur' }],
        content: [{ required: true, message: '请上传文件', trigger: 'change' }]
      }
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
    handleFileChange(value) {
      if (!value) return
      const fileName = decodeURIComponent(value.split('?')[0].split('/').pop() || '')
      this.formData.fileType = fileName.includes('.')
        ? fileName.split('.').pop().toLowerCase()
        : undefined
      if (!this.formData.title) {
        this.formData.title = fileName.replace(/\.[^.]+$/, '') || fileName
      }
      if (this.$refs.form) this.$refs.form.clearValidate(['content', 'title'])
    },
    handleFileSizeChange(value) {
      this.formData.fileSize = value
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        KnowledgeDocumentApi.createKnowledgeDocument(this.formData).then(() => {
          this.$modal.msgSuccess('上传成功')
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
