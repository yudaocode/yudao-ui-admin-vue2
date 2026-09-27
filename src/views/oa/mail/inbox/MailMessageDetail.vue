<template>
  <div v-if="detail" class="mail-detail">
    <div class="mail-detail__header">
      <h2 class="mail-detail__subject">{{ detail.subject || '（无主题）' }}</h2>
      <div class="mail-detail__meta">
        <div>发件人：{{ detail.sender }}</div>
        <div>收件人：{{ (detail.recipients || []).join(', ') }}</div>
        <div v-if="detail.ccs && detail.ccs.length">抄送人：{{ detail.ccs.join(', ') }}</div>
        <div>时间：{{ formatDate(detail.receiveTime) }}</div>
      </div>
      <div class="mail-detail__actions">
        <el-button
          type="primary"
          size="small"
          :disabled="operating"
          @click="$emit('compose', OA_MAIL_COMPOSE_MODE.REPLY)"
        >
          回复
        </el-button>
        <el-button size="small" :disabled="operating" @click="$emit('compose', OA_MAIL_COMPOSE_MODE.REPLY_ALL)">
          回复全部
        </el-button>
        <el-button size="small" :disabled="operating" @click="$emit('compose', OA_MAIL_COMPOSE_MODE.FORWARD)">
          转发
        </el-button>
        <el-button size="small" :loading="operating" @click="$emit('read')">
          {{ detail.readStatus ? '标记未读' : '标记已读' }}
        </el-button>
        <el-button v-if="!showExternalImages" size="small" @click="showExternalImages = true">
          显示外部图片
        </el-button>
        <el-button
          v-if="folderKey === OA_MAIL_FOLDER_KEY.TRASH"
          size="small"
          :disabled="operating"
          @click="$emit('restore')"
        >
          恢复到收件箱
        </el-button>
        <el-button type="danger" plain size="small" :disabled="operating" @click="$emit('delete')">
          {{ folderKey === OA_MAIL_FOLDER_KEY.TRASH ? '彻底删除' : '删除' }}
        </el-button>
      </div>
      <div v-if="detail.attachments && detail.attachments.length" class="mail-detail__attachments">
        <span>附件：</span>
        <el-button
          v-for="attachment in detail.attachments"
          :key="attachment.part"
          type="text"
          size="mini"
          :loading="downloadingPart === attachment.part"
          @click="downloadAttachment(attachment.part, attachment.name)"
        >
          {{ attachment.name }}
        </el-button>
      </div>
    </div>
    <!-- 正文沿用邮件自身排版，外层不叠加内边距 -->
    <iframe
      title="邮件正文"
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      referrerpolicy="no-referrer"
      :srcdoc="mailHtml"
      class="mail-detail__frame"
    />
  </div>
  <el-empty v-else :description="detailError || '请选择邮件'" />
</template>

<script>
import { downloadMailMessageAttachment } from '@/api/oa/mail/message'
import { downloadByData } from '@/utils/filt'
import { formatDate } from '@/utils/formatTime'
import { OA_MAIL_FOLDER_KEY, OA_MAIL_COMPOSE_MODE } from '@/views/oa/utils/constants'

export default {
  name: 'OaMailMessageDetail',
  props: {
    detail: {
      type: Object,
      default: undefined
    },
    detailError: {
      type: String,
      required: true
    },
    folderKey: {
      type: String,
      required: true
    },
    operating: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      downloadingPart: undefined, // 正在下载的附件
      showExternalImages: false, // 用户选择后加载邮件外部图片
      OA_MAIL_FOLDER_KEY,
      OA_MAIL_COMPOSE_MODE
    }
  },
  computed: {
    // 邮件正文使用独立沙箱，链接在新窗口打开，外部图片由用户选择加载
    mailHtml() {
      return '<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data: ' +
        (this.showExternalImages ? 'http: https:' : '') +
        '; base-uri \'none\'; form-action \'none\'"><base target="_blank"><style>body{font:14px/1.7 sans-serif;padding:20px;overflow-wrap:anywhere}table,img{max-width:100%}pre{white-space:pre-wrap}</style></head><body>' +
        (this.detail.content || '') +
        '</body></html>'
    }
  },
  watch: {
    'detail.id'() {
      this.showExternalImages = false
    }
  },
  methods: {
    formatDate,
    /** 下载本人邮件附件 */
    downloadAttachment(part, name) {
      if (!this.detail || !this.detail.id) return
      this.downloadingPart = part
      return downloadMailMessageAttachment(this.detail.id, part).then(response => {
        downloadByData(response.data, name)
      }).finally(() => {
        this.downloadingPart = undefined
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mail-detail {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    flex-shrink: 0;
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
  }

  &__subject {
    margin: 0;
    font-size: 18px;
    word-break: break-word;
  }

  &__meta {
    margin-top: 12px;
    font-size: 13px;
    line-height: 24px;
    color: #909399;
    word-break: break-word;
  }

  &__actions {
    margin-top: 12px;

    .el-button + .el-button {
      margin-left: 8px;
    }
  }

  &__attachments {
    margin-top: 12px;
    font-size: 13px;
  }

  &__frame {
    flex: 1;
    width: 100%;
    min-height: 0;
    border: 0;
  }
}
</style>
