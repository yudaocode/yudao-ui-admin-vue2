<template>
  <div
    class="upload-img"
    :style="uploadStyle"
  >
    <el-upload
      ref="upload"
      :accept="fileType.join(',')"
      :action="uploadUrl"
      :before-upload="beforeUpload"
      :class="['upload', { 'no-border': drag, disabled }]"
      :disabled="disabled"
      :drag="drag"
      :http-request="httpRequest"
      :multiple="false"
      :on-error="uploadError"
      :on-success="uploadSuccess"
      :show-file-list="false"
      name="file"
    >
      <template v-if="value">
        <img
          :src="value"
          alt=""
          class="upload-image"
        />
        <div
          class="upload-handle"
          @click.stop
        >
          <div
            v-if="!disabled"
            class="handle-icon"
            @click="editImg"
          >
            <i class="el-icon-edit" />
            <span v-if="showBtnText">编辑</span>
          </div>
          <div
            class="handle-icon"
            @click="imagePreview"
          >
            <i class="el-icon-zoom-in" />
            <span v-if="showBtnText">详情</span>
          </div>
          <div
            v-if="showDelete && !disabled"
            class="handle-icon"
            @click="deleteImg"
          >
            <i class="el-icon-delete" />
            <span v-if="showBtnText">删除</span>
          </div>
        </div>
      </template>
      <div
        v-else
        class="upload-empty"
      >
        <slot name="empty">
          <i class="el-icon-plus" />
        </slot>
      </div>
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
      <img
        :src="value"
        alt=""
        class="preview-image"
      />
    </el-dialog>
  </div>
</template>

<script>
import { useUpload } from '@/components/UploadFile/src/useUpload'

export default {
  name: 'UploadImg',
  props: {
    value: { type: String, default: '' },
    drag: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    fileSize: { type: Number, default: 5 },
    fileType: {
      type: Array,
      default: () => ['image/jpeg', 'image/png', 'image/gif']
    },
    height: { type: String, default: '150px' },
    width: { type: String, default: '150px' },
    borderradius: { type: String, default: '8px' },
    showDelete: { type: Boolean, default: true },
    showBtnText: { type: Boolean, default: true },
    directory: { type: String, default: undefined }
  },
  data() {
    const { uploadUrl, httpRequest } = useUpload(this.directory)
    return {
      previewVisible: false,
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
  methods: {
    imagePreview() {
      this.previewVisible = true
    },
    deleteImg() {
      this.$emit('input', '')
    },
    editImg() {
      if (this.disabled) return
      const input = this.$refs.upload.$el.querySelector('.el-upload__input')
      if (input) input.click()
    },
    beforeUpload(file) {
      const validType = this.fileType.includes(file.type)
      const validSize = file.size / 1024 / 1024 < this.fileSize
      if (!validType) {
        this.$notify.warning({ title: '警告', message: '上传图片不符合所需的格式！' })
      }
      if (!validSize) {
        this.$notify.warning({
          title: '警告',
          message: `上传图片大小不能超过 ${this.fileSize}M！`
        })
      }
      return validType && validSize
    },
    httpRequest(options) {
      return this.uploadHttpRequest(options)
    },
    uploadSuccess(response) {
      this.$message.success('上传成功')
      this.$emit('input', response.data)
    },
    uploadError() {
      this.$notify.error({ title: '错误', message: '图片上传失败，请您重新上传！' })
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-img {
  ::v-deep .upload .el-upload {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--upload-width);
    height: var(--upload-height);
    overflow: hidden;
    border: 1px dashed #d9d9d9;
    border-radius: var(--upload-border-radius);
    box-sizing: border-box;
    transition: 0.2s;

    &:hover {
      border-color: #409eff;

      .upload-handle {
        opacity: 1;
      }
    }
  }

  ::v-deep .upload.no-border .el-upload {
    border: none;
  }

  ::v-deep .upload .el-upload-dragger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0;
    overflow: hidden;
    background-color: transparent;
    border: 1px dashed #d9d9d9;
    border-radius: var(--upload-border-radius);
    box-sizing: border-box;

    &:hover {
      border-color: #409eff;
    }

    &.is-dragover {
      background-color: #ecf5ff;
      border: 2px dashed #409eff;
    }
  }

  ::v-deep .upload.disabled .el-upload,
  ::v-deep .upload.disabled .el-upload-dragger {
    cursor: not-allowed;
    background: #f5f7fa;
    border-color: #dcdfe6;
  }

  .upload-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .upload-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #909399;

    i {
      font-size: 28px;
      color: #909399;
    }
  }

  .upload-handle {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.6);
    opacity: 0;
    box-sizing: border-box;
    transition: 0.2s;
  }

  .handle-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 6%;
    color: aliceblue;

    i {
      margin-bottom: 40%;
      font-size: 130%;
      line-height: 130%;
    }

    span {
      font-size: 85%;
      line-height: 85%;
    }
  }

  .el-upload__tip {
    line-height: 18px;
    text-align: center;
  }
}

.preview-image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
}
</style>
