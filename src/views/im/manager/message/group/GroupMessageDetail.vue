<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="群聊消息详情"
    width="700px"
    append-to-body
  >
    <el-descriptions
      :column="2"
      border
    >
      <el-descriptions-item label="编号">{{ detail.id }}</el-descriptions-item>
      <el-descriptions-item label="客户端编号">{{ detail.clientMessageId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="群">{{ detail.groupName }} ({{ detail.groupId }})</el-descriptions-item>
      <el-descriptions-item label="发送人">{{ detail.senderNickname }} ({{ detail.senderId }})</el-descriptions-item>
      <el-descriptions-item label="类型"><dict-tag
        :type="DICT_TYPE.IM_CONTENT_TYPE"
        :value="detail.type"
      /></el-descriptions-item>
      <el-descriptions-item
        v-if="MESSAGE_GROUP_READ_ENABLED"
        label="状态"
      ><dict-tag
        :type="DICT_TYPE.IM_MESSAGE_STATUS"
        :value="detail.status"
      /></el-descriptions-item>
      <el-descriptions-item
        v-if="MESSAGE_GROUP_READ_ENABLED"
        label="回执"
      ><dict-tag
        :type="DICT_TYPE.IM_MESSAGE_RECEIPT_STATUS"
        :value="detail.receiptStatus"
      /></el-descriptions-item>
      <el-descriptions-item
        label="@用户"
        :span="2"
      >
        <template v-if="detail.atUserIds && detail.atUserIds.length">
          <span
            v-for="(userId, index) in detail.atUserIds"
            :key="userId"
          ><span v-if="index > 0">、</span><template v-if="userId === IM_AT_ALL_USER_ID">@{{ IM_AT_ALL_NICKNAME }}</template><template v-else>@{{ atNickname(index, userId) }} <span class="secondary">({{ userId }})</span></template></span>
        </template>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item
        label="发送时间"
        :span="2"
      >{{ formatDate(detail.sendTime) }}</el-descriptions-item>
      <el-descriptions-item
        label="消息内容"
        :span="2"
      ><MessageContentPreview
        :type="detail.type"
        :content="detail.content"
        :sender-nickname="detail.senderNickname"
      /></el-descriptions-item>
      <el-descriptions-item
        label="原始 JSON"
        :span="2"
      ><pre class="raw-json">{{ formatJson(detail.content) }}</pre></el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script>
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import MessageContentPreview from '../MessageContentPreview.vue'

const IM_AT_ALL_USER_ID = -1
const IM_AT_ALL_NICKNAME = '所有人'
const MESSAGE_GROUP_READ_ENABLED = true

export default {
  name: 'ImGroupMessageDetail',
  components: { MessageContentPreview },
  data() {
    return { DICT_TYPE, IM_AT_ALL_USER_ID, IM_AT_ALL_NICKNAME, MESSAGE_GROUP_READ_ENABLED, dialogVisible: false, detail: {}}
  },
  methods: {
    formatDate,
    atNickname(index, userId) {
      return this.detail.atUserNicknames && this.detail.atUserNicknames[index] ? this.detail.atUserNicknames[index] : userId
    },
    formatJson(content) {
      if (!content) return ''
      try {
        return JSON.stringify(JSON.parse(content), null, 2)
      } catch (error) {
        return content
      }
    },
    open(row) {
      this.detail = row
      this.dialogVisible = true
    }
  }
}
</script>

<style scoped>
.secondary { color: #909399; }
.raw-json { padding: 8px; margin: 0; background: #f5f5f5; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; }
</style>
