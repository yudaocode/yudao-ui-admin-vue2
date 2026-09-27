<template>
  <Dialog
    v-model="dialogVisible"
    title="编辑文档"
    default-fullscreen
    fullscreen
    append-to-body
    custom-class="knowledge-document-update-dialog"
  >
    <div slot="title" class="update-dialog-title">
      <span>编辑文档</span>
      <div class="update-actions">
        <el-button :loading="formLoading" type="primary" @click="submitForm">保存</el-button>
        <el-button @click="previewing = !previewing">
          {{ previewing ? '返回编辑' : '预览' }}
        </el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </div>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="0"
      class="update-form"
    >
      <el-form-item class="form-item" prop="title">
        <el-input v-model="formData.title" maxlength="255" placeholder="请输入文档标题" />
      </el-form-item>
      <el-form-item class="form-item" label="标签" label-width="48px">
        <knowledge-document-label-select v-model="formData.labelIds" />
      </el-form-item>
      <el-form-item
        v-if="formData.type === PmsKnowledgeDocumentType.RICH_TEXT"
        class="content-form-item"
        prop="content"
      >
        <div
          v-if="previewing"
          v-dompurify-html="formData.content || '<p>暂无内容</p>'"
          class="pms-knowledge-rich-text"
        ></div>
        <editor v-else v-model="formData.content" class="document-editor" :height="editorHeight" />
      </el-form-item>
      <el-form-item v-else class="content-form-item" prop="content">
        <UploadFile
          v-model="formData.content"
          :file-size="PmsKnowledgeUploadFileSize"
          :limit="1"
          @input="handleFileChange"
          @update:fileSize="handleFileSizeChange"
        />
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import * as KnowledgeDocumentApi from '@/api/pms/kb/content/document'
import Editor from '@/components/Editor'
import {
  PmsKnowledgeDocumentType,
  PmsKnowledgeUploadFileSize
} from '@/views/pms/kb/utils/constants'
import KnowledgeDocumentLabelSelect from './components/KnowledgeDocumentLabelSelect.vue'
import UploadFile from '@/components/UploadFile'
import Dialog from '@/components/Dialog'

function getDefaultFormData() {
  return {
    id: undefined,
    title: '',
    content: '',
    type: PmsKnowledgeDocumentType.RICH_TEXT,
    labelIds: [],
    fileType: undefined,
    fileSize: undefined
  }
}

export default {
  name: 'PmsKnowledgeDocumentUpdateForm',
  components: { Editor, KnowledgeDocumentLabelSelect, UploadFile, Dialog },
  data() {
    return {
      PmsKnowledgeDocumentType,
      PmsKnowledgeUploadFileSize,
      dialogVisible: false,
      formLoading: false,
      previewing: false,
      editorHeight: Math.max(420, window.innerHeight - 220),
      formData: getDefaultFormData(),
      formRules: {
        content: [{ required: true, message: '请输入文档内容', trigger: 'blur' }]
      }
    }
  },
  methods: {
    async open(id) {
      this.dialogVisible = true
      this.previewing = false
      this.formData = getDefaultFormData()
      this.formLoading = true
      try {
        const response = await KnowledgeDocumentApi.getKnowledgeDocument(id)
        const document = response.data
        this.formData = {
          id: document.id,
          title: document.title,
          content: document.content || document.previewUrl || '',
          type: document.type,
          labelIds: document.labelIds || [],
          fileType: document.fileType,
          fileSize: document.fileSize
        }
        this.$nextTick(() => {
          if (this.$refs.form) this.$refs.form.clearValidate()
        })
      } finally {
        this.formLoading = false
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        KnowledgeDocumentApi.updateKnowledgeDocument({
          id: this.formData.id,
          title: this.formData.title,
          content: this.formData.content,
          labelIds: this.formData.labelIds,
          fileType: this.formData.fileType,
          fileSize: this.formData.fileSize
        }).then(() => {
          this.$modal.msgSuccess('更新成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    handleFileSizeChange(value) {
      this.formData.fileSize = value
    },
    handleFileChange(value) {
      if (!value) return
      const fileName = decodeURIComponent(value.split('?')[0].split('/').pop() || '')
      this.formData.fileType = fileName.includes('.')
        ? fileName.split('.').pop().toLowerCase()
        : undefined
    }
  }
}
</script>

<style lang="scss" scoped>
.update-dialog-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 48px;
}

.update-actions {
  display: flex;
  gap: 12px;
}

.update-actions .el-button {
  margin: 0;
}

.update-form,
.document-editor,
.pms-knowledge-rich-text {
  width: 100%;
}

.form-item {
  margin-bottom: 16px;
}

.content-form-item {
  margin-bottom: 0;
}

.pms-knowledge-rich-text {
  min-height: 420px;
  overflow-wrap: anywhere;

  ::v-deep img {
    max-width: 100%;
    height: auto;
  }
}
</style>
