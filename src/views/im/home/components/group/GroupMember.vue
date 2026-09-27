<template>
  <!--
    群成员单行
    跨子域复用：@候选 (MentionPicker) / 已读列表 (MessageReadStatus) / 群成员宫格 (ConversationGroupSide)
  -->
  <div
    class="relative flex items-center px-[5px] box-border whitespace-nowrap"
    :class="{ 'bg-[#e1eaf7] dark:bg-[var(--el-color-primary-light-9)]': active }"
    :style="{ height: height + 'px' }"
  >
    <UserAvatar
      :id="member.userId"
      :size="avatarSize"
      :name="member.nickname"
      :url="member.avatar"
      :clickable="clickable"
      :add-source="ImFriendAddSource.GROUP"
      :add-source-extra="groupName"
    />
    <div
      class="flex-1 h-full pl-2.5 overflow-hidden text-sm text-left truncate text-[var(--el-text-color-regular)]"
      :style="{ lineHeight: height + 'px' }"
    >
      {{ member.showName }}
    </div>
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import { computed } from 'vue'
import UserAvatar from '../user/UserAvatar.vue'
import { ImFriendAddSource } from '../../../utils/constants'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImGroupMember'
  },
  components: {
    UserAvatar
  },
  __name: 'GroupMember',
  props: {
    member: {
      type: Object,
      required: true
    },
    height: {
      type: Number,
      required: false,
      default: 50
    },
    active: {
      type: Boolean,
      required: false,
      default: false
    },
    clickable: {
      type: Boolean,
      required: false,
      default: false
    },
    groupName: {
      type: String,
      required: false,
      default: ''
    }
  },
  setup(__props, {
    expose: __expose
  }) {
    __expose()

    /** 群成员结构（跨多处使用，放这里做窄接口；独立于 types/index.ts） */
    const props = __props
    const avatarSize = computed(() => Math.ceil(props.height * 0.75))
    const __returned__ = {
      props,
      avatarSize,
      UserAvatar,
      get ImFriendAddSource() {
        return ImFriendAddSource
      }
    }
    Object.defineProperty(__returned__, '__isScriptSetup', {
      enumerable: false,
      value: true
    })
    return __returned__
  }
})
export default __sfc__
</script>
