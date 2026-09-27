<template>
  <div class="recruit-file-upload">
    <el-upload
      v-if="!disabled"
      ref="upload"
      :action="uploadUrl"
      :before-upload="beforeUpload"
      :disabled="disabled"
      :file-list="fileList"
      :http-request="httpRequest"
      :limit="limit"
      :multiple="limit > 1"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      name="file"
    >
      <el-button
        size="small"
        type="primary"
        icon="el-icon-upload"
      >选取文件</el-button>
      <div
        v-if="isShowTip"
        slot="tip"
        class="upload-tip"
      >
        大小不超过 <b>{{ fileSize }}MB</b>，格式为 <b>{{ fileType.join('/') }}</b>
      </div>
    </el-upload>
    <div v-else>
      <div
        v-for="file in fileList"
        :key="file.url"
        class="disabled-file"
      >
        <span>{{ file.name }}</span>
        <el-link
          :href="file.url"
          :underline="false"
          download
          target="_blank"
          type="primary"
        >下载</el-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useUpload } from '@/components/UploadFile/src/useUpload'

export default {
  name: 'HrmRecruitFileUpload',
  props: {
    value: { type: [String, Array], required: true },
    fileType: { type: Array, default: () => ['doc', 'xls', 'ppt', 'txt', 'pdf'] },
    fileSize: { type: Number, default: 5 },
    limit: { type: Number, default: 5 },
    isShowTip: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    directory: { type: String, default: undefined }
  },
  data() {
    const upload = useUpload(this.directory)
    return {
      uploadUrl: upload.uploadUrl,
      httpRequest: upload.httpRequest,
      fileList: [],
      uploadCount: 0,
      uploadedFiles: []
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        const urls = Array.isArray(value) ? value : value ? value.split(',') : []
        this.fileList = urls.filter(Boolean).map((url, index) => ({
          name: url.substring(url.lastIndexOf('/') + 1),
          url,
          uid: `saved-${index}-${url}`
        }))
      }
    }
  },
  methods: {
    beforeUpload(file) {
      if (this.fileList.length >= this.limit) {
        this.$modal.msgError(`上传文件数量不能超过${this.limit}个!`)
        return false
      }
      const extension = file.name.lastIndexOf('.') > -1
        ? file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
        : ''
      const validType = this.fileType.some(type => file.type.indexOf(type) > -1 || extension.indexOf(type) > -1)
      if (!validType) {
        this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join('/')}格式!`)
        return false
      }
      if (file.size >= this.fileSize * 1024 * 1024) {
        this.$modal.msgError(`上传文件大小不能超过${this.fileSize}MB!`)
        return false
      }
      this.uploadCount++
      return true
    },
    handleSuccess(response) {
      this.uploadedFiles.push({ name: response.data, url: response.data })
      if (this.uploadedFiles.length !== this.uploadCount) return
      this.fileList = this.fileList.filter(file => file.url).concat(this.uploadedFiles)
      this.uploadedFiles = []
      this.uploadCount = 0
      this.emitValue()
    },
    handleError() {
      this.uploadCount = Math.max(0, this.uploadCount - 1)
      this.$modal.msgError('导入数据失败，请您重新上传！')
    },
    handleExceed() { this.$modal.msgError(`上传文件数量不能超过${this.limit}个!`) },
    handleRemove(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid || item.url === file.url)
      if (index >= 0) this.fileList.splice(index, 1)
      this.emitValue()
    },
    emitValue() {
      const urls = this.fileList.map(file => file.url).filter(Boolean)
      this.$emit('input', Array.isArray(this.value) ? urls : urls.join(','))
    }
  }
}
</script>

<style scoped>
.upload-tip { color: #606266; font-size: 12px; }
.upload-tip b { color: #f56c6c; }
.disabled-file { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border: 1px dashed #dcdfe6; border-radius: 4px; }
</style>
