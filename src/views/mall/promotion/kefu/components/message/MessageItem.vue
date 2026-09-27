<template>
  <div :class="messageClass">
    <slot />
  </div>
</template>

<script>
import { UserTypeEnum } from '@/utils/constants'

export default {
  name: 'MessageItem',
  props: {
    message: { type: Object, required: true }
  },
  computed: {
    messageClass() {
      if (this.message.senderType === UserTypeEnum.MEMBER) return 'message-item-left'
      if (this.message.senderType === UserTypeEnum.ADMIN) return 'message-item-right'
      return ''
    }
  }
}
</script>

<style scoped>
.message-item-left {
  margin-left: 10px;
}

.message-item-right {
  margin-right: 10px;
}
</style>
