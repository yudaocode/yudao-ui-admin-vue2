<template>
  <div class="app-container">
    <doc-alert title="WebSocket 实时通信" url="https://doc.iocoder.cn/websocket/" />

    <el-row :gutter="12">
      <el-col :xs="24" :sm="12">
        <el-card shadow="always">
          <div slot="header">连接</div>
          <div class="connection-status">
            <span>连接状态：</span>
            <el-tag :type="isOpen ? 'success' : 'danger'">{{ status }}</el-tag>
          </div>
          <el-divider />
          <div class="connection-input">
            <el-input v-model="server" disabled>
              <template slot="prepend">服务地址</template>
            </el-input>
            <el-button
              :type="isOpen ? 'danger' : 'primary'"
              @click="toggleConnectStatus"
            >
              {{ isOpen ? '关闭连接' : '开启连接' }}
            </el-button>
          </div>

          <p class="section-title">消息输入框</p>
          <el-divider />
          <el-input
            v-model="sendText"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :disabled="!isOpen"
            clearable
            placeholder="请输入你要发送的消息"
            type="textarea"
          />
          <el-select v-model="sendUserId" class="send-user" placeholder="请选择发送人">
            <el-option label="所有人" value="" />
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.nickname"
              :value="user.id"
            />
          </el-select>
          <el-button
            :disabled="!isOpen"
            class="send-button"
            type="primary"
            @click="handlerSend"
          >
            发送
          </el-button>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-card shadow="always">
          <div slot="header">消息记录</div>
          <div class="message-records">
            <ul>
              <li
                v-for="(message, index) in messageReverseList"
                :key="message.time + '-' + index"
              >
                <div class="message-header">
                  <span>收到消息：</span>
                  <span>{{ formatMessageTime(message.time) }}</span>
                </div>
                <div>{{ message.text }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { getRefreshToken } from '@/utils/auth'
import { getSimpleUserList } from '@/api/system/user'

const WEBSOCKET_CONNECTING = 0
const WEBSOCKET_OPEN = 1
const RECONNECT_DELAY = 1000
const HEARTBEAT_INTERVAL = 1000
const PONG_TIMEOUT = 1000

export default {
  name: 'InfraWebSocket',
  data() {
    return {
      server: (process.env.VUE_APP_BASE_API + '/infra/ws').replace('http', 'ws') +
        '?token=' + getRefreshToken(),
      status: 'CLOSED',
      ws: undefined,
      reconnectTimer: undefined,
      heartbeatTimer: undefined,
      pongTimer: undefined,
      shouldReconnect: false,
      sendText: '',
      sendUserId: '',
      userList: [],
      messageList: []
    }
  },
  computed: {
    isOpen() {
      return this.status === 'OPEN'
    },
    messageReverseList() {
      return this.messageList.slice().reverse()
    }
  },
  mounted() {
    this.open()
    return getSimpleUserList().then(response => {
      this.userList = response.data
    })
  },
  beforeDestroy() {
    this.close()
  },
  methods: {
    formatMessageTime(time) {
      return parseTime(time)
    },
    handleWebSocketMessage(data) {
      if (!data) return
      try {
        if (data === 'pong') {
          clearTimeout(this.pongTimer)
          this.pongTimer = undefined
          return
        }

        const jsonMessage = JSON.parse(data)
        const type = jsonMessage.type
        const content = JSON.parse(jsonMessage.content)
        if (!type) {
          this.$modal.msgError('未知的消息类型：' + data)
          return
        }
        if (type === 'demo-message-receive') {
          this.messageList.push({
            text: `【${content.single ? '单发' : '群发'}】用户编号(${content.fromUserId})：${content.text}`,
            time: new Date().getTime()
          })
          return
        }
        if (type === 'notice-push') {
          this.messageList.push({
            text: `【系统通知】：${content.title}`,
            time: new Date().getTime()
          })
          return
        }
        this.$modal.msgError('未处理消息：' + data)
      } catch (error) {
        this.$modal.msgError('处理消息发生异常：' + data)
        console.error(error)
      }
    },
    open() {
      if (!('WebSocket' in window)) {
        this.$modal.msgError('您的浏览器不支持WebSocket')
        return
      }
      this.shouldReconnect = true
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
      this.connectWebSocket()
    },
    connectWebSocket() {
      if (this.ws &&
        (this.ws.readyState === WEBSOCKET_CONNECTING || this.ws.readyState === WEBSOCKET_OPEN)) {
        return
      }
      const socket = new window.WebSocket(this.server)
      this.ws = socket
      this.status = 'CONNECTING'
      socket.onopen = () => {
        if (this.ws !== socket) return
        this.status = 'OPEN'
        this.startHeartbeat()
      }
      socket.onmessage = event => {
        if (this.ws !== socket) return
        clearTimeout(this.pongTimer)
        this.pongTimer = undefined
        this.handleWebSocketMessage(event.data)
      }
      socket.onerror = () => {
        if (this.ws !== socket) return
        socket.close()
      }
      socket.onclose = () => {
        if (this.ws !== socket) return
        this.ws = undefined
        this.status = 'CLOSED'
        this.stopHeartbeat()
        this.scheduleReconnect()
      }
    },
    scheduleReconnect() {
      if (!this.shouldReconnect) return
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = undefined
        this.connectWebSocket()
      }, RECONNECT_DELAY)
    },
    startHeartbeat() {
      this.stopHeartbeat()
      this.heartbeatTimer = setInterval(() => {
        const socket = this.ws
        if (!socket || socket.readyState !== WEBSOCKET_OPEN) return
        socket.send('ping')
        clearTimeout(this.pongTimer)
        this.pongTimer = setTimeout(() => {
          if (this.ws === socket) socket.close()
        }, PONG_TIMEOUT)
      }, HEARTBEAT_INTERVAL)
    },
    stopHeartbeat() {
      clearInterval(this.heartbeatTimer)
      clearTimeout(this.pongTimer)
      this.heartbeatTimer = undefined
      this.pongTimer = undefined
    },
    close() {
      this.shouldReconnect = false
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
      this.stopHeartbeat()
      const socket = this.ws
      this.ws = undefined
      this.status = 'CLOSED'
      if (!socket) return
      socket.onopen = null
      socket.onmessage = null
      socket.onerror = null
      socket.onclose = null
      if (socket.readyState === WEBSOCKET_CONNECTING || socket.readyState === WEBSOCKET_OPEN) {
        socket.close()
      }
    },
    toggleConnectStatus() {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },
    handlerSend() {
      if (!this.ws || this.ws.readyState !== WEBSOCKET_OPEN) return
      const messageContent = JSON.stringify({
        text: this.sendText,
        toUserId: this.sendUserId
      })
      const jsonMessage = JSON.stringify({
        type: 'demo-message-send',
        content: messageContent
      })
      this.ws.send(jsonMessage)
      this.sendText = ''
    }
  }
}
</script>

<style scoped>
.connection-status {
  display: flex;
  gap: 12px;
  align-items: center;
}

.connection-input {
  display: flex;
  gap: 12px;
}

.section-title {
  margin-top: 20px;
  font-size: 16px;
  font-weight: 500;
}

.send-user {
  width: 100%;
  margin-top: 16px;
}

.send-button {
  width: 100%;
  margin-top: 16px;
}

.message-records {
  max-height: 320px;
  overflow: auto;
}

.message-records ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.message-records li + li {
  margin-top: 12px;
}

.message-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.message-header span:first-child {
  font-weight: 500;
  color: #409eff;
}

@media (max-width: 768px) {
  .el-col + .el-col {
    margin-top: 12px;
  }
}
</style>
