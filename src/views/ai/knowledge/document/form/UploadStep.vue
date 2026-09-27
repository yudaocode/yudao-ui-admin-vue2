<template>
  <el-form :model="modelData" label-width="0" class="upload-step">
    <el-form-item>
      <div class="upload-content">
        <div class="upload-drop-zone">
          <el-upload
            ref="upload"
            class="knowledge-upload"
            drag
            multiple
            :action="uploadUrl"
            :auto-upload="true"
            :before-upload="beforeUpload"
            :http-request="httpRequest"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            :show-file-list="false"
            :accept="acceptedFileTypes"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">
              拖拽文件至此，或者<em>选择文件</em>
            </div>
            <div slot="tip" class="el-upload__tip">
              已支持 {{ supportedFileTypes.join('、') }}，每个文件不超过 {{ maxFileSize }} MB。
            </div>
          </el-upload>
        </div>

        <div v-if="modelData.list && modelData.list.length" class="uploaded-files">
          <div v-for="(file, index) in modelData.list" :key="file.url || index" class="file-row">
            <div class="file-name">
              <i class="el-icon-document" />
              <span>{{ file.name }}</span>
            </div>
            <el-button
              type="text"
              class="remove-file"
              icon="el-icon-delete"
              aria-label="移除文件"
              @click="removeFile(index)"
            />
          </div>
        </div>
      </div>
    </el-form-item>
    <el-form-item>
      <div class="step-actions">
        <el-button type="primary" :disabled="!isAllUploaded" @click="handleNextStep">
          下一步
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { useUpload } from '@/components/UploadFile/src/useUpload'

const { uploadUrl, httpRequest } = useUpload()

