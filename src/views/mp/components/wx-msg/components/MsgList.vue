<template>
  <div>
    <div
      v-for="item in list"
      :key="item.id"
      class="execution"
    >
      <div
        class="avue-comment"
        :class="{ 'avue-comment--reverse': item.sendFrom === SendFrom.MpBot }"
      >
        <div class="avatar-div">
          <img
            :src="getAvatar(item.sendFrom)"
            class="avue-comment__avatar"
            alt=""
          />
          <div class="avue-comment__author">{{ getNickname(item.sendFrom) }}</div>
        </div>
        <div class="avue-comment__main">
          <div class="avue-comment__header">
            <div class="avue-comment__create_time">{{ parseTime(item.createTime) }}</div>
          </div>
          <div
            class="avue-comment__body"
            :style="item.sendFrom === SendFrom.MpBot ? 'background: #6BED72;' : ''"
          >
            <msg :item="item" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Msg from './Msg.vue'
import { parseTime } from '@/utils/ruoyi'
import avatarWechat from '@/assets/images/wechat.png'

const SendFrom = Object.freeze({
  User: 1,
  MpBot: 2
})

export default {
  name: 'MsgList',
  components: { Msg },
  props: {
    list: {
      type: Array,
      required: true,
      default: () => []
    },
    accountId: {
      type: Number,
      default: undefined
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return { SendFrom }
  },
  methods: {
    parseTime,
    getAvatar(sendFrom) {
      return sendFrom === SendFrom.User ? this.user.avatar : avatarWechat
    },
    getNickname(sendFrom) {
      return sendFrom === SendFrom.User ? this.user.nickname : '公众号'
    }
  }
}
</script>

<style lang="scss" scoped>
@import url('../comment.scss');
@import url('../card.scss');

.avatar-div {
  width: 80px;
  text-align: center;
}
</style>
