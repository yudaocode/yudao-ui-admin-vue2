<template>
  <el-aside
    class="kefu-conversation-panel"
    width="260px"
  >
    <div class="conversation-count">会话记录({{ conversationList.length }})</div>
    <div
      v-for="item in conversationList"
      :key="item.id"
      :class="{ active: item.id === activeConversationId, pinned: item.adminPinned }"
      class="kefu-conversation"
      @click="openRightMessage(item)"
      @contextmenu.prevent="rightClick($event, item)"
    >
      <div class="conversation-avatar">
        <el-badge
          :hidden="item.adminUnreadMessageCount === 0"
          :max="99"
          :value="item.adminUnreadMessageCount"
        >
          <el-avatar
            :src="item.userAvatar"
            alt="avatar"
          />
        </el-badge>
      </div>
      <div class="conversation-content">
        <div class="conversation-header">
          <span class="username">{{ item.userNickname }}</span>
          <span class="last-time">{{ lastMessageTimeMap[item.id] || '计算中' }}</span>
        </div>
        <div
          v-dompurify-html="getConversationDisplayText(item.lastMessageContentType, item.lastMessageContent)"
          class="last-message"
        />
      </div>
    </div>

    <ul
      v-show="showRightMenu"
      :style="rightMenuStyle"
      class="right-menu-ul"
    >
      <li
        v-show="!rightClickConversation.adminPinned"
        @click.stop="updateConversationPinned(true)"
      >
        <i class="el-icon-top" />
        置顶会话
      </li>
      <li
        v-show="rightClickConversation.adminPinned"
        @click.stop="updateConversationPinned(false)"
      >
        <i class="el-icon-bottom" />
        取消置顶
      </li>
      <li @click.stop="deleteConversation">
        <i class="el-icon-delete danger-icon" />
        删除会话
      </li>
      <li @click.stop="closeRightMenu">
        <i class="el-icon-close danger-icon" />
        取消
      </li>
    </ul>
  </el-aside>
</template>

<script>
import { KeFuConversationApi } from '@/api/mall/promotion/kefu/conversation'
import { formatPast } from '@/utils/formatTime'
import { jsonParse } from '@/utils'
import { KeFuMessageContentTypeEnum } from './tools/constants'
import { replaceEmoji } from './tools/emoji'

export default {
  name: 'KeFuConversationList',
  data() {
    return {
      activeConversationId: -1,
      lastMessageTimeMap: {},
      showRightMenu: false,
      rightMenuStyle: {},
      rightClickConversation: {},
      timer: undefined
    }
  },
  computed: {
    conversationList() {
      return this.$store.getters['mallKefu/getConversationList']
    },
    collapse() {
      return !this.$store.getters.sidebar.opened
    }
  },
  watch: {
    showRightMenu(value) {
      if (value) {
        document.body.addEventListener('click', this.closeRightMenu)
      } else {
        document.body.removeEventListener('click', this.closeRightMenu)
      }
    }
  },
  mounted() {
    this.timer = setInterval(this.calculationLastMessageTime, 1000 * 10)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    document.body.removeEventListener('click', this.closeRightMenu)
  },
  methods: {
    calculationLastMessageTime() {
      this.conversationList.forEach(item => {
        this.$set(this.lastMessageTimeMap, item.id, formatPast(item.lastMessageTime, 'YYYY-MM-DD'))
      })
    },
    openRightMessage(item) {
      if (this.activeConversationId === item.id) return
      this.activeConversationId = item.id
      this.$emit('change', item)
    },
    getConversationDisplayText(contentType, content) {
      switch (contentType) {
        case KeFuMessageContentTypeEnum.SYSTEM:
          return '[系统消息]'
        case KeFuMessageContentTypeEnum.VIDEO:
          return '[视频消息]'
        case KeFuMessageContentTypeEnum.IMAGE:
          return '[图片消息]'
        case KeFuMessageContentTypeEnum.PRODUCT:
          return '[商品消息]'
        case KeFuMessageContentTypeEnum.ORDER:
          return '[订单消息]'
        case KeFuMessageContentTypeEnum.VOICE:
          return '[语音消息]'
        case KeFuMessageContentTypeEnum.TEXT: {
          const parsed = jsonParse(content)
          return replaceEmoji(parsed.text || content)
        }
        default:
          return ''
      }
    },
    rightClick(mouseEvent, item) {
      this.rightClickConversation = item
      this.showRightMenu = true
      this.rightMenuStyle = {
        top: mouseEvent.clientY - 110 + 'px',
        left: this.collapse ? mouseEvent.clientX - 80 + 'px' : mouseEvent.clientX - 210 + 'px'
      }
    },
    closeRightMenu() {
      this.showRightMenu = false
    },
    async updateConversationPinned(adminPinned) {
      await KeFuConversationApi.updateConversationPinned({
        id: this.rightClickConversation.id,
        adminPinned
      })
      this.$modal.notifySuccess(adminPinned ? '置顶成功' : '取消置顶成功')
      this.closeRightMenu()
      await this.$store.dispatch('mallKefu/updateConversation', this.rightClickConversation.id)
    },
    async deleteConversation() {
      await this.$modal.confirm('您确定要删除该会话吗？')
      await KeFuConversationApi.deleteConversation(this.rightClickConversation.id)
      this.closeRightMenu()
      await this.$store.dispatch('mallKefu/deleteConversation', this.rightClickConversation.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.kefu-conversation-panel {
  position: relative;
  height: 100%;
  padding-top: 5px;
  background-color: #fff;
}

.conversation-count {
  margin: 10px 0;
  font-weight: bold;
  color: #999;
}

.kefu-conversation {
  display: flex;
  height: 60px;
  padding: 0 10px;
  cursor: pointer;
  align-items: center;

  &.active {
    background-color: rgb(128 128 128 / 50%);
  }
}

.conversation-avatar {
  display: flex;
  width: 50px;
  height: 50px;
  flex: 0 0 50px;
  align-items: center;
  justify-content: center;
}

.conversation-content {
  width: calc(100% - 60px);
  margin-left: 10px;
}

.conversation-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.username {
  max-width: 60%;
  min-width: 0;
}

.last-time,
.last-message {
  font-size: 13px;
  color: #999;
}

.last-message,
.username {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.right-menu-ul {
  position: absolute;
  z-index: 20;
  width: 130px;
  padding: 5px;
  margin: 0;
  list-style-type: none;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);

  li {
    display: flex;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 12px;
    transition: background-color 0.3s;
    align-items: center;

    &:hover {
      background-color: #f5f7fa;
    }

    i {
      margin-right: 5px;
    }
  }
}

.danger-icon {
  color: red;
}
</style>
