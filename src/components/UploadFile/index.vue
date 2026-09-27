<template>
  <div class="upload-file">
    <el-upload
      v-if="!disabled"
      ref="uploadRef"
      :action="uploadUrl"
      :file-list="fileList"
      :auto-upload="autoUpload"
      :drag="drag"
      :http-request="httpRequest"
      :limit="limit"
      :multiple="limit > 1"
      :before-upload="beforeUpload"
      :on-success="handleFileSuccess"
      :on-error="uploadError"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      name="file"
    >
      <el-button
        type="primary"
        icon="el-icon-upload"
      >选取文件</el-button>
      <div
        v-if="isShowTip"
        slot="tip"
        class="el-upload__tip"
      >
        大小不超过 <b>{{ fileSize }}MB</b>，格式为 <b>{{ fileType.join('/') }}</b> 的文件
      </div>
      <div
        slot="file"
        slot-scope="row"
        class="upload-file-item"
      >
        <span>{{ row.file.name }}</span>
        <el-link
          :href="row.file.url"
          :underline="false"
          download
          target="_blank"
          type="primary"
        >下载</el-link>
        <el-button
          type="text"
          @click="handleRemove(row.file)"
        >删除</el-button>
      </div>
    </el-upload>
    <template v-else>
      <div
        v-for="file in fileList"
        :key="file.url"
        class="upload-file-item"
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
    </template>
  </div>
</template>

<script>
import { useUpload } from './src/useUpload'

export default {
  name: 'UploadFile',
  props: {
    value: { type: [String, Array], default: '' },
    fileType: { type: Array, default: () => ['doc', 'xls', 'ppt', 'txt', 'pdf'] },
    fileSize: { type: Number, default: 5 },
    limit: { type: Number, default: 5 },
    autoUpload: { type: Boolean, default: true },
    drag: { type: Boolean, default: false },
    isShowTip: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    directory: { type: String, default: undefined }
  },
  data() {
    return { ...useUpload(this.directory), fileList: [], uploadList: [], uploadNumber: 0 }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        const urls = !value ? [] : typeof value === 'string' ? value.split(',') : value
        this.fileList = urls.map(url => ({ name: url.substring(url.lastIndexOf('/') + 1), url }))
      }
    }
  },
  methods: {
    beforeUpload(file) {
      if (this.fileList.length + this.uploadNumber >= this.limit) {
        this.handleExceed()
        return false
      }
      const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.') + 1) : ''
      if (!this.fileType.some(type => file.type.includes(type) || (extension && extension.includes(type)))) {
        this.$message.error(`文件格式不正确, 请上传${this.fileType.join('/')}格式!`)
        return false
      }
      if (file.size >= this.fileSize * 1024 * 1024) {
        this.$message.error(`上传文件大小不能超过${this.fileSize}MB!`)
        return false
      }
      this.uploadNumber += 1
      this.$message.success('正在上传文件，请稍候...')
      return true
    },
    handleFileSuccess(response, file) {
      // The shared transport returns exactly { code, data: url }.
      this.uploadList.push({ name: response.data, url: response.data })
      this.uploadNumber = Math.max(0, this.uploadNumber - 1)
      this.$message.success('上传成功')
      this.flushUploads(file.raw && file.raw.size)
    },
    uploadError() {
      this.uploadNumber = Math.max(0, this.uploadNumber - 1)
      this.$message.error('导入数据失败，请您重新上传！')
      this.flushUploads()
    },
    flushUploads(size) {
      if (this.uploadNumber || !this.uploadList.length) return
      this.fileList.push(...this.uploadList)
      this.uploadList = []
      this.emitValue()
      this.$emit('update:fileSize', size)
    },
    handleRemove(file) {
      const index = this.fileList.findIndex(item => item.url === file.url)
      if (index < 0) return
      this.fileList.splice(index, 1)
      this.emitValue()
      this.$emit('update:fileSize', undefined)
    },
    handleExceed() { this.$message.error(`上传文件数量不能超过${this.limit}个!`) },
    emitValue() {
      const urls = this.fileList.map(file => file.url)
      this.$emit('input', this.limit === 1 || typeof this.value === 'string' ? urls.join(',') : urls)
    }
  }
}
</script>

<style scoped>
.upload-file-item { display: flex; align-items: center; gap: 10px; padding: 4px; }
.upload-file-item span { overflow: hidden; text-overflow: ellipsis; }
.el-upload__tip b { color: #f56c6c; }
</style>
