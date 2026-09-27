<template>
  <div class="message-new-conversation">
    <div>
      <p>点击下方按钮，开始你的对话吧</p>
      <el-button type="primary" round @click="$emit('on-new-conversation')">新建对话</el-button>
    </div>
  </div>
</template>

<script>
export default { name: 'MessageNewConversation' }
</script>

<style scoped>
.message-new-conversation {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #909399;
  text-align: center;
}
</style>
