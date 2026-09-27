<template>
  <!--
    通讯录 - 好友分组
    - 自治：折叠状态 + 关键字过滤 + 字母分桶 本组件内闭环
    - 字母分桶 / 拼音搜索委托 useFriendBuckets，与选择类弹窗 FriendPickerPanel 共用一份规则
    - 选中态由父级 activeId 透传；chat / delete 透传到父级走 store 改造
  -->
  <div>
    <!-- 折叠分组头：字号对齐微信 PC（15px），hover 浅底色反馈 -->
    <div
      class="flex gap-2 items-center px-3.5 py-2.5 cursor-pointer select-none text-15px text-[var(--el-text-color-primary)] hover:bg-[var(--el-fill-color-light)]"
      @click="expanded = !expanded"
    >
      <Icon
        :icon="expanded ? 'ep:caret-bottom' : 'ep:caret-right'"
        :size="14"
      />
      <span class="flex-1">好友</span>
      <span class="text-sm text-[var(--el-text-color-secondary)]">{{ filtered.length }}</span>
    </div>
    <div v-show="expanded">
      <div
        v-for="bucket in buckets"
        :key="bucket.letter"
      >
        <!-- 字母分桶 header：浅底 + 小字号，作为好友列表内部分隔 -->
        <div
          class="pt-1 pb-0.5 px-3.5 text-12px text-[var(--el-text-color-secondary)] bg-[var(--el-fill-color-lighter)]"
        >
          {{ bucket.letter }}
        </div>
        <FriendItem
          v-for="friend in bucket.list"
          :key="friend.id"
          :friend="friend"
          :active="activeId === friend.id"
          @click="$emit('select', friend)"
          @chat="$emit('chat', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
      <div
        v-if="filtered.length === 0"
        class="py-3 text-12px text-center text-[var(--el-text-color-disabled)]"
      >
        {{ keyword ? '没有匹配的好友' : '暂无好友' }}
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import { ref, toRef } from 'vue'
import Icon from '../../components/user/ImIcon.vue'
import FriendItem from '../../components/friend/FriendItem.vue'
import { useFriendBuckets } from './useFriendBuckets'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImContactFriendList'
  },
  components: {
    Icon,
    FriendItem
  },
  __name: 'FriendList',
  props: {
    friends: {
      type: Array,
      required: true
    },
    keyword: {
      type: String,
      required: true
    },
    activeId: {
      type: Number,
      required: false
    }
  },
  emits: ['select', 'chat', 'delete'],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    __expose()
    const props = __props
    const emit = __emit
    const expanded = ref(true)
    const {
      filtered,
      buckets
    } = useFriendBuckets(toRef(props, 'friends'), toRef(props, 'keyword'))
    const __returned__ = {
      props,
      emit,
      expanded,
      filtered,
      buckets,
      Icon,
      FriendItem
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
