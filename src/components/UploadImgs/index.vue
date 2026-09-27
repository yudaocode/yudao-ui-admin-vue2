<template>
  <div class="upload-box" :style="uploadStyle">
    <el-upload
      ref="upload"
      :accept="fileType.join(',')"
      :action="uploadUrl"
      :before-upload="beforeUpload"
      :class="['upload', { 'no-border': drag, disabled }]"
      :disabled="disabled"
      :drag="drag"
      :file-list="fileList"
      :http-request="httpRequest"
      :limit="limit"
      :multiple="true"
      :on-error="uploadError"
      :on-exceed="handleExceed"
      :on-preview="imagePreview"
      :on-remove="handleRemove"
      :on-success="uploadSuccess"
      list-type="picture-card"
    >
      <i class="el-icon-plus" />
    </el-upload>

    <div class="el-upload__tip">
      <slot name="tip" />
    </div>

    <el-dialog
      :visible.sync="previewVisible"
      append-to-body
      title="预览"
      width="800px"
    >
      <img :src="previewUrl" alt="" class="preview-image" />
    </el-dialog>
  </div>
</template>

<script>
import { useUpload } from '@/components/UploadFile/src/useUpload'

export default {
  name: 'UploadImgs',
  props: {
    value: { type: [String, Array], default: () => [] },
    drag: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    limit: { type: Number, default: 5 },
    fileSize: { type: Number, default: 5 },
    fileType: {
      type: Array,
      default: () => ['image/jpeg', 'image/png', 'image/gif']
    },
    height: { type: String, default: '150px' },
    width: { type: String, default: '150px' },
    borderradius: { type: String, default: '8px' },
    directory: { type: String, default: undefined }
  },
  data() {
    const { uploadUrl, httpRequest } = useUpload(this.directory)
    return {
      fileList: [],
      uploadNumber: 0,
      uploadList: [],
      previewVisible: false,
      previewUrl: '',
      uploadUrl,
      uploadHttpRequest: httpRequest
    }
  },
  computed: {
    uploadStyle() {
      return {
        '--upload-width': this.width,
        '--upload-height': this.height,
        '--upload-border-radius': this.borderradius
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        const urls = Array.isArray(value) ? value : (value ? [value] : [])
        this.fileList = urls.map(url => ({
          name: url.substring(url.lastIndexOf('/') + 1),
          url
        }))
      }
    }
  },
  methods: {
    beforeUpload(file) {
      const validType = this.fileType.includes(file.type)
      const validSize = file.size / 1024 / 1024 < this.fileSize
      if (!validType) {
        this.$notify.warning({ title: '温馨提示', message: '上传图片不符合所需的格式！' })
      }
      if (!validSize) {
        this.$notify.warning({
          title: '温馨提示',
          message: `上传图片大小不能超过 ${this.fileSize}M！`
        })
      }
      if (validType && validSize) this.uploadNumber += 1
      return validType && validSize
    },
    httpRequest(options) {
      return this.uploadHttpRequest(options)
    },
    uploadSuccess(response, file) {
      this.$message.success('上传成功')
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) this.fileList.splice(index, 1)
      this.uploadList.push({ name: response.data, url: response.data })
      if (this.uploadList.length === this.uploadNumber) {
        this.fileList.push(...this.uploadList)
        this.uploadList = []
        this.uploadNumber = 0
        this.emitValue()
      }
    },
    handleRemove(file) {
      this.fileList = this.fileList.filter(item => item.uid !== file.uid && item.url !== file.url)
      this.emitValue()
    },
    imagePreview(file) {
      this.previewUrl = file.url
      this.previewVisible = true
    },
    uploadError() {
      this.$notify.error({ title: '温馨提示', message: '图片上传失败，请您重新上传！' })
      this.uploadNumber = Math.max(0, this.uploadNumber - 1)
    },
    handleExceed() {
      this.$notify.warning({
        title: '温馨提示',
        message: `当前最多只能上传 ${this.limit} 张图片，请移除后上传！`
      })
    },
    emitValue() {
      this.$emit('input', this.fileList.map(file => file.url))
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-box {
  ::v-deep .upload .el-upload-list__item,
  ::v-deep .upload .el-upload--picture-card,
  ::v-deep .upload .el-upload-dragger {
    width: var(--upload-width);
    height: var(--upload-height);
    border-radius: var(--upload-border-radius);
  }

  ::v-deep .upload.no-border .el-upload--picture-card {
    border: none;
  }

  ::v-deep .upload.disabled .el-upload--picture-card,
  ::v-deep .upload.disabled .el-upload-dragger {
    cursor: not-allowed;
    background: #f5f7fa;
    border-color: #dcdfe6;
  }
}

.preview-image {
  display: block;
  max-width: 100%;
  margin: 0 auto;
}
</style>
