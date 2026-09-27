<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="私聊消息详情"
    width="700px"
    append-to-body
  >
    <el-descriptions
      :column="2"
      border
    >
      <el-descriptions-item label="编号">{{ detail.id }}</el-descriptions-item>
      <el-descriptions-item label="客户端编号">{{ detail.clientMessageId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="发送人">{{ detail.senderNickname }} ({{ detail.senderId }})</el-descriptions-item>
      <el-descriptions-item label="接收人">{{ detail.receiverNickname }} ({{ detail.receiverId }})</el-descriptions-item>
      <el-descriptions-item label="类型"><dict-tag
        :type="DICT_TYPE.IM_CONTENT_TYPE"
        :value="detail.type"
      /></el-descriptions-item>
      <el-descriptions-item
        v-if="MESSAGE_PRIVATE_READ_ENABLED"
        label="状态"
      ><dict-tag
        :type="DICT_TYPE.IM_MESSAGE_STATUS"
        :value="detail.status"
      /></el-descriptions-item>
      <el-descriptions-item
        v-if="MESSAGE_PRIVATE_READ_ENABLED"
        label="回执"
      ><dict-tag
        :type="DICT_TYPE.IM_MESSAGE_RECEIPT_STATUS"
        :value="detail.receiptStatus"
      /></el-descriptions-item>
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

const MESSAGE_PRIVATE_READ_ENABLED = true

export default {
  name: 'ImPrivateMessageDetail',
  components: { MessageContentPreview },
  data() {
    return { DICT_TYPE, MESSAGE_PRIVATE_READ_ENABLED, dialogVisible: false, detail: {}}
  },
  methods: {
    formatDate,
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
.raw-json { padding: 8px; margin: 0; background: #f5f5f5; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; }
</style>
