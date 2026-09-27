<template>
  <el-aside width="260px" class="conversation-list">
    <div class="conversation-list__main">
      <el-button class="conversation-list__create" type="primary" @click="createConversation">
        <i class="el-icon-plus" />
        新建对话
      </el-button>

      <el-input
        v-model="searchName"
        class="conversation-list__search"
        clearable
        placeholder="搜索历史记录"
        prefix-icon="el-icon-search"
        @input="searchConversation"
      />

      <div class="conversation-list__scroll" v-loading="loading">
        <el-empty
          v-if="!loading && conversationList.length === 0"
          description="暂无对话"
          :image-size="64"
        />
        <template v-for="groupName in groupNames">
          <section
            v-if="conversationMap[groupName] && conversationMap[groupName].length"
            :key="groupName"
            class="conversation-group"
          >
            <div class="conversation-group__title">{{ groupName }}</div>
            <div
              v-for="conversation in conversationMap[groupName]"
              :key="conversation.id"
              class="conversation-item"
              :class="{ 'is-active': conversation.id === activeConversationId }"
              @click="handleConversationClick(conversation.id)"
              @mouseenter="hoverConversationId = conversation.id"
              @mouseleave="hoverConversationId = null"
            >
              <div class="conversation-item__content">
                <el-avatar
                  :size="26"
                  shape="square"
                  :src="conversation.roleAvatar || roleAvatarDefaultImg"
                />
                <span class="conversation-item__title">
                  {{ conversation.title || '未命名对话' }}
                </span>
              </div>
              <div
                v-show="hoverConversationId === conversation.id"
                class="conversation-item__actions"
              >
                <el-button
                  type="text"
                  :icon="conversation.pinned ? 'el-icon-bottom' : 'el-icon-top'"
                  :title="conversation.pinned ? '取消置顶' : '置顶'"
                  @click.stop="handleTop(conversation)"
                />
                <el-button
                  type="text"
                  icon="el-icon-edit"
                  title="编辑"
                  @click.stop="updateConversationTitle(conversation)"
                />
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  title="删除对话"
                  @click.stop="deleteChatConversation(conversation)"
                />
              </div>
            </div>
          </section>
        </template>
      </div>
    </div>

    <div class="conversation-list__toolbar">
      <button type="button" @click="handleRoleRepository">
        <i class="el-icon-user" />
        角色仓库
      </button>
      <button type="button" @click="handleClearConversation">
        <i class="el-icon-delete" />
        清空未置顶对话
      </button>
    </div>

    <el-drawer
      title="角色仓库"
      :visible.sync="roleRepositoryOpen"
      size="754px"
      append-to-body
    >
      <role-repository />
    </el-drawer>
  </el-aside>
</template>

<script>
import { ChatConversationApi } from '@/api/ai/chat/conversation'
import RoleRepository from '../role/RoleRepository.vue'

