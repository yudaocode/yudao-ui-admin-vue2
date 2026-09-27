<template>
  <div>
    <el-row>
      <el-input
        :value="reply.title"
        class="input-margin-bottom"
        placeholder="请输入标题"
        @input="updateField('title', $event)"
      />
      <el-input
        :value="reply.description"
        class="input-margin-bottom"
        placeholder="请输入描述"
        @input="updateField('description', $event)"
      />
      <el-row
        class="ope-row"
        type="flex"
        justify="center"
      >
        <wx-video-player
          v-if="reply.url"
          :url="reply.url"
        />
      </el-row>

      <el-col :span="24">
        <el-row
          type="flex"
          align="middle"
          class="select-actions"
        >
          <el-col :span="12">
            <el-button
              type="success"
              @click="showDialog = true"
            >
              素材库选择<i class="el-icon-circle-check el-icon--right" />
            </el-button>
            <el-dialog
              title="选择视频"
              :visible.sync="showDialog"
              width="90%"
              append-to-body
              destroy-on-close
            >
              <wx-material-select
                type="video"
                :account-id="reply.accountId"
                @select-material="selectMaterial"
              />
            </el-dialog>
          </el-col>

          <el-col :span="12">
            <el-upload
              :action="uploadUrl"
              :headers="headers"
              multiple
              :limit="1"
              :file-list="fileList"
              :data="uploadData"
              :before-upload="beforeVideoUpload"
              :on-success="onUploadSuccess"
            >
              <el-button type="primary">
                新建视频<i class="el-icon-upload el-icon--right" />
              </el-button>
            </el-upload>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import WxVideoPlayer from '@/views/mp/components/wx-video-play'
import WxMaterialSelect from '@/views/mp/components/wx-material-select'
import { UploadType, useBeforeUpload } from '@/views/mp/hooks/useUpload'
import { getAccessToken } from '@/utils/auth'

export default {
  name: 'TabVideo',
  components: { WxVideoPlayer, WxMaterialSelect },
  props: {
    value: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showDialog: false,
      fileList: [],
      uploadData: {
        accountId: undefined,
        type: 'video',
        title: '',
        introduction: ''
      }
    }
  },
  computed: {
    reply() {
      return this.value || {}
    },
    uploadUrl() {
      return process.env.VUE_APP_BASE_API + '/admin-api/mp/material/upload-temporary'
    },
    headers() {
      return { Authorization: 'Bearer ' + getAccessToken() }
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
    beforeVideoUpload(rawFile) {
      this.uploadData.accountId = this.reply.accountId
      return useBeforeUpload(UploadType.Video, 10, message => this.$message.error(message))(rawFile)
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

      const patch = {
        mediaId: item.mediaId,
        url: item.url,
        name: item.name
      }
      if (item.title) patch.title = item.title
      if (item.introduction) patch.description = item.introduction
      this.updateReply(patch)
    }
  }
}
</script>

<style lang="scss" scoped>
.input-margin-bottom {
  margin-bottom: 2%;
}

.ope-row {
  width: 100%;
  padding-top: 10px;
}

.select-actions {
  width: 100%;
  text-align: center;
}
</style>
