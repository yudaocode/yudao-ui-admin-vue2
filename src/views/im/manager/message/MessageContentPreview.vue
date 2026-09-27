<template>
  <span class="message-content-preview">
    <span
      v-if="isText"
      class="text-content"
    >{{ textContent }}</span>
    <el-image
      v-else-if="isImage && imagePayload"
      class="media-image"
      :src="imagePayload.thumbnailUrl || imagePayload.url"
      :preview-src-list="[imagePayload.url]"
      fit="cover"
    />
    <span
      v-else-if="isFile && filePayload"
      class="inline-content"
    >
      <i
        :class="fileIconInfo.className"
        :style="{ color: fileIconInfo.color }"
      />
      <span class="file-name">{{ filePayload.name }}</span>
      <span
        v-if="filePayload.size"
        class="secondary"
      >{{ formatFileSize(filePayload.size) }}</span>
    </span>
    <span
      v-else-if="isVoice && voicePayload"
      class="inline-content"
    ><i class="el-icon-microphone" /><span>{{ formatSeconds(voicePayload.duration == null ? 0 : voicePayload.duration) }}</span></span>
    <span
      v-else-if="isVideo && videoPayload"
      class="inline-content"
    >
      <span
        v-if="videoPayload.coverUrl"
        class="video-cover"
        :title="videoPayload.url ? '点击新标签播放' : ''"
        @click="openVideo"
      ><img
        :src="videoPayload.coverUrl"
        alt="视频封面"
      ><i class="el-icon-video-play video-play" /></span>
      <span
        v-else
        class="inline-content"
      ><i class="el-icon-video-camera video-icon" /><span>[视频]</span></span>
      <span
        v-if="videoPayload.duration"
        class="secondary"
      >{{ formatSeconds(videoPayload.duration) }}</span>
      <span
        v-if="videoPayload.size"
        class="secondary"
      >{{ formatFileSize(videoPayload.size) }}</span>
    </span>
    <span
      v-else-if="isCard && cardPayload"
      class="inline-content"
    ><i :class="cardPayload.targetType === 2 ? 'el-icon-user-solid' : 'el-icon-user'" /><span>{{ cardPayload.targetType === 2 ? '群名片' : '个人名片' }}：{{ cardPayload.name || '' }}</span></span>
    <span
      v-else-if="isMerge && mergePayload"
      class="merge-content"
    ><span>[聊天记录] {{ mergePayload.title }}</span><span
      v-for="(line, index) in mergePreviewLines"
      :key="index"
      class="merge-line secondary"
    >{{ line }}</span></span>
    <span
      v-else-if="isFace && facePayload"
      class="inline-content"
    ><img
      v-if="facePayload.url"
      :src="facePayload.url"
      :alt="facePayload.name || '表情'"
      class="face-image"
      draggable="false"
    ><span>{{ facePreviewText }}</span></span>
    <span
      v-else-if="type === ImContentType.RECALL"
      class="secondary"
    >[消息已撤回]</span>
    <span
      v-else-if="type === ImContentType.READ"
      class="secondary"
    >[已读回执]</span>
    <span
      v-else-if="type === ImContentType.RECEIPT"
      class="secondary"
    >[回执]</span>
    <span
      v-else-if="isGroupNotificationType"
      class="secondary"
    >{{ groupNotificationText }}</span>
    <span
      v-else-if="isFriendChatTipType"
      class="secondary"
    >{{ friendChatTipText }}</span>
    <span
      v-else-if="isRtcCallTipType"
      class="inline-content secondary"
    ><i class="el-icon-phone-outline phone-icon" /><span>{{ rtcCallTipText }}</span></span>
    <span
      v-else
      class="text-content"
    >{{ fallbackText }}</span>
  </span>
</template>

<script>
import { DICT_TYPE, getDictDataLabel } from '@/utils/dict'

