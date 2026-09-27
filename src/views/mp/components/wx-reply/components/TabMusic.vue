<template>
  <div>
    <el-row
      type="flex"
      align="middle"
      justify="center"
    >
      <el-col :span="6">
        <div class="thumb-div">
          <img
            v-if="reply.thumbMediaUrl"
            :src="reply.thumbMediaUrl"
            class="thumb-img"
            alt=""
          />
          <i
            v-else
            class="el-icon-plus avatar-uploader-icon"
          />
          <div class="thumb-but">
            <el-upload
              :action="actionUrl"
              :headers="headers"
              :limit="1"
              :file-list="fileList"
              :data="uploadData"
              :before-upload="beforeImageUpload"
              :on-success="onUploadSuccess"
            >
              <el-button
                slot="trigger"
                size="mini"
                type="text"
              >本地上传</el-button>
              <el-button
                size="mini"
                type="text"
                class="material-button"
                @click.stop="showDialog = true"
              >
                素材库选择
              </el-button>
            </el-upload>
          </div>
        </div>
        <el-dialog
          title="选择图片"
          :visible.sync="showDialog"
          width="80%"
          append-to-body
          destroy-on-close
        >
          <wx-material-select
            type="image"
            :account-id="reply.accountId"
            @select-material="selectMaterial"
          />
        </el-dialog>
      </el-col>
      <el-col :span="18">
        <el-input
          :value="reply.title"
          placeholder="请输入标题"
          @input="updateField('title', $event)"
        />
        <div class="field-gap" />
        <el-input
          :value="reply.description"
          placeholder="请输入描述"
          @input="updateField('description', $event)"
        />
      </el-col>
    </el-row>
    <div class="field-gap" />
    <el-input
      :value="reply.musicUrl"
      placeholder="请输入音乐链接"
      @input="updateField('musicUrl', $event)"
    />
    <div class="field-gap" />
    <el-input
      :value="reply.hqMusicUrl"
      placeholder="请输入高质量音乐链接"
      @input="updateField('hqMusicUrl', $event)"
    />
  </div>
</template>

<script>
import WxMaterialSelect from '@/views/mp/components/wx-material-select'
import { getAccessToken } from '@/utils/auth'
import { UploadType, useBeforeUpload } from '@/views/mp/hooks/useUpload'
import { ReplyType, createEmptyReply } from './types'

export default {
  name: 'WxReplyTabMusic',
  components: { WxMaterialSelect },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      emptyReply: createEmptyReply({ accountId: undefined, type: ReplyType.Music }),
      showDialog: false,
      fileList: [],
      uploadData: {
        accountId: undefined,
        type: 'thumb',
        title: '',
        introduction: ''
      },
      actionUrl: process.env.VUE_APP_BASE_API + '/admin-api/mp/material/upload-temporary',
      headers: { Authorization: 'Bearer ' + getAccessToken() }
    }
  },
  computed: {
    reply() {
      return this.value || this.emptyReply
    }
  },
  methods: {
    emitReply(nextReply) {
      this.$emit('input', nextReply)
    },
    updateReply(patch) {
      this.emitReply({ ...this.reply, ...patch })
    },
    updateField(field, value) {
      this.updateReply({ [field]: value })
    },
    beforeImageUpload(file) {
      this.uploadData.accountId = this.reply.accountId
      return useBeforeUpload(UploadType.Image, 2, message => this.$message.error(message))(file)
    },
    onUploadSuccess(response) {
      if (!response || response.code !== 0) {
        this.$message.error('上传出错：' + response.msg)
        return false
      }
      this.fileList = []
      this.uploadData.title = ''
      this.uploadData.introduction = ''
      this.selectMaterial(response.data)
      return true
    },
    selectMaterial(item) {
      if (!item) return
      this.showDialog = false
      this.updateReply({ thumbMediaId: item.mediaId, thumbMediaUrl: item.url })
    }
  }
}
</script>

<style lang="scss" scoped>
.thumb-div {
  display: inline-block;
  text-align: center;
}

.thumb-img {
  width: 100px;
}

.avatar-uploader-icon {
  width: 100px;
  height: 100px;
  font-size: 28px;
  line-height: 100px;
  color: #8c939d;
  text-align: center;
  border: 1px solid #d9d9d9;
}

.material-button {
  margin-left: 5px;
}

.field-gap {
  margin: 20px 0;
}
</style>
