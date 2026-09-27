<template>
  <el-container class="kefu-layout">
    <KeFuConversationList
      ref="keFuConversation"
      @change="handleChange"
    />
    <KeFuMessageList ref="keFuChatBox" />
    <MemberInfo ref="memberInfo" />
  </el-container>
</template>

<script>
import { KeFuConversationList, KeFuMessageList, MemberInfo } from './components'
import { WebSocketMessageTypeConstants } from './components/tools/constants'
import { getRefreshToken } from '@/utils/auth'

export default {
  name: 'KeFu',
  components: { KeFuConversationList, KeFuMessageList, MemberInfo },
  data() {
    return {
      server: (process.env.VUE_APP_BASE_API + '/infra/ws').replace('http', 'ws') +
        '?token=' + getRefreshToken(),
      socket: undefined,
      reconnectTimer: undefined,
      heartbeatTimer: undefined,
      pongTimer: undefined,
      shouldReconnect: false
    }
  },
  mounted() {
    const conversationPromise = this.$store.dispatch('mallKefu/setConversationList')
      .then(() => {
        if (this.$refs.keFuConversation) {
          this.$refs.keFuConversation.calculationLastMessageTime()
        }
      })
    this.openWebSocket()
    return conversationPromise
  },
  beforeDestroy() {
    this.closeWebSocket()
  },
  methods: {
    handleChange(conversation) {
      if (this.$refs.keFuChatBox) this.$refs.keFuChatBox.getNewMessageList(conversation)
      if (this.$refs.memberInfo) this.$refs.memberInfo.initHistory(conversation)
    },
    handleWebSocketMessage(newData) {
      if (!newData) return
      try {
        if (newData === 'pong') {
          clearTimeout(this.pongTimer)
          this.pongTimer = undefined
          return
        }
        const jsonMessage = JSON.parse(newData)
        const type = jsonMessage.type
        if (!type) {
          this.$modal.msgError('未知的消息类型：' + newData)
          return
        }
        if (type === WebSocketMessageTypeConstants.KEFU_MESSAGE_TYPE) {
          const message = JSON.parse(jsonMessage.content)
          this.$store.dispatch('mallKefu/updateConversation', message.conversationId)
          if (this.$refs.keFuChatBox) this.$refs.keFuChatBox.refreshMessageList(message)
          return
        }
        if (type === WebSocketMessageTypeConstants.KEFU_MESSAGE_ADMIN_READ) {
          const message = JSON.parse(jsonMessage.content)
          this.$store.dispatch('mallKefu/updateConversationStatus', message.conversationId)
        }
      } catch (error) {
        console.error(error)
      }
    },
    openWebSocket() {
      this.shouldReconnect = true
      this.connectWebSocket()
    },
    connectWebSocket() {
      if (this.socket && (this.socket.readyState === 0 || this.socket.readyState === 1)) return
      const socket = new WebSocket(this.server)
      this.socket = socket
      socket.onopen = () => this.startHeartbeat()
      socket.onmessage = event => {
        // VueUse 会在收到任意消息时重置心跳超时；Vue2 原生 WebSocket 保持相同行为。
        clearTimeout(this.pongTimer)
        this.pongTimer = undefined
        this.handleWebSocketMessage(event.data)
      }
      socket.onclose = () => {
        this.stopHeartbeat()
        if (this.shouldReconnect) {
          clearTimeout(this.reconnectTimer)
          this.reconnectTimer = setTimeout(this.connectWebSocket, 1000)
        }
      }
    },
    startHeartbeat() {
      this.stopHeartbeat()
      this.heartbeatTimer = setInterval(() => {
        if (!this.socket || this.socket.readyState !== 1) return
        this.socket.send('ping')
        clearTimeout(this.pongTimer)
        this.pongTimer = setTimeout(() => {
          if (this.socket) this.socket.close()
        }, 1000)
      }, 1000)
    },
    stopHeartbeat() {
      clearInterval(this.heartbeatTimer)
      clearTimeout(this.pongTimer)
      this.heartbeatTimer = undefined
      this.pongTimer = undefined
    },
    closeWebSocket() {
      this.shouldReconnect = false
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
      this.stopHeartbeat()
      if (this.socket) this.socket.close()
      this.socket = undefined
    }
  }
}
</script>

<style lang="scss">
.kefu-layout {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  flex: 1;
}

::-webkit-scrollbar {
  width: 10px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: inset 0 0 0 rgb(240 240 240 / 50%);
}

::-webkit-scrollbar-thumb {
  background-color: rgb(240 240 240 / 50%);
  border-radius: 10px;
  box-shadow: inset 0 0 0 rgb(240 240 240 / 50%);
}
</style>
