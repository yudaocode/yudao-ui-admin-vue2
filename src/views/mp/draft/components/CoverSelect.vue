<template>
  <div class="cover-select">
    <p>封面:</p>
    <div class="thumb-div">
      <el-image
        v-if="value.thumbUrl"
        class="cover-image"
        :src="value.thumbUrl"
        fit="contain"
      />
      <i
        v-else
        class="el-icon-plus avatar-uploader-icon"
        :class="isFirst ? 'avatar' : 'avatar1'"
      />
      <div class="thumb-buttons">
        <el-upload
          :action="UPLOAD_URL"
          :headers="HEADERS"
          multiple
          :limit="1"
          :file-list="fileList"
          :data="uploadData"
          :before-upload="onBeforeUpload"
          :on-error="onUploadError"
          :on-success="onUploadSuccess"
        >
          <el-button
            slot="trigger"
            size="small"
            type="primary"
          >本地上传</el-button>
          <el-button
            size="small"
            type="primary"
            class="material-button"
            @click.stop="showImageDialog = true"
          >素材库选择</el-button>
          <div
            slot="tip"
            class="el-upload__tip"
          >支持 bmp/png/jpeg/jpg/gif 格式，大小不超过 2M</div>
        </el-upload>
      </div>
      <el-dialog
        title="选择图片"
        :visible.sync="showImageDialog"
        width="80%"
        append-to-body
        destroy-on-close
      >
        <wx-material-select
          type="image"
          :account-id="accountId"
          @select-material="onMaterialSelected"
        />
      </el-dialog>
    </div>
  </div>
</template>

<script>
import WxMaterialSelect from '@/views/mp/components/wx-material-select'
import { getAccessToken } from '@/utils/auth'
import { UploadType, useBeforeUpload } from '@/views/mp/hooks/useUpload'

const UPLOAD_URL = process.env.VUE_APP_BASE_API + '/admin-api/mp/material/upload-permanent'

export default {
  name: 'CoverSelect',
  components: { WxMaterialSelect },
  inject: {
    mpAccountContext: {
      default: () => ({ value: -1 })
    }
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    isFirst: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      HEADERS: { Authorization: 'Bearer ' + getAccessToken() },
      UPLOAD_URL,
      showImageDialog: false,
      fileList: [],
      uploadData: {
        type: UploadType.Image,
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
    }
  },
  methods: {
    updateCover(mediaId, thumbUrl) {
      this.$emit('input', {
        ...this.value,
        thumbMediaId: mediaId,
        thumbUrl
      })
    },
    onMaterialSelected(item) {
      this.showImageDialog = false
      this.updateCover(item.mediaId, item.url)
    },
    onBeforeUpload(file) {
      this.uploadData.accountId = this.accountId
      return useBeforeUpload(UploadType.Image, 2, message => this.$message.error(message))(file)
    },
    onUploadSuccess(response) {
      if (response.code !== 0) {
        this.$message.error('上传出错：' + response.msg)
        return false
      }
      this.fileList = []
      this.updateCover(response.data.mediaId, response.data.url)
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

.thumb-div {
  display: inline-block;
  width: 100%;
  text-align: center;
}

.cover-image {
  width: 300px;
  max-height: 300px;
}

.avatar-uploader-icon {
  width: 120px;
  height: 120px;
  font-size: 28px;
  line-height: 120px;
  color: #8c939d;
  text-align: center;
  border: 1px solid #d9d9d9;
}

.avatar {
  width: 230px;
}

.thumb-buttons {
  margin: 5px;
}

.material-button {
  margin-left: 5px;
}
</style>
