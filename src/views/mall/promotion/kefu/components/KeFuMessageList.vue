<template>
  <el-container
    v-if="showKeFuMessageList"
    class="kefu-message-panel"
  >
    <el-header class="kefu-message-header">
      <div class="kefu-title">{{ conversation.userNickname }}</div>
    </el-header>
    <el-main class="kefu-message-content">
      <el-scrollbar
        ref="scrollbar"
        class="message-scrollbar"
      >
        <div
          v-if="refreshContent"
          ref="inner"
          class="message-inner"
        >
          <div
            v-for="(item, index) in getMessageList0"
            :key="item.id"
            class="message-row-wrap"
          >
            <div class="message-meta">
              <div
                v-if="item.contentType !== KeFuMessageContentTypeEnum.SYSTEM && showTime(item, index)"
                class="date-message"
              >
                {{ formatDate(item.createTime) }}
              </div>
              <div
                v-if="item.contentType === KeFuMessageContentTypeEnum.SYSTEM"
                class="system-message"
              >
                {{ item.content }}
              </div>
            </div>
            <div
              :class="getMessageRowClass(item)"
              class="message-row"
            >
              <el-avatar
                v-if="item.senderType === UserTypeEnum.MEMBER"
                :size="60"
                :src="conversation.userAvatar"
                alt="avatar"
              />
              <div
                :class="{ 'kefu-message': KeFuMessageContentTypeEnum.TEXT === item.contentType }"
              >
                <MessageItem :message="item">
                  <template v-if="KeFuMessageContentTypeEnum.TEXT === item.contentType">
                    <div
                      v-dompurify-html="replaceEmoji(getMessageContent(item).text || item.content)"
                      class="text-message"
                    />
                  </template>
                </MessageItem>
                <MessageItem :message="item">
                  <el-image
                    v-if="KeFuMessageContentTypeEnum.IMAGE === item.contentType"
                    :preview-src-list="[getMessageContent(item).picUrl || item.content]"
                    :src="getMessageContent(item).picUrl || item.content"
                    class="image-message"
                    fit="contain"
                  />
                </MessageItem>
                <MessageItem :message="item">
                  <ProductItem
                    v-if="KeFuMessageContentTypeEnum.PRODUCT === item.contentType"
                    :pic-url="getMessageContent(item).picUrl"
                    :price="getMessageContent(item).price"
                    :sales-count="getMessageContent(item).salesCount"
                    :spu-id="getMessageContent(item).spuId"
                    :stock="getMessageContent(item).stock"
                    :title="getMessageContent(item).spuName"
                    class="product-message"
                  />
                </MessageItem>
                <MessageItem :message="item">
                  <OrderItem
                    v-if="KeFuMessageContentTypeEnum.ORDER === item.contentType"
                    :message="item"
                    class="order-message"
                  />
                </MessageItem>
              </div>
              <el-avatar
                v-if="item.senderType === UserTypeEnum.ADMIN"
                :src="item.senderAvatar"
                alt="avatar"
              />
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div
        v-show="showNewMessageTip"
        class="new-message-tip"
        @click="handleToNewMessage"
      >
        <span>有新消息</span>
        <i class="el-icon-bottom" />
      </div>
    </el-main>
    <el-footer class="kefu-message-footer">
      <div class="chat-tools">
        <EmojiSelectPopover @select-emoji="handleEmojiSelect" />
        <PictureSelectUpload
          class="picture-tool"
          @send-picture="handleSendPicture"
        />
      </div>
      <el-input
        v-model="message"
        :rows="6"
        placeholder="输入消息，Enter发送，Shift+Enter换行"
        type="textarea"
        @keyup.enter.native.prevent="handleSendMessage"
      />
    </el-footer>
  </el-container>
  <el-container
    v-else
    class="kefu-message-panel"
  >
    <el-main>
      <el-empty description="请选择左侧的一个会话后开始" />
    </el-main>
  </el-container>
</template>

<script>
import { KeFuMessageApi } from '@/api/mall/promotion/kefu/message'
import EmojiSelectPopover from './tools/EmojiSelectPopover.vue'
import PictureSelectUpload from './tools/PictureSelectUpload.vue'
import ProductItem from './message/ProductItem.vue'
import OrderItem from './message/OrderItem.vue'
import MessageItem from './message/MessageItem.vue'
import { replaceEmoji } from './tools/emoji'
import { KeFuMessageContentTypeEnum } from './tools/constants'
import { UserTypeEnum } from '@/utils/constants'
import { debounce, isEmpty, jsonParse } from '@/utils'
import { formatDate, relativeTimeKey } from '@/utils/formatTime'

