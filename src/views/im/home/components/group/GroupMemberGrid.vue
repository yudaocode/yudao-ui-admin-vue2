<template>
  <!--
    群成员宫格单元
    - 宫格展示的最小单位：头像在上、名字在下；列宽 = size + 16，自适应 size 留呼吸空间
    - 被 GroupMemberPickerPanel 右侧已选区（grid 形态）、ConversationGroupSide 群成员区循环使用
  -->
  <div
    class="relative flex flex-col items-center px-0.5 py-1"
    :style="{ width: `${size + 16}px` }"
  >
    <UserAvatar
      :id="member.userId"
      :url="member.avatar"
      :name="member.nickname"
      :size="size"
      :clickable="clickable"
      :add-source="ImFriendAddSource.GROUP"
      :add-source-extra="groupName"
    />
    <div
      class="w-full mt-1 overflow-hidden text-12px leading-[18px] text-center truncate text-[var(--el-text-color-regular)]"
    >
      {{ member.showName }}
    </div>
    <slot />
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import UserAvatar from '../user/UserAvatar.vue'
import { ImFriendAddSource } from '../../../utils/constants'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImGroupMemberGrid'
  },
  components: {
    UserAvatar
  },
  __name: 'GroupMemberGrid',
  props: {
    member: {
      type: null,
      required: true
    },
    clickable: {
      type: Boolean,
      required: false,
      default: false
    },
    size: {
      type: Number,
      required: false,
      default: 38
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
    const __returned__ = {
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
