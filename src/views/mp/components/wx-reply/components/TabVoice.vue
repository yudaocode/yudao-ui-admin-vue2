<template>
  <div>
    <div
      v-if="reply.url"
      class="select-item"
    >
      <p class="item-name">{{ reply.name }}</p>
      <el-row
        class="ope-row"
        type="flex"
        justify="center"
      >
        <wx-voice-player :url="reply.url" />
      </el-row>
      <el-row
        class="ope-row"
        type="flex"
        justify="center"
      >
        <el-button
          type="danger"
          icon="el-icon-delete"
          circle
          @click="onDelete"
        />
      </el-row>
    </div>

    <el-row
      v-else
      type="flex"
      class="select-actions"
    >
      <el-col
        :span="12"
        class="col-select"
      >
        <el-button
          type="success"
          @click="showDialog = true"
        >
          素材库选择<i class="el-icon-circle-check el-icon--right" />
        </el-button>
        <el-dialog
          title="选择语音"
          :visible.sync="showDialog"
          width="90%"
          append-to-body
          destroy-on-close
        >
          <wx-material-select
            type="voice"
            :account-id="reply.accountId"
            @select-material="selectMaterial"
          />
        </el-dialog>
      </el-col>

      <el-col
        :span="12"
        class="col-add"
      >
        <el-upload
          :action="uploadUrl"
          :headers="headers"
          multiple
          :limit="1"
          :file-list="fileList"
          :data="uploadData"
          :before-upload="beforeVoiceUpload"
          :on-success="onUploadSuccess"
        >
          <el-button type="primary">点击上传</el-button>
          <div
            slot="tip"
            class="el-upload__tip"
          >
            格式支持 mp3/wma/wav/amr，文件大小不超过 2M，播放长度不超过 60s
          </div>
        </el-upload>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import WxMaterialSelect from '@/views/mp/components/wx-material-select'
import WxVoicePlayer from '@/views/mp/components/wx-voice-play'
import { UploadType, useBeforeUpload } from '@/views/mp/hooks/useUpload'
import { getAccessToken } from '@/utils/auth'

export default {
  name: 'TabVoice',
  components: { WxMaterialSelect, WxVoicePlayer },
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
        type: 'voice',
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
    beforeVoiceUpload(rawFile) {
      this.uploadData.accountId = this.reply.accountId
      return useBeforeUpload(UploadType.Voice, 2, message => this.$message.error(message))(rawFile)
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
    onDelete() {
      this.updateReply({ mediaId: null, url: null, name: null })
    },
    selectMaterial(item) {
      if (!item) return
      this.showDialog = false
      this.updateReply({ mediaId: item.mediaId, url: item.url, name: item.name })
    }
  }
}
</script>

<style lang="scss" scoped>
.select-item {
  padding: 10px;
  margin: 0 auto 10px;
  border: 1px solid #eaeaea;
}

.item-name {
  overflow: hidden;
  font-size: 12px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ope-row {
  width: 100%;
  padding-top: 10px;
}

.select-actions {
  text-align: center;
}

.col-select,
.col-add {
  height: 160px;
  padding: 50px 0;
  border: 1px solid rgb(234, 234, 234);
}

.el-upload__tip {
  line-height: 18px;
  text-align: center;
}
</style>
