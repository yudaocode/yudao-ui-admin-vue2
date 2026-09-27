<template>
  <Dialog v-model="dialogVisible" title="上传文件">
    <el-upload
      ref="upload"
      :file-list="fileList"
      :action="uploadUrl"
      :http-request="httpRequest"
      :data="data"
      :auto-upload="false"
      :disabled="formLoading"
      :limit="1"
      accept=".jpg, .png, .gif"
      drag
      :on-change="handleFileChange"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip" style="color: red">提示：仅允许导入 jpg、png、gif 格式文件！</div>
    </el-upload>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" :disabled="formLoading" @click="submitFileForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { useUpload } from '@/components/UploadFile/src/useUpload'

export default {
  name: 'InfraFileForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      fileList: [],
      data: { path: '' },
      ...useUpload()
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
      this.resetForm()
    },
    resetForm() {
      this.formLoading = false
      this.fileList = []
      this.data = { path: '' }
      this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles())
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList
      this.data.path = file.name
    },
    handleProgress(event, file) {
      this.formLoading = true
      if (file && event && event.percent != null) file.percentage = event.percent
    },
    submitFileForm() {
      if (!this.fileList.length) {
        this.$message.error('请上传文件')
        return
      }
      this.formLoading = true
      this.$refs.upload.submit()
    },
    handleSuccess() {
      this.dialogVisible = false
      this.formLoading = false
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.fileList = []
      this.$modal.msgSuccess('上传成功')
      this.$emit('success')
    },
    handleError() {
      this.formLoading = false
      this.$message.error('上传失败，请您重新上传！')
    },
    handleExceed() {
      this.$message.error('最多只能上传一个文件！')
    },
    cancel() {
      this.dialogVisible = false
      if (!this.formLoading) this.resetForm()
    }
  }
}
</script>
