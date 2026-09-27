<template>
  <el-dialog
    title="新建视频"
    :visible.sync="showDialog"
    width="600px"
    append-to-body
  >
    <el-upload
      ref="uploadVideo"
      :action="UPLOAD_URL"
      :headers="HEADERS"
      multiple
      :limit="1"
      :file-list="fileList"
      :data="uploadData"
      :before-upload="onBeforeUpload"
      :on-error="onUploadError"
      :on-success="onUploadSuccess"
      :auto-upload="false"
      class="video-upload"
    >
      <el-button
        slot="trigger"
        type="primary"
        plain
      >选择视频</el-button>
      <span
        slot="tip"
        class="el-upload__tip"
      >格式支持 MP4，文件大小不超过 10MB</span>
    </el-upload>
    <el-divider />
    <el-form
      ref="uploadForm"
      :model="uploadData"
      :rules="uploadRules"
    >
      <el-form-item
        label="标题"
        prop="title"
      >
        <el-input
          v-model="uploadData.title"
          placeholder="标题将展示在相关播放页面，建议填写清晰、准确、生动的标题"
        />
      </el-form-item>
      <el-form-item
        label="描述"
        prop="introduction"
      >
        <el-input
          v-model="uploadData.introduction"
          :rows="3"
          type="textarea"
          placeholder="介绍语将展示在相关播放页面，建议填写简洁明确、有信息量的内容"
        />
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button
        type="primary"
        @click="submitVideo"
      >提 交</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { HEADERS, UPLOAD_URL, UploadType, beforeVideoUpload } from './upload'

export default {
  name: 'UploadVideo',
  inject: {
    mpAccountContext: {
      default: () => ({ value: -1 })
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      HEADERS,
      UPLOAD_URL,
      fileList: [],
      uploadData: {
        type: UploadType.Video,
        title: '',
        introduction: '',
        accountId: this.mpAccountContext.value
      },
      uploadRules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        introduction: [{ required: true, message: '请输入描述', trigger: 'blur' }]
      }
    }
  },
  computed: {
    showDialog: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    accountId() {
      return Number(this.mpAccountContext.value)
    }
  },
  watch: {
    accountId(value) {
      this.uploadData.accountId = value
    },
    value(open) {
      if (open) this.uploadData.accountId = this.accountId
    }
  },
  methods: {
    submitVideo() {
      this.$refs.uploadForm.validate(valid => {
        if (valid) this.$refs.uploadVideo.submit()
      })
    },
    onBeforeUpload(file) {
      this.uploadData.accountId = this.accountId
      return beforeVideoUpload(file, message => this.$message.error(message))
    },
    resetUpload() {
      this.fileList = []
      this.uploadData.title = ''
      this.uploadData.introduction = ''
      if (this.$refs.uploadVideo) this.$refs.uploadVideo.clearFiles()
      if (this.$refs.uploadForm) this.$refs.uploadForm.clearValidate()
    },
    onUploadSuccess(response) {
      if (response.code !== 0) {
        this.$message.error('上传出错：' + response.msg)
        return false
      }
      this.resetUpload()
      this.showDialog = false
      this.$modal.msgSuccess('上传成功')
      this.$emit('uploaded')
      return true
    },
    onUploadError(error) {
      this.$message.error(`上传失败: ${error.message}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.video-upload {
  margin-bottom: 5px;
}

.el-upload__tip {
  margin-left: 10px;
}
</style>