const ImContentType = {
  TEXT: 101, IMAGE: 102, VOICE: 103, VIDEO: 104, FILE: 105, MERGE: 107, CARD: 108, FACE: 115,
  RECALL: 2101, RECEIPT: 2200, READ: 2201, RTC_CALL_START: 1610, RTC_CALL_END: 1611,
  FRIEND_ADD: 1204, FRIEND_DELETE: 1205, GROUP_CREATE: 1501, GROUP_INFO_UPDATE: 1502,
  GROUP_MEMBER_QUIT: 1504, GROUP_OWNER_TRANSFER: 1507, GROUP_MEMBER_KICK: 1508,
  GROUP_MEMBER_INVITE: 1509, GROUP_MEMBER_ENTER: 1510, GROUP_DISSOLVE: 1511,
  GROUP_MEMBER_MUTED: 1512, GROUP_MEMBER_CANCEL_MUTED: 1513, GROUP_MUTED: 1514,
  GROUP_CANCEL_MUTED: 1515, GROUP_MEMBER_NICKNAME_UPDATE: 1516, GROUP_ADMIN_ADD: 1517,
  GROUP_ADMIN_REMOVE: 1518, GROUP_NOTICE_UPDATE: 1519, GROUP_NAME_UPDATE: 1520,
  GROUP_MEMBER_SETTING_UPDATE: 1530, GROUP_MESSAGE_PIN: 1531, GROUP_MESSAGE_UNPIN: 1532,
  GROUP_BANNED: 1533
}
const ImRtcCallMediaType = { VOICE: 1, VIDEO: 2 }
const ImRtcCallEndReason = { HANGUP: 1 }
const MESSAGE_MERGE_PREVIEW_LINES = 3

function parseMessage(content) {
  try {
    return JSON.parse(content)
  } catch (error) {
    return null
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const base = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(base))
  return parseFloat((bytes / Math.pow(base, index)).toFixed(2)) + ' ' + sizes[index]
}

function formatSeconds(seconds) {
  const value = Math.max(0, Math.floor(seconds || 0))
  return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0')
}

function getFileIconInfo(filename) {
  const ext = (filename || '').split('.').pop().toLowerCase()
  if (ext === 'pdf') return { className: 'el-icon-document', color: '#ed5757' }
  if (['doc', 'docx'].includes(ext)) return { className: 'el-icon-document', color: '#2b7cd3' }
  if (['xls', 'xlsx'].includes(ext)) return { className: 'el-icon-document', color: '#1f7244' }
  if (['ppt', 'pptx'].includes(ext)) return { className: 'el-icon-document', color: '#d24726' }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { className: 'el-icon-folder', color: '#f0ad4e' }
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return { className: 'el-icon-picture', color: '#9c27b0' }
  return { className: 'el-icon-document', color: '#909399' }
}

function summarizeMessageContent(message) {
  if (message.type === ImContentType.TEXT) {
    const text = parseMessage(message.content)
    return text ? text.content || '' : ''
  }
  if (message.type === ImContentType.IMAGE) return '[图片]'
  if (message.type === ImContentType.VOICE) return '[语音]'
  if (message.type === ImContentType.VIDEO) return '[视频]'
  if (message.type === ImContentType.FILE) return '[文件]'
  if (message.type === ImContentType.CARD) return '[名片]'
  if (message.type === ImContentType.FACE) {
    const face = parseMessage(message.content)
    return face && face.name ? '[表情] ' + face.name : '[表情]'
  }
  if (message.type === ImContentType.MERGE) return '[聊天记录]'
  return ''
}

function userName(id) {
  return '用户(' + id + ')'
}