export default {
  name: 'KeFuMessageList',
  components: {
    EmojiSelectPopover,
    PictureSelectUpload,
    ProductItem,
    OrderItem,
    MessageItem
  },
  data() {
    return {
      UserTypeEnum,
      KeFuMessageContentTypeEnum,
      message: '',
      messageList: [],
      conversation: {},
      showNewMessageTip: false,
      queryParams: {
        conversationId: 0,
        createTime: undefined
      },
      total: 0,
      refreshContent: false,
      skipGetMessageList: false,
      loadHistory: false,
      scrollWrap: undefined
    }
  },
  computed: {
    getMessageList0() {
      return this.messageList.slice().sort((a, b) => a.createTime - b.createTime)
    },
    showKeFuMessageList() {
      return !isEmpty(this.conversation)
    }
  },
  created() {
    this.handleScroll = debounce(this.handleScroll, 200)
  },
  beforeDestroy() {
    this.unbindScroll()
  },
  methods: {
    getMessageContent(item) {
      return jsonParse(item.content)
    },
    async getMessageList() {
      const response = await KeFuMessageApi.getKeFuMessageList(this.queryParams)
      const result = response.data
      if (isEmpty(result)) {
        this.skipGetMessageList = true
        return
      }
      this.queryParams.createTime = formatDate(result[result.length - 1].createTime)
      if (!this.queryParams.createTime) {
        this.messageList = result
      } else {
        result.forEach(item => this.pushMessage(item))
      }
      this.refreshContent = true
    },
    pushMessage(message) {
      if (this.messageList.some(item => item.id === message.id)) return
      this.messageList.push(message)
    },
    async refreshMessageList(message) {
      if (!this.conversation) return
      if (typeof message !== 'undefined') {
        if (message.conversationId !== this.conversation.id) return
        this.pushMessage(message)
      } else {
        this.queryParams.createTime = undefined
        await this.getMessageList()
      }
      if (this.loadHistory) {
        this.showNewMessageTip = true
      } else {
        await this.handleToNewMessage()
      }
    },
    async getNewMessageList(conversation) {
      await this.$store.dispatch('mallKefu/saveMessageList', {
        conversationId: this.conversation.id,
        messageList: this.messageList
      })
      this.messageList = this.$store.getters['mallKefu/getConversationMessageList'](
        conversation.id
      ) || []
      this.total = this.messageList.length || 0
      this.loadHistory = false
      this.refreshContent = false
      this.skipGetMessageList = false
      this.conversation = conversation
      this.queryParams.conversationId = conversation.id
      this.queryParams.createTime = undefined
      await this.$nextTick()
      this.bindScroll()
      await this.refreshMessageList()
    },
    handleEmojiSelect(item) {
      this.message += item.name
    },
    async handleSendPicture(picUrl) {
      await this.sendMessage({
        conversationId: this.conversation.id,
        contentType: KeFuMessageContentTypeEnum.IMAGE,
        content: JSON.stringify({ picUrl })
      })
    },
    async handleSendMessage(event) {
      if (event.shiftKey) return
      if (isEmpty(this.message.trim())) {
        this.$modal.notifyWarning('请输入消息后再发送哦！')
        this.message = ''
        return
      }
      await this.sendMessage({
        conversationId: this.conversation.id,
        contentType: KeFuMessageContentTypeEnum.TEXT,
        content: JSON.stringify({ text: this.message })
      })
    },
    async sendMessage(message) {
      await KeFuMessageApi.sendKeFuMessage(message)
      this.message = ''
      await this.refreshMessageList()
      await this.$store.dispatch('mallKefu/updateConversation', this.conversation.id)
    },
    async scrollToBottom() {
      if (this.loadHistory) return
      await this.$nextTick()
      this.$refs.scrollbar.wrap.scrollTop = this.$refs.inner.clientHeight
      this.showNewMessageTip = false
      await KeFuMessageApi.updateKeFuMessageReadStatus(this.conversation.id)
    },
    async handleToNewMessage() {
      this.loadHistory = false
      await this.scrollToBottom()
    },
    handleScroll(event) {
      if (this.skipGetMessageList) return
      const wrap = event.target
      if (Math.floor(wrap.scrollTop) === 0) this.handleOldMessage()
      if (Math.abs(wrap.scrollHeight - wrap.clientHeight - wrap.scrollTop) < 1) {
        this.loadHistory = false
        this.refreshMessageList()
      }
    },
    async handleOldMessage() {
      const oldPageHeight = this.$refs.inner && this.$refs.inner.clientHeight
      if (!oldPageHeight) return
      this.loadHistory = true
      await this.getMessageList()
      this.$refs.scrollbar.wrap.scrollTop = this.$refs.inner.clientHeight - oldPageHeight
    },
    showTime(item, index) {
      const sortedMessageList = this.getMessageList0
      if (sortedMessageList[index + 1]) {
        const now = Date.now()
        return relativeTimeKey(sortedMessageList[index + 1].createTime, now) !==
          relativeTimeKey(item.createTime, now)
      }
      return false
    },
    getMessageRowClass(item) {
      if (item.senderType === UserTypeEnum.MEMBER) return 'ss-row-left'
      if (item.senderType === UserTypeEnum.ADMIN) return 'ss-row-right'
      return ''
    },
    bindScroll() {
      this.unbindScroll()
      this.scrollWrap = this.$refs.scrollbar && this.$refs.scrollbar.wrap
      if (this.scrollWrap) this.scrollWrap.addEventListener('scroll', this.handleScroll)
    },
    unbindScroll() {
      if (this.scrollWrap) this.scrollWrap.removeEventListener('scroll', this.handleScroll)
      this.scrollWrap = undefined
    },
    replaceEmoji,
    formatDate
  }
}
</script>

