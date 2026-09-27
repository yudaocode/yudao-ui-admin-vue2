<!--
  - Copyright (C) 2018-2019
  - All rights reserved, Designed By www.joolun.com
  芋道源码：六种客服回复的编辑与分页缓存。
-->
<template>
  <el-tabs
    v-model="currentTab"
    type="border-card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane :name="ReplyType.Text">
      <span slot="label"><i class="el-icon-document" /> 文本</span>
      <tab-text
        :value="reply.content"
        @input="onTextInput"
      />
    </el-tab-pane>

    <el-tab-pane :name="ReplyType.Image">
      <span slot="label"><i class="el-icon-picture" /> 图片</span>
      <tab-image
        :value="reply"
        @input="onReplyInput"
      />
    </el-tab-pane>

    <el-tab-pane :name="ReplyType.Voice">
      <span slot="label"><i class="el-icon-phone" /> 语音</span>
      <tab-voice
        :value="reply"
        @input="onReplyInput"
      />
    </el-tab-pane>

    <el-tab-pane :name="ReplyType.Video">
      <span slot="label"><i class="el-icon-share" /> 视频</span>
      <tab-video
        :value="reply"
        @input="onReplyInput"
      />
    </el-tab-pane>

    <el-tab-pane :name="ReplyType.News">
      <span slot="label"><i class="el-icon-news" /> 图文</span>
      <tab-news
        :value="reply"
        :news-type="newsType"
        @input="onReplyInput"
      />
    </el-tab-pane>

    <el-tab-pane :name="ReplyType.Music">
      <span slot="label"><i class="el-icon-service" /> 音乐</span>
      <tab-music
        :value="reply"
        @input="onReplyInput"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import TabText from './components/TabText.vue'
import TabImage from './components/TabImage.vue'
import TabVoice from './components/TabVoice.vue'
import TabVideo from './components/TabVideo.vue'
import TabNews from './components/TabNews.vue'
import TabMusic from './components/TabMusic.vue'
import { NewsType, ReplyType, createEmptyReply } from './components/types'

export default {
  name: 'WxReplySelect',
  components: {
    TabText,
    TabImage,
    TabVoice,
    TabVideo,
    TabNews,
    TabMusic
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Object,
      default: null
    },
    newsType: {
      type: String,
      default: NewsType.Published
    }
  },
  data() {
    const source = this.value || {
      accountId: undefined,
      type: ReplyType.Text
    }
    const initial = { ...createEmptyReply(source), ...source }
    return {
      ReplyType,
      internalReply: initial,
      currentTab: initial.type || ReplyType.Text,
      previousTab: initial.type || ReplyType.Text,
      tabCache: new Map()
    }
  },
  computed: {
    reply() {
      return this.value || this.internalReply
    },
    activeExternalType() {
      return this.reply && this.reply.type
    }
  },
  watch: {
    activeExternalType(type) {
      if (type && type !== this.currentTab) {
        this.currentTab = type
        this.previousTab = type
        this.tabCache.set(type, this.cloneReply(this.reply))
      }
    }
  },
  created() {
    this.tabCache.set(this.currentTab, this.cloneReply(this.reply))
  },
  methods: {
    cloneReply(reply) {
      const cloned = { ...createEmptyReply(reply), ...(reply || {}) }
      cloned.articles = Array.isArray(cloned.articles) ? cloned.articles.slice() : []
      return cloned
    },
    emitReply(reply) {
      this.$emit('input', reply)
    },
    applyReply(nextReply) {
      if (!this.value) this.internalReply = nextReply
      this.emitReply(nextReply)
      return nextReply
    },
    handleTabClick(tab) {
      const newTab = (tab && tab.name) || this.currentTab
      const oldTab = this.previousTab
      if (!newTab || newTab === oldTab) return

      this.tabCache.set(oldTab, this.cloneReply(this.reply))
      const cached = this.tabCache.get(newTab)
      const nextReply = cached || createEmptyReply(this.reply)
      nextReply.accountId = this.reply.accountId
      nextReply.type = newTab
      this.applyReply(this.cloneReply(nextReply))
      this.previousTab = newTab
      this.currentTab = newTab
    },
    onTextInput(content) {
      this.applyReply({ ...this.cloneReply(this.reply), content })
    },
    onReplyInput(reply) {
      this.applyReply(this.cloneReply(reply))
    },
    inputContent(content) {
      this.onTextInput(content)
    },
    /** Clear only the active tab and keep its account/type context. */
    clear() {
      const emptyReply = createEmptyReply(this.reply)
      emptyReply.type = this.currentTab
      const applied = this.applyReply(emptyReply)
      this.tabCache.set(this.currentTab, this.cloneReply(applied))
    }
  }
}
</script>