function resolveGroupNotification(type, content, senderNickname) {
  let payload
  try {
    payload = JSON.parse(content || '{}')
  } catch (error) {
    return ''
  }
  if (type === ImContentType.GROUP_MEMBER_ENTER) {
    const entrantId = payload.entrantUserId == null ? payload.operatorUserId : payload.entrantUserId
    return entrantId ? userName(entrantId) + ' 加入了群聊' : ''
  }
  if (!payload.operatorUserId) return ''
  const operator = senderNickname || userName(payload.operatorUserId)
  const members = (payload.memberUserIds || []).map(userName).join('、')
  const muted = payload.mutedUserId ? userName(payload.mutedUserId) : ''
  const owner = payload.newOwnerUserId ? userName(payload.newOwnerUserId) : ''
  const texts = {
    [ImContentType.GROUP_CREATE]: operator + ' 创建了群聊',
    [ImContentType.GROUP_NAME_UPDATE]: operator + ' 将群名修改为 "' + (payload.newName || '') + '"',
    [ImContentType.GROUP_NOTICE_UPDATE]: operator + ' 更新了群公告',
    [ImContentType.GROUP_DISSOLVE]: operator + ' 解散了群聊',
    [ImContentType.GROUP_MEMBER_INVITE]: operator + ' 邀请 ' + members + ' 加入群聊',
    [ImContentType.GROUP_MEMBER_QUIT]: operator + ' 退出了群聊',
    [ImContentType.GROUP_MEMBER_KICK]: operator + ' 移出了 ' + members,
    [ImContentType.GROUP_MEMBER_NICKNAME_UPDATE]: operator + ' 修改群昵称为 "' + (payload.displayUserName || '') + '"',
    [ImContentType.GROUP_ADMIN_ADD]: operator + ' 将 ' + members + ' 设为管理员',
    [ImContentType.GROUP_ADMIN_REMOVE]: operator + ' 撤销了 ' + members + ' 的管理员身份',
    [ImContentType.GROUP_OWNER_TRANSFER]: owner ? operator + ' 已将群主转让给 ' + owner : '',
    [ImContentType.GROUP_MESSAGE_PIN]: operator + ' 置顶了一条消息',
    [ImContentType.GROUP_MESSAGE_UNPIN]: operator + ' 取消了一条置顶消息',
    [ImContentType.GROUP_MEMBER_MUTED]: muted ? operator + ' 将 ' + muted + ' 禁言' : '',
    [ImContentType.GROUP_MEMBER_CANCEL_MUTED]: muted ? operator + ' 解除了 ' + muted + ' 的禁言' : '',
    [ImContentType.GROUP_MUTED]: operator + ' 开启了全群禁言',
    [ImContentType.GROUP_CANCEL_MUTED]: operator + ' 关闭了全群禁言',
    [ImContentType.GROUP_BANNED]: operator + (payload.banned ? ' 封禁了该群' : ' 解封了该群')
  }
  if (type === ImContentType.GROUP_INFO_UPDATE) return operator + (payload.newAvatar ? ' 更换了群头像' : ' 更新了群信息')
  return texts[type] || ''
}

