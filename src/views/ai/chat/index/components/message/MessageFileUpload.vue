<template>
  <div class="message-file-upload" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <el-button
      v-if="!disabled"
      circle
      size="mini"
      class="message-file-upload__button"
      :class="{ 'has-files': fileList.length > 0 }"
      :disabled="fileList.length >= limit"
      title="添加附件"
      @click="triggerFileInput"
    >
      <i class="el-icon-paperclip" />
      <span v-if="fileList.length" class="message-file-upload__count">{{ fileList.length }}</span>
    </el-button>
    <input
      ref="fileInput"
      type="file"
      multiple
      class="message-file-upload__input"
      :accept="acceptTypes"
      @change="handleFileSelect"
    >

    <transition name="el-zoom-in-bottom">
      <div
        v-if="fileList.length && tooltipVisible"
        class="message-file-upload__tooltip"
        @mouseenter="showTooltip"
        @mouseleave="hideTooltip"
      >
        <div v-for="(file, index) in fileList" :key="index" class="upload-file-item">
          <i :class="getFileIcon(file.name)" />
          <span class="upload-file-item__name" :title="file.name">{{ file.name }}</span>
          <span class="upload-file-item__size">{{ formatFileSize(file.size) }}</span>
          <el-progress
            v-if="file.uploading"
            :percentage="Math.round(file.progress || 0)"
            :show-text="false"
            :stroke-width="3"
            class="upload-file-item__progress"
          />
          <el-button
            v-else-if="!disabled"
            type="text"
            icon="el-icon-close"
            @click="removeFile(index)"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { useUpload } from '@/components/UploadFile/src/useUpload'

const { httpRequest } = useUpload()

export default {
  name: 'MessageFileUpload',
  model: { prop: 'value', event: 'input' },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 5
    },
    maxSize: {
      type: Number,
      default: 10
    },
    acceptTypes: {
      type: String,
      default: '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv,.md'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileList: [],
      uploadedUrls: [],
      tooltipVisible: false,
      hideTimer: null
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        this.uploadedUrls = value.slice()
        if (value.length === 0) this.fileList = []
      }
    }
  },
  beforeDestroy() {
    if (this.hideTimer) clearTimeout(this.hideTimer)
  },
  methods: {
    triggerFileInput() {
      if (this.$refs.fileInput) this.$refs.fileInput.click()
    },
    showTooltip() {
      if (this.hideTimer) clearTimeout(this.hideTimer)
      this.hideTimer = null
      this.tooltipVisible = true
    },
    hideTooltip() {
      this.hideTimer = setTimeout(() => {
        this.tooltipVisible = false
        this.hideTimer = null
      }, 300)
    },
    handleFileSelect(event) {
      const input = event.target
      const files = Array.from(input.files || [])
      if (!files.length) return
      if (files.length + this.fileList.length > this.limit) {
        this.$message.error('最多只能上传 ' + this.limit + ' 个文件')
        input.value = ''
        return
      }
      files.forEach(file => {
        if (file.size > this.maxSize * 1024 * 1024) {
          this.$message.error('文件 ' + file.name + ' 大小超过 ' + this.maxSize + 'MB')
          return
        }
        const fileItem = {
          name: file.name,
          size: file.size,
          raw: file,
          uploading: true,
          progress: 0
        }
        this.fileList.push(fileItem)
        this.uploadFile(fileItem)
      })
      input.value = ''
    },
    async uploadFile(fileItem) {
      try {
        const progressInterval = setInterval(() => {
          if (fileItem.progress < 90) {
            fileItem.progress = (fileItem.progress || 0) + Math.random() * 10
          }
        }, 100)
        const response = await httpRequest({
          file: fileItem.raw,
          filename: fileItem.name
        })
        fileItem.uploading = false
        fileItem.progress = 100
        fileItem.url = response.data
        this.uploadedUrls.push(fileItem.url)
        clearInterval(progressInterval)
        this.$emit('upload-success', fileItem)
        this.updateValue()
      } catch (error) {
        fileItem.uploading = false
        this.$message.error('文件 ' + fileItem.name + ' 上传失败')
        this.$emit('upload-error', error)
        const index = this.fileList.indexOf(fileItem)
        if (index > -1) this.removeFile(index)
      }
    },
    removeFile(index) {
      const removed = this.fileList[index]
      this.fileList.splice(index, 1)
      if (removed && removed.url) {
        const urlIndex = this.uploadedUrls.indexOf(removed.url)
        if (urlIndex >= 0) this.uploadedUrls.splice(urlIndex, 1)
      }
      this.updateValue()
    },
    updateValue() {
      this.$emit('input', this.uploadedUrls.slice())
    },
    clearFiles() {
      this.fileList = []
      this.uploadedUrls = []
      this.updateValue()
    },
    getFileIcon(filename) {
      const extension = String(filename).split('.').pop().toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'el-icon-picture-outline'
      if (['xls', 'xlsx', 'csv'].includes(extension)) return 'el-icon-s-grid'
      if (['mp3', 'wav', 'm4a', 'aac'].includes(extension)) return 'el-icon-headset'
      if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return 'el-icon-video-camera'
      return 'el-icon-document'
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style lang="scss" scoped>
.message-file-upload {
  position: relative;
  display: inline-block;
}

.message-file-upload__input { display: none; }

.message-file-upload__button {
  position: relative;
  border-color: transparent;

  &.has-files { color: #409eff; }
}

.message-file-upload__count {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  color: #fff;
  background: #f56c6c;
  font-size: 10px;
  line-height: 16px;
}

.message-file-upload__tooltip {
  position: absolute;
  z-index: 2000;
  bottom: calc(100% + 10px);
  left: 0;
  width: 320px;
  max-height: 220px;
  padding: 8px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
}

.upload-file-item {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 5px 7px;
  border-radius: 5px;
  background: #f5f7fa;
  color: #409eff;

  & + & { margin-top: 5px; }
}

.upload-file-item__name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #303133;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-file-item__size {
  flex: 0 0 auto;
  color: #909399;
  font-size: 11px;
}

.upload-file-item__progress { width: 54px; }
</style>
