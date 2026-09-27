<template>
  <!--
    好友单行项
    - 头像 + 昵称
    - 选中态 active
    - 右键菜单（发消息 / 删除好友）由全局 ContextMenu 承接
  -->
  <div
    class="relative flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--el-fill-color)]"
    :class="{ '!bg-[#d9ecff] dark:!bg-[var(--el-color-primary-light-8)]': active }"
    @click="$emit('click', friend)"
    @contextmenu.prevent="handleContextMenu"
  >
    <!-- prefix slot：放在头像前，给选择类弹窗的 checkbox / 圆点用，不传则不渲染 -->
    <slot name="prefix" />
    <!-- 头像 -->
    <UserAvatar
      :id="friend.id"
      :url="friend.avatar"
      :name="friend.nickname"
      :size="42"
      :clickable="false"
    />
    <!-- 单行展示 displayName 优先；昵称仅在好友详情面板展示，列表里不重复 -->
    <div class="flex flex-1 min-w-0">
      <div class="overflow-hidden text-sm truncate text-[var(--el-text-color-primary)]">
        {{ friend.displayName || friend.nickname }}
      </div>
    </div>
    <slot />
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import { useImUiStore } from '../../store/uiStore'
import UserAvatar from '../user/UserAvatar.vue'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImFriendItem'
  },
  components: {
    UserAvatar
  },
  __name: 'FriendItem',
  props: {
    friend: {
      type: null,
      required: true
    },
    active: {
      type: Boolean,
      required: false,
      default: false
    },
    menu: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ['click', 'chat', 'delete'],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    __expose()
    const props = __props
    const emit = __emit
    const uiStore = useImUiStore()

    /** 右键菜单：发送消息 / 删除好友 */
    function handleContextMenu(event) {
      if (!props.menu) {
        return
      }
      uiStore.openContextMenu({
        x: event.clientX,
        y: event.clientY
      }, [{
        key: 'chat',
        name: '发送消息'
      }, {
        key: 'delete',
        name: '删除好友'
      }], item => {
        if (item.key === 'chat') emit('chat', props.friend); else if (item.key === 'delete') emit('delete', props.friend)
      })
    }
    const __returned__ = {
      props,
      emit,
      uiStore,
      handleContextMenu,
      UserAvatar
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
