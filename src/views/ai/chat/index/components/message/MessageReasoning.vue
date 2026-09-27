<template>
  <div v-if="shouldShowComponent" class="message-reasoning">
    <button type="button" class="message-reasoning__header" @click="isExpanded = !isExpanded">
      <span><i class="el-icon-chat-dot-square" /> {{ titleText }}</span>
      <i :class="isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
    </button>
    <div v-show="isExpanded" class="message-reasoning__content">
      <markdown-view :content="reasoningContent" />
    </div>
  </div>
</template>

<script>
import MarkdownView from '@/components/MarkdownView/index.vue'

export default {
  name: 'MessageReasoning',
  components: { MarkdownView },
  props: {
    reasoningContent: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return { isExpanded: true }
  },
  computed: {
    shouldShowComponent() {
      return Boolean(this.reasoningContent && this.reasoningContent.trim())
    },
    titleText() {
      return this.reasoningContent.trim() && !this.content.trim() ? '深度思考中' : '已深度思考'
    }
  }
}
</script>

<style lang="scss" scoped>
.message-reasoning {
  margin-bottom: 10px;
}

.message-reasoning__header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border: 1px solid #d9ecff;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  color: #606266;
  background: linear-gradient(90deg, #ecf5ff, #f5efff);
  cursor: pointer;
  font-size: 14px;
}

.message-reasoning__content {
  max-height: 300px;
  padding: 12px;
  overflow-y: auto;
  border: 1px solid #d9ecff;
  border-radius: 0 0 8px 8px;
  color: #606266;
  background: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  line-height: 1.6;
}
</style>
