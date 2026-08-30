<template>
  <el-dialog
    title="导入流程模型"
    :visible.sync="dialogVisible"
    :width="width"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-alert
      class="model-import-alert"
      title="导入说明"
      description="导入会完整保留流程配置，并将新模型归属到当前租户。请确认人员、部门、表单、子流程等关联在当前租户有效后再发布。"
      type="info"
      show-icon
    />
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="model-import-form"
    >
      <el-form-item label="流程模型文件">
        <el-upload
          ref="upload"
          :file-list="fileList"
          :auto-upload="false"
          :limit="1"
          accept=".json"
          action="#"
          drag
      :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :on-exceed="handleFileExceed"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将 JSON 流程模型文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-form-item>
      <el-form-item label="流程标识" prop="key">
        <el-input v-model="formData.key" placeholder="请输入流程标识" />
      </el-form-item>
      <el-form-item label="流程名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入流程名称" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button :disabled="formLoading" @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { importModel } from '@/api/bpm/model'

function createDefaultForm() {
  return {
    key: '',
    name: ''
  }
}

/** 可复用的 BPM JSON 模型导入表单。 */
export default {
  name: 'ModelImportForm',
  props: {
    width: {
      type: String,
      default: '640px'
    }
  },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      file: null,
      fileList: [],
      readToken: 0,
      formData: createDefaultForm(),
      rules: {
        key: [{ required: true, message: '请输入流程标识', trigger: 'blur' }],
        name: [{ required: true, message: '请输入流程名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open() {
      if (this.formLoading) {
        return
      }
      this.resetForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    handleFileChange(uploadFile, uploadFiles) {
      const raw = uploadFile && uploadFile.raw
      this.fileList = (uploadFiles || []).slice(-1)
      this.file = null
      const token = ++this.readToken
      if (!raw) {
        return
      }
      const fileName = uploadFile.name || raw.name || ''
      if (!/\.json$/i.test(fileName)) {
        this.resetFile()
        this.showError('仅支持上传 JSON 格式的流程模型文件')
        return
      }
      const reader = new FileReader()
      reader.onload = event => {
        if (token !== this.readToken) {
          return
        }
        try {
          const text = event && event.target && event.target.result
          const data = JSON.parse(text)
          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('invalid model')
          }
          this.file = raw
          this.formData.key = data.key || ''
          this.formData.name = data.name || ''
          this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        } catch (e) {
          this.resetFile()
          this.showError('JSON 文件格式不正确')
        }
      }
      reader.onerror = () => {
        if (token !== this.readToken) {
          return
        }
        this.resetFile()
        this.showError('JSON 文件读取失败')
      }
      reader.readAsText(raw)
    },
    // 保留 Vue3 表单使用的 handleChange 命名，便于旧页面/二次复用直接接入。
    handleChange(uploadFile, uploadFiles) {
      return this.handleFileChange(uploadFile, uploadFiles)
    },
    handleFileRemove() {
      this.resetFile(false)
    },
    handleFileExceed() {
      if (this.$message) {
        this.$message.warning('最多只能选择一个流程模型文件')
      }
    },
    async submitForm() {
      if (this.formLoading) {
        return
      }
      if (!this.file) {
        if (this.$message) {
          this.$message.warning('请上传流程模型文件')
        }
        return
      }
      const form = this.$refs.form
      if (!form) {
        return
      }
      const valid = await new Promise(resolve => form.validate(resolve))
      if (!valid) {
        return
      }
      this.formLoading = true
      try {
        await importModel(this.file, this.formData.key, this.formData.name)
        this.showSuccess('导入成功')
        this.dialogVisible = false
        this.$emit('success')
      } catch (e) {
        // request 拦截器已统一展示后端错误信息，保留表单便于重试。
      } finally {
        this.formLoading = false
      }
    },
    resetFile(clearUpload = true) {
      this.readToken += 1
      this.file = null
      this.fileList = []
      this.formData.key = ''
      this.formData.name = ''
      if (clearUpload) {
        const upload = this.$refs.upload
        if (upload && upload.clearFiles) {
          upload.clearFiles()
        }
        const uploadInner = upload && upload.$refs && upload.$refs['upload-inner']
        const input = uploadInner && uploadInner.$refs && uploadInner.$refs.input
        if (input) {
          input.value = ''
        }
      }
    },
    resetForm() {
      this.resetFile()
      this.formData = createDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    handleClosed() {
      this.formLoading = false
      this.resetForm()
    },
    showSuccess(message) {
      if (this.$modal && this.$modal.msgSuccess) {
        this.$modal.msgSuccess(message)
      } else if (this.$message) {
        this.$message.success(message)
      }
    },
    showError(message) {
      if (this.$message) {
        this.$message.error(message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.model-import-alert {
  margin-bottom: 15px;
}
</style>
