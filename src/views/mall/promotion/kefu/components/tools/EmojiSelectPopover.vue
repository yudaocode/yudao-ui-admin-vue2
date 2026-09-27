<template>
  <el-popover
    :width="500"
    placement="top"
    trigger="click"
  >
    <el-scrollbar class="emoji-scrollbar">
      <ul class="emoji-list">
        <li
          v-for="(item, index) in emojiList"
          :key="index"
          :title="item.name"
          class="icon-item"
          @click="handleSelect(item)"
        >
          <img :src="item.url" />
        </li>
      </ul>
    </el-scrollbar>
    <span
      slot="reference"
      class="emoji-trigger"
    >😀</span>
  </el-popover>
</template>

<script>
import { getEmojiList } from './emoji'

export default {
  name: 'EmojiSelectPopover',
  data() {
    return {
      emojiList: getEmojiList()
    }
  },
  methods: {
    handleSelect(item) {
      this.$emit('select-emoji', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.emoji-scrollbar {
  height: 300px;
}

::v-deep .emoji-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden;
}

.emoji-list {
  display: flex;
  padding: 0 8px;
  margin: 0 0 0 8px;
  list-style: none;
  flex-wrap: wrap;
}

.icon-item {
  display: flex;
  width: 10%;
  padding: 8px;
  margin-top: 4px;
  margin-right: 8px;
  color: #409eff;
  cursor: pointer;
  border: 1px solid #409eff;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  img {
    width: 24px;
    height: 24px;
  }
}

.emoji-trigger {
  margin-left: 10px;
  font-size: 30px;
  line-height: 30px;
  cursor: pointer;
}
</style>
