<!--
  - Copyright (C) 2018-2019
  - All rights reserved, Designed By www.joolun.com
  芋道源码：微信粉丝消息列表与客服消息发送。
-->
<template>
  <div class="msg-main">
    <div
      ref="msgDiv"
      class="msg-div"
    >
      <div v-loading="loading" />
      <div v-if="!loading">
        <div
          v-if="hasMore"
          class="el-table__empty-block"
          @click="loadingMore"
        >
          <span class="el-table__empty-text">点击加载更多</span>
        </div>
        <div
          v-else
          class="el-table__empty-block"
        >
          <span class="el-table__empty-text">没有更多了</span>
        </div>
      </div>

      <msg-list
        :list="list"
        :account-id="queryParams.accountId"
        :user="user"
      />
    </div>

    <div
      v-loading="sendLoading"
      class="msg-send"
    >
      <wx-reply-select
        ref="replySelect"
        v-model="reply"
      />
      <el-button
        type="success"
        size="small"
        class="send-but"
        @click="sendMsg"
      >发送(S)</el-button>
    </div>
  </div>
</template>

<script>
import { getMessagePage, sendMessage } from '@/api/mp/message'
import { getUser } from '@/api/mp/user'
import WxReplySelect from '@/views/mp/components/wx-reply'
import MsgList from './components/MsgList.vue'

export default {
  name: 'WxMsg',
  components: {
    WxReplySelect,
    MsgList
  },
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      hasMore: true,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 14,
        accountId: undefined
      },
      user: {
        nickname: '用户',
        avatar: require('@/assets/images/profile.jpg'),
        accountId: 0
      },
      sendLoading: false,
      reply: {
        type: 'text',
        accountId: -1,
        articles: []
      }
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      const response = await getUser(this.userId)
      const data = response.data
      this.user.nickname = data.nickname && data.nickname.length > 0 ? data.nickname : this.user.nickname
      const avatar = data.headImageUrl || data.avatar
      this.user.avatar = avatar && avatar.length > 0 ? avatar : this.user.avatar
      this.user.accountId = data.accountId
      this.queryParams.accountId = data.accountId
      this.$set(this.reply, 'accountId', data.accountId)
      await this.refreshChange()
    },
    async sendMsg() {
      if (!this.reply || this.sendLoading) return

      if (
        this.reply.type === 'news' &&
        Array.isArray(this.reply.articles) &&
        this.reply.articles.length > 1
      ) {
        this.reply.articles = [this.reply.articles[0]]
        this.$message.success('图文消息条数限制在 1 条以内，已默认发送第一条')
      }

      this.sendLoading = true
      try {
        const response = await sendMessage({ userId: this.userId, ...this.reply })
        const data = response.data
        this.list = [...this.list, data]
        await this.scrollToBottom()

        const replySelect = this.$refs.replySelect
        if (replySelect) replySelect.clear()
      } finally {
        this.sendLoading = false
      }
    },
    loadingMore() {
      if (this.loading || !this.hasMore) return Promise.resolve()
      return this.getPage({
        ...this.queryParams,
        pageNo: this.queryParams.pageNo + 1
      })
    },
    async getPage(page, params) {
      if (this.loading) return
      const requestPage = {
        pageNo: page.pageNo,
        pageSize: page.pageSize,
        accountId: page.accountId
      }
      this.loading = true
      try {
        const msgDiv = this.$refs.msgDiv
        const scrollHeight = msgDiv ? msgDiv.scrollHeight : 0
        const response = await getMessagePage({
          pageNo: requestPage.pageNo,
          pageSize: requestPage.pageSize,
          userId: this.userId,
          accountId: requestPage.accountId,
          ...(params || {})
        })
        const result = response.data
        const data = result.list.slice().reverse()
        this.list = [...data, ...this.list]
        this.hasMore = data.length >= requestPage.pageSize
        this.queryParams.pageNo = requestPage.pageNo
        this.queryParams.pageSize = requestPage.pageSize

        if (this.queryParams.pageNo === 1) {
          await this.scrollToBottom()
        } else if (data.length && scrollHeight) {
          await this.$nextTick()
          if (this.$refs.msgDiv) {
            this.$refs.msgDiv.scrollTop = this.$refs.msgDiv.scrollHeight - scrollHeight - 100
          }
        }
      } finally {
        this.loading = false
      }
    },
    refreshChange() {
      return this.getPage(this.queryParams)
    },
    async scrollToBottom() {
      await this.$nextTick()
      if (this.$refs.msgDiv) {
        this.$refs.msgDiv.scrollTop = this.$refs.msgDiv.scrollHeight
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-main {
  padding: 10px;
  margin-top: -30px;
}

.msg-div {
  height: 50vh;
  margin-right: 10px;
  margin-left: 10px;
  overflow: auto;
  background-color: #eaeaea;
}

.msg-send {
  padding: 10px;
}

.send-but {
  float: right;
  margin-top: 8px !important;
}
</style>
