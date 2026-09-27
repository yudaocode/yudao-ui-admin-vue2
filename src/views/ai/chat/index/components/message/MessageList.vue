<template>
  <div class="message-list-wrap">
    <div ref="messageContainer" class="message-list" @scroll="handleScroll">
      <div
        v-for="(item, index) in list"
        :key="item.id + '-' + index"
        class="message-row"
        :class="{ 'message-row--user': isUserMessage(item) }"
      >
        <template v-if="!isUserMessage(item)">
          <el-avatar :size="38" :src="roleAvatar" />
          <div class="message-column message-column--assistant">
            <span class="message-time">{{ formatDate(item.createTime) }}</span>
            <div class="message-bubble message-bubble--assistant">
              <message-reasoning
                :reasoning-content="item.reasoningContent || ''"
                :content="item.content || ''"
              />
              <markdown-view class="message-content" :content="item.content || ''" />
              <message-files :attachment-urls="item.attachmentUrls" />
              <message-knowledge v-if="item.segments && item.segments.length" :segments="item.segments" />
              <message-web-search
                v-if="item.webSearchPages && item.webSearchPages.length"
                :web-search-pages="item.webSearchPages"
              />
            </div>
            <div class="message-tools">
              <el-button type="text" icon="el-icon-document-copy" title="复制" @click="copyContent(item.content)" />
              <el-button
                v-if="item.id > 0"
                type="text"
                icon="el-icon-delete"
                title="删除"
                @click="deleteMessage(item.id)"
              />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="message-column message-column--user">
            <span class="message-time">{{ formatDate(item.createTime) }}</span>
            <message-files
              v-if="item.attachmentUrls && item.attachmentUrls.length"
              class="message-files--user"
              :attachment-urls="item.attachmentUrls"
            />
            <div v-if="item.content && item.content.trim()" class="message-bubble message-bubble--user">
              {{ item.content }}
            </div>
            <div class="message-tools message-tools--user">
              <el-button type="text" icon="el-icon-edit" title="编辑" @click="$emit('on-edit', item)" />
              <el-button type="text" icon="el-icon-refresh-right" title="重新生成" @click="$emit('on-refresh', item)" />
              <el-button
                v-if="item.id > 0"
                type="text"
                icon="el-icon-delete"
                title="删除"
                @click="deleteMessage(item.id)"
              />
              <el-button type="text" icon="el-icon-document-copy" title="复制" @click="copyContent(item.content)" />
            </div>
          </div>
          <el-avatar :size="38" :src="userAvatar" />
        </template>
      </div>
    </div>
    <el-button
      v-if="isScrolling"
      class="message-list__to-bottom"
      circle
      icon="el-icon-bottom"
      title="回到底部"
      @click="handleGoBottom"
    />
  </div>
</template>

<script>
import { ChatMessageApi } from '@/api/ai/chat/message'
import MarkdownView from '@/components/MarkdownView/index.vue'
import MessageFiles from './MessageFiles.vue'
import MessageKnowledge from './MessageKnowledge.vue'
import MessageReasoning from './MessageReasoning.vue'
import MessageWebSearch from './MessageWebSearch.vue'

export default {
  name: 'MessageList',
  components: { MarkdownView, MessageFiles, MessageKnowledge, MessageReasoning, MessageWebSearch },
  props: {
    conversation: {
      type: Object,
      required: true
    },
    list: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isScrolling: false,
      defaultAvatar: require('@/assets/images/profile.jpg')
    }
  },
  computed: {
    userAvatar() {
      return (this.$store.state.user && this.$store.state.user.avatar) || this.defaultAvatar
    },
    roleAvatar() {
      return this.conversation.roleAvatar || this.defaultAvatar
    }
  },
  methods: {
    isUserMessage(message) {
      return message.type === 'user'
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      const pad = number => String(number).padStart(2, '0')
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
        ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
    },
    async scrollToBottom(ignoreScrollState) {
      await this.$nextTick()
      const container = this.$refs.messageContainer
      if (container && (ignoreScrollState || !this.isScrolling)) {
        container.scrollTop = container.scrollHeight - container.clientHeight
      }
    },
    handleScroll() {
      const container = this.$refs.messageContainer
      if (!container) return
      this.isScrolling = container.scrollTop + container.clientHeight < container.scrollHeight - 100
    },
    handleGoBottom() {
      const container = this.$refs.messageContainer
      if (container) container.scrollTop = container.scrollHeight
    },
    handlerGoTop() {
      const container = this.$refs.messageContainer
      if (container) container.scrollTop = 0
    },
    async copyContent(content) {
      const text = content || ''
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text)
        else {
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }
        this.$message.success('复制成功！')
      } catch (error) {
        this.$message.error('复制失败，请手动复制')
      }
    },
    async deleteMessage(id) {
      await ChatMessageApi.deleteChatMessage(id)
      this.$modal.msgSuccess('删除成功！')
      this.$emit('on-delete-success')
    }
  }
}
</script>

<style lang="scss" scoped>
.message-list-wrap {
  position: relative;
  height: 100%;
}

.message-list {
  height: 100%;
  padding: 8px 20px 30px;
  overflow-y: auto;
}

.message-row {
  display: flex;
  align-items: flex-start;
  margin-top: 34px;

}

.message-row--user { justify-content: flex-end; }

.message-column {
  display: flex;
  max-width: min(760px, 78%);
  flex-direction: column;
  margin: 0 14px;
}

.message-column--user { align-items: flex-end; }
.message-time { margin-bottom: 5px; color: #909399; font-size: 12px; }

.message-bubble {
  max-width: 100%;
  padding: 10px;
  border-radius: 10px;
  word-break: break-word;
}

.message-bubble--assistant {
  border: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.message-bubble--user {
  color: #fff;
  background: #409eff;
  white-space: pre-wrap;
}

.message-content {
  color: #303133;
  font-size: 14px;
  line-height: 1.7;
}

.message-tools {
  display: flex;
  margin-top: 4px;

  .el-button + .el-button { margin-left: 4px; }
}

.message-tools--user { flex-direction: row; }
.message-files--user { justify-content: flex-end; margin-bottom: 8px; }

.message-list__to-bottom {
  position: absolute;
  z-index: 2;
  right: 50%;
  bottom: 12px;
}

@media (max-width: 900px) {
  .message-list { padding-right: 10px; padding-left: 10px; }
  .message-column { max-width: 84%; margin: 0 8px; }
}
</style>
