<template>
  <div class="app-container">
    <doc-alert title="AI 对话聊天" url="https://doc.iocoder.cn/ai/chat/" />
    <el-tabs v-model="activeTab">
      <el-tab-pane label="对话列表" name="conversation"><chat-conversation-list /></el-tab-pane>
      <el-tab-pane label="消息列表" name="message"><chat-message-list /></el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import ChatConversationList from './ChatConversationList.vue'
import ChatMessageList from './ChatMessageList.vue'

export default { name: 'AiChatManager', components: { ChatConversationList, ChatMessageList }, data() { return { activeTab: 'conversation' } } }
</script>