<style lang="scss" scoped>
.kefu-message-panel {
  position: relative;
  width: calc(100% - 560px);
  background-color: #fff;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    background-color: #dcdfe6;
    content: '';
    transform: scaleX(0.3);
  }
}

.kefu-message-header {
  position: relative;
  display: flex;
  background-color: #fff;
  align-items: center;
  justify-content: space-between;

  &::before {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #dcdfe6;
    content: '';
    transform: scaleY(0.3);
  }
}

.kefu-title {
  font-size: 18px;
  font-weight: bold;
}

.kefu-message-content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 10px;
  margin: 0;
  overflow: visible;
}

.message-scrollbar,
.message-inner,
.message-row-wrap {
  width: 100%;
}

.message-scrollbar {
  height: 100%;
}

::v-deep .message-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden;
}

.message-inner {
  padding: 0 10px;
  box-sizing: border-box;
}

.message-meta {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
}

.message-row {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
}

.ss-row-left {
  justify-content: flex-start;

  .kefu-message {
    margin-top: 3px;
    margin-left: 10px;
    background-color: #fff;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
  }
}

.ss-row-right {
  justify-content: flex-end;

  .kefu-message {
    margin-top: 3px;
    margin-right: 10px;
    background-color: rgb(206 223 255);
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    border-top-left-radius: 10px;
  }
}

.kefu-message {
  width: auto;
  max-width: 50%;
  padding: 5px 10px;
  font-weight: 500;
  color: #414141;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.03);
  }
}

.text-message {
  width: 100%;
  line-height: normal;
  text-align: justify;
}

.image-message {
  width: 200px;
  margin: 0 10px;
}

.product-message {
  max-width: 300px;
  margin: 0 10px;
}

.order-message {
  max-width: 100%;
  margin: 0 10px;
}

.date-message,
.system-message {
  width: fit-content;
  padding: 0 5px;
  font-size: 10px;
  color: #fff;
  background-color: rgb(0 0 0 / 10%);
  border-radius: 8px;
}

.new-message-tip {
  position: absolute;
  right: 35px;
  bottom: 35px;
  display: flex;
  padding: 10px;
  font-size: 12px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  align-items: center;

  i {
    margin-left: 5px;
  }
}

.kefu-message-footer {
  position: relative;
  display: flex;
  height: auto !important;
  padding: 0;
  margin: 0;
  flex-direction: column;

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #dcdfe6;
    content: '';
    transform: scaleY(0.3);
  }
}

.chat-tools {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
}

.picture-tool {
  margin-top: 3px;
  margin-left: 15px;
  cursor: pointer;
}

::v-deep .el-textarea__inner {
  background-color: #fff;
  border: none;
  border-radius: 0;
  box-shadow: none !important;
  resize: none;
}
</style>