export default {
  name: 'ImMessageContentPreview',
  props: {
    type: { type: Number, default: undefined },
    content: { type: String, default: '' },
    senderNickname: { type: String, default: '' }
  },
  data() {
    return { ImContentType }
  },
  computed: {
    isText() { return this.type === ImContentType.TEXT },
    isImage() { return this.type === ImContentType.IMAGE },
    isFile() { return this.type === ImContentType.FILE },
    isVoice() { return this.type === ImContentType.VOICE },
    isVideo() { return this.type === ImContentType.VIDEO },
    isCard() { return this.type === ImContentType.CARD },
    isFace() { return this.type === ImContentType.FACE },
    isMerge() { return this.type === ImContentType.MERGE },
    textContent() { const value = parseMessage(this.content || ''); return value ? value.content || '' : '' },
    imagePayload() { return this.isImage ? parseMessage(this.content || '') : null },
    filePayload() { return this.isFile ? parseMessage(this.content || '') : null },
    voicePayload() { return this.isVoice ? parseMessage(this.content || '') : null },
    videoPayload() { return this.isVideo ? parseMessage(this.content || '') : null },
    cardPayload() { return this.isCard ? parseMessage(this.content || '') : null },
    facePayload() { return this.isFace ? parseMessage(this.content || '') : null },
    mergePayload() { return this.isMerge ? parseMessage(this.content || '') : null },
    mergePreviewLines() {
      if (!this.mergePayload) return []
      return this.mergePayload.messages.slice(0, MESSAGE_MERGE_PREVIEW_LINES).map(item => item.senderNickname + '：' + summarizeMessageContent(item))
    },
    fileIconInfo() { return getFileIconInfo(this.filePayload && this.filePayload.name) },
    facePreviewText() { return this.facePayload && this.facePayload.name ? '[表情] ' + this.facePayload.name : '[表情]' },
    fallbackText() {
      const raw = this.content || ''
      if (!raw) return ''
      const parsed = parseMessage(raw)
      return parsed && typeof parsed === 'object' && parsed.content ? String(parsed.content) : raw
    },
    isFriendChatTipType() { return this.type === ImContentType.FRIEND_ADD || this.type === ImContentType.FRIEND_DELETE },
    friendChatTipText() { return this.type === ImContentType.FRIEND_ADD ? '你们已经是好友了，开始聊天吧' : '你已删除好友' },
    isGroupNotificationType() { return this.type >= ImContentType.GROUP_CREATE && this.type <= ImContentType.GROUP_BANNED && this.type !== ImContentType.GROUP_MEMBER_SETTING_UPDATE },
    groupNotificationText() { return resolveGroupNotification(this.type, this.content, this.senderNickname) },
    isRtcCallTipType() { return this.type === ImContentType.RTC_CALL_START || this.type === ImContentType.RTC_CALL_END },
    rtcCallTipText() {
      const payload = parseMessage(this.content || '')
      if (!payload) return ''
      const media = payload.mediaType === ImRtcCallMediaType.VIDEO ? '视频' : '语音'
      if (this.type === ImContentType.RTC_CALL_START) return (String(payload.inviterNickname || '').trim() || userName(payload.inviterUserId == null ? '' : payload.inviterUserId)) + ' 发起了' + media + '通话'
      const segments = [media + '通话已结束']
      if (payload.endReason && payload.endReason !== ImRtcCallEndReason.HANGUP) {
        const reason = getDictDataLabel(DICT_TYPE.IM_RTC_CALL_END_REASON, payload.endReason)
        if (reason) segments.push(reason)
      }
      if ((payload.durationSeconds || 0) > 0) segments.push('时长 ' + formatSeconds(payload.durationSeconds))
      return segments.join('，')
    }
  },
  methods: {
    formatFileSize,
    formatSeconds,
    openVideo() {
      const url = this.videoPayload && this.videoPayload.url
      if (!url) return
      try {
        const parsed = new URL(url, window.location.origin)
        if (!['http:', 'https:', 'blob:'].includes(parsed.protocol)) return
        window.open(url, '_blank', 'noopener,noreferrer')
      } catch (error) {
        return
      }
    }
  }
}
</script>

<style scoped>
.message-content-preview { display: inline-block; max-width: 100%; }
.text-content { white-space: pre-wrap; word-break: break-all; }
.inline-content { display: inline-flex; align-items: center; gap: 6px; }
.secondary { color: #909399; font-size: 12px; }
.media-image, .video-cover { width: 60px; height: 60px; border-radius: 4px; vertical-align: middle; }
.video-cover { position: relative; display: inline-block; overflow: hidden; cursor: pointer; }
.video-cover img { width: 100%; height: 100%; object-fit: cover; }
.video-play { position: absolute; inset: 20px; color: #fff; font-size: 22px; text-shadow: 0 0 2px rgb(0 0 0 / 60%); }
.video-icon { color: #9c27b0; }
.phone-icon { transform: rotate(135deg); }
.file-name { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.merge-content { display: inline-flex; flex-direction: column; vertical-align: middle; }
.merge-line { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.face-image { width: 30px; height: 30px; border-radius: 4px; object-fit: contain; vertical-align: middle; }
</style>
