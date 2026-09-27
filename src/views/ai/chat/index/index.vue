<template>
  <div class="ai-chat-page">
    <el-container class="ai-chat-shell">
      <conversation-list
        ref="conversationList"
        aria-label="我的对话"
        :active-id="activeConversationId || ''"
        @on-conversation-create="handleConversationCreateSuccess"
        @on-conversation-click="handleConversationClick"
        @on-conversation-clear="handleConversationClear"
        @on-conversation-delete="handlerConversationDelete"
      />

      <el-container class="ai-chat-detail">
        <el-header class="ai-chat-header">
          <div class="ai-chat-header__title">
            {{ activeConversation && activeConversation.title ? activeConversation.title : '对话' }}
            <span v-if="activeMessageList.length">（{{ activeMessageList.length }}）</span>
          </div>
          <div v-if="activeConversation" class="ai-chat-header__actions">
            <el-button type="primary" plain size="mini" @click="openChatConversationUpdateForm">
              {{ activeConversationModelName }}
              <i class="el-icon-setting el-icon--right" />
            </el-button>
            <el-button size="mini" icon="el-icon-delete" title="清空消息" @click="handlerMessageClear" />
            <el-button size="mini" icon="el-icon-download" title="导出对话" @click="downloadConversation" />
            <el-button size="mini" icon="el-icon-top" title="回到顶部" @click="handleGoTopMessage" />
          </div>
        </el-header>

        <el-main class="ai-chat-main">
          <message-loading v-if="activeMessageListLoading" />
          <message-new-conversation
            v-else-if="!activeConversation"
            @on-new-conversation="handleConversationCreate"
          />
          <message-list-empty
            v-else-if="messageList.length === 0"
            @on-prompt="doSendMessage"
          />
          <message-list
            v-else
            ref="messageList"
            :conversation="activeConversation"
            :list="messageList"
            @on-delete-success="handleMessageDelete"
            @on-edit="handleMessageEdit"
            @on-refresh="handleMessageRefresh"
          />
        </el-main>

        <el-footer class="ai-chat-footer">
          <form class="ai-chat-composer" @submit.prevent="handleSendByButton">
            <textarea
              v-model="prompt"
              placeholder="问我任何问题...（Shift+Enter 换行，按下 Enter 发送）"
              @keydown="handleSendByKeydown"
              @input="handlePromptInput"
              @compositionstart="onCompositionstart"
              @compositionend="onCompositionend"
            />
            <div class="ai-chat-composer__actions">
              <div class="ai-chat-composer__options">
                <message-file-upload
                  v-model="uploadFiles"
                  :limit="5"
                  :max-size="10"
                />
                <el-switch v-model="enableContext" />
                <span>上下文</span>
                <el-switch v-model="enableWebSearch" />
                <span>联网搜索</span>
              </div>
              <el-button
                v-if="!conversationInProgress"
                type="primary"
                size="small"
                :disabled="!activeConversation || !prompt.trim()"
                native-type="button"
                @click="handleSendByButton"
              >
                发送
              </el-button>
              <el-button v-else type="danger" size="small" @click="stopStream">停止</el-button>
            </div>
          </form>
        </el-footer>
      </el-container>
    </el-container>

    <conversation-update-form
      ref="conversationUpdateForm"
      @success="handleConversationUpdateSuccess"
    />
  </div>
</template>

<script>
import { ChatConversationApi } from '@/api/ai/chat/conversation'
import { ChatMessageApi } from '@/api/ai/chat/message'
import ConversationList from './components/conversation/ConversationList.vue'
import ConversationUpdateForm from './components/conversation/ConversationUpdateForm.vue'
import MessageFileUpload from './components/message/MessageFileUpload.vue'
import MessageList from './components/message/MessageList.vue'
import MessageListEmpty from './components/message/MessageListEmpty.vue'
import MessageLoading from './components/message/MessageLoading.vue'
import MessageNewConversation from './components/message/MessageNewConversation.vue'

