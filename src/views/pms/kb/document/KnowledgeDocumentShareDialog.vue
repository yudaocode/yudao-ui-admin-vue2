<template>
  <el-dialog title="分享文档" :visible.sync="dialogVisible" width="600px" append-to-body>
    <el-form v-loading="formLoading" label-width="100px">
      <el-form-item label="公开链接">
        <div v-if="share" class="share-url-row">
          <el-input :value="shareUrl" readonly />
          <el-button @click="copyShareUrl">复制链接</el-button>
        </div>
        <span v-else class="secondary-text">开启后，任何获得链接的人都可以查看当前文档。</span>
      </el-form-item>
      <el-form-item v-if="share" label="二维码">
        <div class="qrcode-row">
          <qrcode
            :text="shareUrl"
            :width="160"
            :options="qrCodeOptions"
            class="share-qrcode"
            @done="handleQrCodeDone"
          />
          <el-button :disabled="!qrCodeDataUrl" @click="downloadQrCode">下载二维码</el-button>
        </div>
      </el-form-item>
      <el-form-item label="分享给成员">
        <user-select-v2
          v-model="shareUserIds"
          :multiple="true"
          placeholder="请选择内部分享成员"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-popconfirm
        v-if="share"
        cancel-button-text="取消"
        confirm-button-text="确定"
        title="关闭后，现有公开链接将立即失效。是否继续？"
        @confirm="closeShare"
      >
        <el-button slot="reference" :disabled="formLoading" type="danger">关闭分享</el-button>
      </el-popconfirm>
      <el-button :disabled="formLoading" type="primary" @click="submitShare">
        {{ share ? '保存成员' : '开启分享' }}
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as KnowledgeDocumentShareApi from '@/api/pms/kb/interaction/share'
import { Qrcode } from '@/components/Qrcode'
import download from '@/utils/download'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

export default {
  name: 'PmsKnowledgeDocumentShareDialog',
  components: { Qrcode, UserSelectV2 },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      documentId: undefined,
      share: undefined,
      shareUserIds: [],
      qrCodeDataUrl: '',
      qrCodeOptions: {
        margin: 1,
        color: { dark: '#1f2937', light: '#ffffff' }
      }
    }
  },
  computed: {
    shareUrl() {
      if (!this.share) return ''
      return window.location.origin + '/pms/kb/document/share/' + this.share.token
    }
  },
  methods: {
    async open(id) {
      this.dialogVisible = true
      this.documentId = id
      this.qrCodeDataUrl = ''
      this.formLoading = true
      try {
        const response = await KnowledgeDocumentShareApi.getKnowledgeDocumentShare(id)
        this.share = response.data
        this.shareUserIds = this.share ? this.share.shareUserIds || [] : []
      } finally {
        this.formLoading = false
      }
    },
    async submitShare() {
      if (!this.documentId) return
      this.formLoading = true
      try {
        if (this.share) {
          await KnowledgeDocumentShareApi.updateKnowledgeDocumentShareMemberList({
            documentId: this.documentId,
            shareUserIds: this.shareUserIds
          })
          this.$modal.msgSuccess('分享成员已更新')
          this.dialogVisible = false
        } else {
          const response = await KnowledgeDocumentShareApi.openKnowledgeDocumentShare({
            documentId: this.documentId,
            shareUserIds: this.shareUserIds
          })
          this.share = response.data
          this.$modal.msgSuccess('分享已开启')
        }
      } finally {
        this.formLoading = false
      }
    },
    async closeShare() {
      if (!this.documentId) return
      this.formLoading = true
      try {
        await KnowledgeDocumentShareApi.closeKnowledgeDocumentShare(this.documentId)
        this.share = undefined
        this.shareUserIds = []
        this.qrCodeDataUrl = ''
        this.$modal.msgSuccess('分享已关闭')
        this.dialogVisible = false
      } finally {
        this.formLoading = false
      }
    },
    handleQrCodeDone(dataUrl) {
      this.qrCodeDataUrl = dataUrl
    },
    downloadQrCode() {
      if (!this.qrCodeDataUrl) return
      download.base64Image(this.qrCodeDataUrl, 'knowledge-document-share')
    },
    async copyShareUrl() {
      await navigator.clipboard.writeText(this.shareUrl)
      this.$modal.msgSuccess('链接已复制')
    }
  }
}
</script>

<style scoped>
.share-url-row,
.qrcode-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.qrcode-row {
  gap: 12px;
}

.share-qrcode {
  width: 160px;
  height: 160px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.secondary-text {
  color: #909399;
}
</style>