function generateAcceptedFileTypes(supportedFileTypes) {
  const allowedExtensions = supportedFileTypes.map(ext => ext.toLowerCase())
  const mimeTypes = []

  if (allowedExtensions.includes('txt')) mimeTypes.push('text/plain')
  if (allowedExtensions.includes('pdf')) mimeTypes.push('application/pdf')
  if (allowedExtensions.includes('html') || allowedExtensions.includes('htm')) {
    mimeTypes.push('text/html')
  }
  if (allowedExtensions.includes('csv')) mimeTypes.push('text/csv')
  if (allowedExtensions.includes('xlsx') || allowedExtensions.includes('xls')) {
    mimeTypes.push('application/vnd.ms-excel')
    mimeTypes.push('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }
  if (allowedExtensions.includes('docx') || allowedExtensions.includes('doc')) {
    mimeTypes.push('application/msword')
    mimeTypes.push('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  }
  if (allowedExtensions.includes('pptx') || allowedExtensions.includes('ppt')) {
    mimeTypes.push('application/vnd.ms-powerpoint')
    mimeTypes.push('application/vnd.openxmlformats-officedocument.presentationml.presentation')
  }
  if (allowedExtensions.includes('xml')) mimeTypes.push('application/xml', 'text/xml')
  if (allowedExtensions.includes('md') || allowedExtensions.includes('markdown')) {
    mimeTypes.push('text/markdown')
  }
  if (allowedExtensions.includes('epub')) mimeTypes.push('application/epub+zip')
  if (allowedExtensions.includes('eml')) mimeTypes.push('message/rfc822')
  if (allowedExtensions.includes('msg')) mimeTypes.push('application/vnd.ms-outlook')

  const extensions = allowedExtensions.map(ext => '.' + ext)
  return mimeTypes.concat(extensions).join(',')
}

export default {
  name: 'AiKnowledgeDocumentUploadStep',
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      uploadUrl,
      httpRequest,
      fileList: [],
      uploadingCount: 0,
      supportedFileTypes: [
        'TXT',
        'MARKDOWN',
        'MDX',
        'PDF',
        'HTML',
        'XLSX',
        'XLS',
        'DOC',
        'DOCX',
        'CSV',
        'EML',
        'MSG',
        'PPTX',
        'XML',
        'EPUB',
        'PPT',
        'MD',
        'HTM'
      ],
      maxFileSize: 15
    }
  },
  computed: {
    modelData() {
      return this.value
    },
    acceptedFileTypes() {
      return generateAcceptedFileTypes(this.supportedFileTypes)
    },
    allowedExtensions() {
      return this.supportedFileTypes.map(type => type.toLowerCase())
    },
    isAllUploaded() {
      return Boolean(
        this.modelData.list &&
        this.modelData.list.length > 0 &&
        this.uploadingCount === 0
      )
    }
  },
  created() {
    this.ensureListExists()
  },
  methods: {
    ensureListExists() {
      if (!this.value.list) {
        this.$emit('input', Object.assign({}, this.value, { list: [] }))
      }
    },
    beforeUpload(file) {
      const fileName = String(file.name || '').toLowerCase()
      const dotIndex = fileName.lastIndexOf('.')
      const extension = dotIndex >= 0 ? fileName.substring(dotIndex + 1) : ''
      if (!this.allowedExtensions.includes(extension)) {
        this.$modal.msgError('不支持的文件类型！')
        return false
      }
      if (!(file.size / 1024 / 1024 < this.maxFileSize)) {
        this.$modal.msgError('文件大小不能超过 ' + this.maxFileSize + ' MB！')
        return false
      }
      this.uploadingCount += 1
      return true
    },
    handleUploadSuccess(response, file) {
      if (response && response.data) {
        this.ensureListExists()
        this.$emit('input', Object.assign({}, this.value, {
          list: this.value.list.concat({ name: file.name, url: response.data })
        }))
      } else {
        this.$modal.msgError('文件 ' + file.name + ' 上传失败')
      }
      this.uploadingCount = Math.max(0, this.uploadingCount - 1)
    },
    handleUploadError(error, file) {
      this.$modal.msgError('文件 ' + file.name + ' 上传失败: ' + error)
      this.uploadingCount = Math.max(0, this.uploadingCount - 1)
    },
    handleFileChange(file) {
      if (file.status === 'success' || file.status === 'fail') {
        this.uploadingCount = Math.max(0, this.uploadingCount - 1)
      }
    },
    handleFileRemove(file) {
      if (file.status === 'uploading') {
        this.uploadingCount = Math.max(0, this.uploadingCount - 1)
      }
    },
    removeFile(index) {
      const list = this.value.list.slice()
      list.splice(index, 1)
      this.$emit('input', Object.assign({}, this.value, { list }))
    },
    handleNextStep() {
      if (!this.modelData.list || !this.modelData.list.length) {
        this.$modal.msgWarning('请上传至少一个文件')
        return
      }
      if (this.uploadingCount > 0) {
        this.$modal.msgWarning('请等待所有文件上传完成')
        return
      }
      this.$emit('next')
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-step {
  margin-top: 20px;
}

.upload-content,
.knowledge-upload {
  width: 100%;
}

.upload-drop-zone {
  padding: 20px;
  text-align: center;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  transition: border-color 0.2s;

  &:hover {
    border-color: #409eff;
  }

  ::v-deep .el-upload,
  ::v-deep .el-upload-dragger {
    width: 100%;
  }

  ::v-deep .el-upload-dragger {
    border: 0;
  }
}

.uploaded-files {
  margin-top: 15px;
}

.file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  margin-bottom: 8px;
  padding: 4px 12px;
  border-left: 4px solid #409eff;
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  transition: background-color 0.2s;

  &:hover {
    background: #ecf5ff;
  }
}

.file-name {
  display: flex;
  align-items: center;
  min-width: 0;
  color: #303133;
  font-size: 13px;

  i {
    flex-shrink: 0;
    margin-right: 8px;
    color: #409eff;
  }

  span {
    overflow-wrap: anywhere;
  }
}

.remove-file {
  flex-shrink: 0;
  margin-left: 8px;
  color: #f56c6c;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