// ConversationList 负责调用 getChatConversationMyList 并维护分组列表。
export default {
  name: 'AiChat',
  components: {
    ConversationList,
    ConversationUpdateForm,
    MessageFileUpload,
    MessageList,
    MessageListEmpty,
    MessageLoading,
    MessageNewConversation
  },
  data() {
    return {
      activeConversationId: null,
      activeConversation: null,
      conversationInProgress: false,
      conversationAbortController: null,
      activeMessageList: [],
      activeMessageListLoading: false,
      activeMessageListLoadingTimer: null,
      prompt: '',
      enableContext: true,
      enableWebSearch: false,
      uploadFiles: [],
      isComposing: false,
      inputTimer: null,
      typewriterTimer: null,
      typewriterRunning: false,
      receiveMessageFullText: '',
      receiveMessageDisplayedText: ''
    }
  },
  computed: {
    activeConversationModelName() {
      if (!this.activeConversation) return '设置模型'
      return this.activeConversation.modelName || this.activeConversation.model || '设置模型'
    },
    messageList() {
      if (this.activeMessageList.length) return this.activeMessageList
      if (!this.activeConversation || !this.activeConversation.systemMessage) return []
      return [{
        id: 0,
        conversationId: this.activeConversation.id || 0,
        type: 'system',
        content: this.activeConversation.systemMessage,
        reasoningContent: '',
        attachmentUrls: [],
        createTime: new Date()
      }]
    }
  },
  async mounted() {
    const queryId = this.$route.query.conversationId
    if (queryId) {
      await this.getConversation(Number(queryId))
      await this.getMessageList()
    }
  },
  beforeDestroy() {
    if (this.activeMessageListLoadingTimer) clearTimeout(this.activeMessageListLoadingTimer)
    if (this.inputTimer) clearTimeout(this.inputTimer)
    if (this.typewriterTimer) clearTimeout(this.typewriterTimer)
    if (this.conversationAbortController) this.conversationAbortController.abort()
  },
  methods: {
    async getConversation(id) {
      if (!id) return
      const response = await ChatConversationApi.getChatConversationMy(id)
      const conversation = response.data
      if (!conversation) return
      this.activeConversation = conversation
      this.activeConversationId = conversation.id
    },
    async handleConversationClick(conversation) {
      if (this.conversationInProgress) {
        this.$alert('对话中，不允许切换！', '提示')
        return false
      }
      this.activeConversationId = conversation.id
      this.activeConversation = conversation
      await this.getMessageList()
      await this.scrollToBottom(true)
      this.prompt = ''
      this.uploadFiles = []
      return true
    },
    handlerConversationDelete(conversation) {
      if (this.activeConversationId === conversation.id) this.handleConversationClear()
    },
    handleConversationClear() {
      if (this.conversationInProgress) {
        this.$alert('对话中，不允许切换！', '提示')
        return false
      }
      this.activeConversationId = null
      this.activeConversation = null
      this.activeMessageList = []
      return true
    },
    openChatConversationUpdateForm() {
      this.$refs.conversationUpdateForm.open(this.activeConversationId)
    },
    async handleConversationUpdateSuccess() {
      await this.getConversation(this.activeConversationId)
      if (this.$refs.conversationList) await this.$refs.conversationList.getChatConversationList()
    },
    handleConversationCreate() {
      return this.$refs.conversationList.createConversation()
    },
    handleConversationCreateSuccess() {
      this.prompt = ''
      this.uploadFiles = []
    },
    async getMessageList() {
      if (this.activeConversationId === null) return
      this.activeMessageListLoadingTimer = setTimeout(() => {
        this.activeMessageListLoading = true
      }, 60)
      try {
        const response = await ChatMessageApi.getChatMessageListByConversationId(
          this.activeConversationId
        )
        this.activeMessageList = response.data
        await this.$nextTick()
        await this.scrollToBottom()
      } finally {
        if (this.activeMessageListLoadingTimer) clearTimeout(this.activeMessageListLoadingTimer)
        this.activeMessageListLoadingTimer = null
        this.activeMessageListLoading = false
      }
    },
    handleMessageDelete() {
      if (this.conversationInProgress) {
        this.$alert('回答中，不能删除！', '提示')
        return
      }
      this.getMessageList()
    },
    async handlerMessageClear() {
      if (!this.activeConversationId) return
      try {
        await this.$modal.confirm('确认清空对话消息？')
        await ChatMessageApi.deleteByConversationId(this.activeConversationId)
        this.activeMessageList = []
      } catch (error) {
        // 用户取消时无需提示
      }
    },
    handleGoTopMessage() {
      if (this.$refs.messageList) this.$refs.messageList.handlerGoTop()
    },
    downloadConversation() {
      if (!this.activeConversation) return
      const lines = this.activeMessageList.map(message => {
        const author = message.type === 'user' ? '我' : 'AI'
        return author + '：\n' + (message.content || '')
      })
      const blob = new Blob([lines.join('\n\n')], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = (this.activeConversation.title || 'AI 对话') + '.txt'
      link.click()
      URL.revokeObjectURL(url)
    },
    handleSendByKeydown(event) {
      if (this.isComposing || event.isComposing || this.conversationInProgress) return
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.doSendMessage(this.prompt.trim())
      }
    },
    handleSendByButton() {
      if (!this.conversationInProgress) this.doSendMessage(this.prompt.trim())
    },
    handlePromptInput(event) {
      if (event.isComposing) return
      if (this.inputTimer) clearTimeout(this.inputTimer)
      this.inputTimer = setTimeout(() => { this.isComposing = false }, 100)
    },
    onCompositionstart() {
      this.isComposing = true
    },
    onCompositionend() {
      setTimeout(() => { this.isComposing = false }, 100)
    },
    async doSendMessage(content) {
      if (!content) {
        this.$message.error('发送失败，原因：内容为空！')
        return
      }
      if (this.activeConversationId === null) {
        this.$message.error('还没创建对话，不能发送!')
        return
      }
      const userMessage = {
        conversationId: this.activeConversationId,
        content,
        attachmentUrls: this.uploadFiles.slice()
      }
      this.prompt = ''
      this.uploadFiles = []
      await this.doSendMessageStream(userMessage)
    },
    async doSendMessageStream(userMessage) {
      this.conversationAbortController = new AbortController()
      this.conversationInProgress = true
      this.receiveMessageFullText = ''
      this.receiveMessageDisplayedText = ''
      this.activeMessageList.push({
        id: -1,
        conversationId: this.activeConversationId,
        type: 'user',
        content: userMessage.content,
        attachmentUrls: userMessage.attachmentUrls || [],
        createTime: new Date()
      })
      this.activeMessageList.push({
        id: -2,
        conversationId: this.activeConversationId,
        type: 'assistant',
        content: '思考中...',
        reasoningContent: '',
        attachmentUrls: [],
        createTime: new Date()
      })
      await this.$nextTick()
      await this.scrollToBottom()
      this.textRoll()

      let firstChunk = true
      try {
        await ChatMessageApi.sendChatMessageStream(
          userMessage.conversationId,
          userMessage.content,
          this.conversationAbortController,
          this.enableContext,
          this.enableWebSearch,
          async event => {
            const { code, data, msg } = JSON.parse(event.data)
            if (code !== 0) {
              this.$alert('对话异常! ' + msg, '提示')
              if (this.receiveMessageFullText === '') {
                this.activeMessageList.pop()
              }
              return
            }
            if (data.receive.content === '' && !data.receive.reasoningContent) return
            if (firstChunk) {
              firstChunk = false
              this.activeMessageList.pop()
              this.activeMessageList.pop()
              this.activeMessageList.push(data.send)
              data.send.attachmentUrls = userMessage.attachmentUrls
              this.activeMessageList.push(data.receive)
            }
            const lastMessage = this.activeMessageList[this.activeMessageList.length - 1]
            if (data.receive.reasoningContent) {
              this.$set(
                lastMessage,
                'reasoningContent',
                (lastMessage.reasoningContent || '') + data.receive.reasoningContent
              )
            }
            if (data.receive.content !== '') this.receiveMessageFullText += data.receive.content
            await this.scrollToBottom()
          },
          error => {
            this.$alert('对话异常！', '提示')
            this.stopStream()
            throw error
          },
          () => { this.stopStream() },
          userMessage.attachmentUrls
        )
      } catch (error) {
        // onError 已提示并抛出异常，禁止流式请求重试
      }
    },
    stopStream() {
      if (this.conversationAbortController) this.conversationAbortController.abort()
      this.conversationAbortController = null
      this.conversationInProgress = false
    },
    handleMessageEdit(message) {
      this.prompt = message.content || ''
    },
    handleMessageRefresh(message) {
      this.doSendMessage(message.content || '')
    },
    async scrollToBottom(ignoreScrollState) {
      await this.$nextTick()
      if (this.$refs.messageList) await this.$refs.messageList.scrollToBottom(ignoreScrollState)
    },
    textRoll() {
      if (this.typewriterRunning) return
      this.typewriterRunning = true
      let index = 0
      const run = async() => {
        if (index < this.receiveMessageFullText.length) {
          this.receiveMessageDisplayedText += this.receiveMessageFullText[index]
          index += 1
          const lastMessage = this.activeMessageList[this.activeMessageList.length - 1]
          if (lastMessage) this.$set(lastMessage, 'content', this.receiveMessageDisplayedText)
          await this.scrollToBottom()
        }
        if (index < this.receiveMessageFullText.length || this.conversationInProgress) {
          const gap = this.receiveMessageFullText.length - index
          const delay = !this.conversationInProgress || gap > 20 ? 10 : (gap > 5 ? 30 : 70)
          this.typewriterTimer = setTimeout(run, delay)
        } else {
          this.typewriterRunning = false
          this.typewriterTimer = null
        }
      }
      this.typewriterTimer = setTimeout(run, 30)
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-page {
  position: relative;
  height: calc(100vh - 84px);
  min-height: 560px;
  overflow: hidden;
  background: #fff;
}

.ai-chat-shell { height: 100%; }

.ai-chat-detail {
  min-width: 0;
  background: #fff;
}

.ai-chat-header {
  display: flex;
  height: 60px !important;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ebeef5;
  background: #f5f7fa;
}

.ai-chat-header__title {
  min-width: 0;
  overflow: hidden;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-chat-header__actions {
  display: flex;
  flex: 0 0 auto;
  margin-left: 15px;
}

.ai-chat-main {
  position: relative;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.ai-chat-footer {
  height: auto !important;
  padding: 0 !important;
}

.ai-chat-composer {
  display: flex;
  flex-direction: column;
  margin: 10px 20px 20px;
  padding: 9px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  background: #fff;

  textarea {
    box-sizing: border-box;
    width: 100%;
    height: 80px;
    padding: 2px;
    resize: none;
    border: 0;
    color: #303133;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    outline: 0;

    &:disabled { color: #c0c4cc; background: #fff; cursor: not-allowed; }
  }
}

.ai-chat-composer__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 5px;
}

.ai-chat-composer__options {
  display: flex;
  align-items: center;
  gap: 8px;

  > span { margin-right: 6px; color: #8f8f8f; font-size: 13px; }
}

@media (max-width: 900px) {
  .ai-chat-page { height: calc(100vh - 50px); }
  .ai-chat-header { padding: 0 10px; }
  .ai-chat-header__actions .el-button:not(:first-child) { display: none; }
  .ai-chat-composer { margin-right: 10px; margin-left: 10px; }
}
</style>