export default {
  name: 'AiChatConversationList',
  components: { RoleRepository },
  props: {
    activeId: {
      type: [Number, String],
      default: ''
    }
  },
  data() {
    return {
      searchName: '',
      activeConversationId: null,
      hoverConversationId: null,
      conversationList: [],
      conversationMap: {},
      groupNames: ['置顶', '今天', '一天前', '三天前', '七天前', '三十天前'],
      loading: false,
      loadingTimer: null,
      roleRepositoryOpen: false,
      roleAvatarDefaultImg: require('@/assets/images/profile.jpg')
    }
  },
  watch: {
    activeId: {
      immediate: true,
      handler(value) {
        this.activeConversationId = value ? Number(value) : null
      }
    }
  },
  mounted() {
    this.getChatConversationList().then(() => {
      if (!this.activeConversationId && this.conversationList.length) {
        this.handleConversationClick(this.conversationList[0].id)
      }
    })
  },
  beforeDestroy() {
    if (this.loadingTimer) clearTimeout(this.loadingTimer)
  },
  methods: {
    searchConversation() {
      const keyword = this.searchName.trim()
      const list = keyword
        ? this.conversationList.filter(item => (item.title || '').includes(keyword))
        : this.conversationList
      this.conversationMap = this.getConversationGroupByCreateTime(list)
    },
    handleConversationClick(id) {
      const conversation = this.conversationList.find(item => item.id === id)
      if (!conversation) return false
      this.$emit('on-conversation-click', conversation)
      this.activeConversationId = id
      return true
    },
    async getChatConversationList() {
      this.loadingTimer = setTimeout(() => { this.loading = true }, 50)
      try {
        this.conversationList = (await ChatConversationApi.getChatConversationMyList()).data
        this.conversationList.sort((a, b) => this.getCreateTime(b) - this.getCreateTime(a))
        if (this.conversationList.length === 0) {
          this.activeConversationId = null
          this.conversationMap = {}
          return
        }
        this.searchConversation()
      } finally {
        if (this.loadingTimer) clearTimeout(this.loadingTimer)
        this.loadingTimer = null
        this.loading = false
      }
    },
    getCreateTime(conversation) {
      const value = conversation && conversation.createTime
      if (typeof value === 'number') return value
      const time = new Date(value || 0).getTime()
      return Number.isNaN(time) ? 0 : time
    },
    getConversationGroupByCreateTime(list) {
      const groups = this.groupNames.reduce((result, name) => {
        result[name] = []
        return result
      }, {})
      const now = Date.now()
      const day = 24 * 60 * 60 * 1000
      list.forEach(conversation => {
        if (conversation.pinned) groups['置顶'].push(conversation)
        else {
          const diff = Math.max(0, now - this.getCreateTime(conversation))
          if (diff < day) groups['今天'].push(conversation)
          else if (diff < 3 * day) groups['一天前'].push(conversation)
          else if (diff < 7 * day) groups['三天前'].push(conversation)
          else if (diff < 30 * day) groups['七天前'].push(conversation)
          else groups['三十天前'].push(conversation)
        }
      })
      return groups
    },
    async createConversation() {
      const conversationId = (await ChatConversationApi.createChatConversationMy({})).data
      await this.getChatConversationList()
      await this.handleConversationClick(conversationId)
      this.$emit('on-conversation-create')
    },
    async updateConversationTitle(conversation) {
      const result = await this.$prompt('修改标题', '提示', {
        inputPattern: /^[\s\S]*.*\S[\s\S]*$/,
        inputErrorMessage: '标题不能为空',
        inputValue: conversation.title
      })
      await ChatConversationApi.updateChatConversationMy({ id: conversation.id, title: result.value })
      this.$modal.msgSuccess('重命名成功')
      await this.getChatConversationList()
      const activeConversation = this.conversationList.find(item => item.id === conversation.id)
      if (activeConversation && this.activeConversationId === activeConversation.id) {
        this.$emit('on-conversation-click', activeConversation)
      }
    },
    async deleteChatConversation(conversation) {
      try {
        await this.$modal.confirm('是否确认删除对话“' + (conversation.title || conversation.id) + '”？')
        await ChatConversationApi.deleteChatConversationMy(conversation.id)
        this.$modal.msgSuccess('对话已删除')
        await this.getChatConversationList()
        this.$emit('on-conversation-delete', conversation)
      } catch (error) {
        // 用户取消时无需提示
      }
    },
    async handleClearConversation() {
      try {
        await this.$modal.confirm('确认后对话会全部清空，置顶的对话除外。')
        await ChatConversationApi.deleteChatConversationMyByUnpinned()
        this.$modal.msgSuccess('操作成功')
        this.activeConversationId = null
        await this.getChatConversationList()
        this.$emit('on-conversation-clear')
      } catch (error) {
        // 用户取消时无需提示
      }
    },
    async handleTop(conversation) {
      conversation.pinned = !conversation.pinned
      await ChatConversationApi.updateChatConversationMy(conversation)
      await this.getChatConversationList()
    },
    handleRoleRepository() {
      this.roleRepositoryOpen = true
    }
  }
}
</script>

<style lang="scss" scoped>
.conversation-list {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 10px 0;
  overflow: hidden;
  border-right: 1px solid #ebeef5;
  background: #fff;
}

.conversation-list__main {
  min-height: 0;
  flex: 1;
}

.conversation-list__create {
  width: 100%;
  padding-top: 14px;
  padding-bottom: 14px;
}

.conversation-list__search {
  margin-top: 14px;
}

.conversation-list__scroll {
  height: calc(100% - 116px);
  padding: 2px 0 110px;
  overflow-y: auto;
}

.conversation-group__title {
  padding: 14px 5px 5px;
  color: #909399;
  font-size: 12px;
  font-weight: 600;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  margin: 4px 0;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;

  &:hover,
  &.is-active {
    border-color: #c6e2ff;
    background: #ecf5ff;
  }
}

.conversation-item__content {
  display: flex;
  min-width: 0;
  align-items: center;
}

.conversation-item__title {
  min-width: 0;
  margin-left: 8px;
  overflow: hidden;
  color: #606266;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-item__actions {
  display: flex;
  flex: 0 0 auto;

  ::v-deep .el-button {
    margin-left: 4px;
    padding: 4px 0;
  }
}

.conversation-list__toolbar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 12px;
  border-top: 1px solid #ebeef5;
  background: #f5f7fa;

  button {
    padding: 0;
    border: 0;
    color: #606266;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
  }
}
</style>
