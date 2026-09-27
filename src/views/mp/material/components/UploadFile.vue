<template>
  <el-upload
    :action="UPLOAD_URL"
    :headers="HEADERS"
    multiple
    :limit="1"
    :file-list="fileList"
    :data="uploadData"
    :on-error="onUploadError"
    :before-upload="onBeforeUpload"
    :on-success="onUploadSuccess"
  >
    <el-button
      type="primary"
      plain
    >点击上传</el-button>
    <span
      slot="tip"
      class="el-upload__tip"
    ><slot /></span>
  </el-upload>
</template>

<script>
import {
  HEADERS,
  UPLOAD_URL,
  UploadType,
  beforeImageUpload,
  beforeVoiceUpload
} from './upload'

export default {
  name: 'UploadFile',
  inject: {
    mpAccountContext: {
      default: () => ({ value: -1 })
    }
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: value => [UploadType.Image, UploadType.Voice].includes(value)
    }
  },
  data() {
    return {
      HEADERS,
      UPLOAD_URL,
      fileList: [],
      uploadData: {
        type: this.type,
        title: '',
        introduction: '',
        accountId: this.mpAccountContext.value
      }
    }
  },
  computed: {
    accountId() {
      return Number(this.mpAccountContext.value)
    }
  },
  watch: {
    accountId(value) {
      this.uploadData.accountId = value
    },
    type(value) {
      this.uploadData.type = value
    }
  },
  methods: {
    onBeforeUpload(file) {
      this.uploadData.accountId = this.accountId
      const notify = message => this.$message.error(message)
      return this.type === UploadType.Image
        ? beforeImageUpload(file, notify)
        : beforeVoiceUpload(file, notify)
    },
    onUploadSuccess(response) {
      if (response.code !== 0) {
        this.$modal.alertError('上传出错：' + response.msg)
        return false
      }
      this.fileList = []
      this.uploadData.title = ''
      this.uploadData.introduction = ''
      this.$modal.msgSuccess('上传成功')
      this.$emit('uploaded')
      return true
    },
    onUploadError(error) {
      this.$message.error('上传失败: ' + error.message)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-upload__tip {
  margin-left: 5px;
}
</style>
