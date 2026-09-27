<template>
  <div class="message-list-empty">
    <div>
      <h2>芋道 AI</h2>
      <div class="message-list-empty__prompts">
        <button
          v-for="item in promptList"
          :key="item.prompt"
          type="button"
          @click="$emit('on-prompt', item.prompt)"
        >
          {{ item.prompt }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageListEmpty',
  data() {
    return {
      promptList: [{ prompt: '今天气怎么样?' }, { prompt: '写一首好听的诗歌?' }]
    }
  }
}
</script>

<style lang="scss" scoped>
.message-list-empty {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

  h2 { margin: 0; text-align: center; }
}

.message-list-empty__prompts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 460px;
  margin-top: 20px;

  button {
    width: 190px;
    margin: 10px;
    padding: 15px;
    border: 1px solid #e4e7ed;
    border-radius: 10px;
    color: #606266;
    background: #fff;
    cursor: pointer;

    &:hover { background: #f5f7fa; }
  }
}
</style>
