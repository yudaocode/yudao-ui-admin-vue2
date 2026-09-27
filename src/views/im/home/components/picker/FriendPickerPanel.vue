<template>
<!--
    好友选择面板：用于「新建群聊 / 邀请好友 / 推荐时创建聊天」等好友选择场景
    - 左：搜索 + 好友列表（圆形勾选）
    - 右：已选数标题 + 已选好友列表（按点击顺序）
    - Panel 不带 el-dialog 壳；dialog 由业务壳持有
    - 三态语义：hide > locked > disabled（详见 contract）
  -->
  <div class="flex h-full">
    <!-- 左栏 -->
    <div
      class="flex flex-col flex-1 min-w-0 border-r border-r-solid border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)]"
    >
      <!-- 搜索框 -->
      <div class="flex-shrink-0 px-3 py-2">
        <el-input v-model="keyword" placeholder="搜索好友" clearable>
          <template #prefix>
            <Icon icon="ant-design:search-outlined" />
          </template>
        </el-input>
      </div>

      <div class="flex-1 min-h-0">
        <PagedScroller v-if="filtered.length > 0" :items="filtered" :page-size="30" item-key="id">
          <template #default="{ item }">
            <div
              :key="(item).id"
              class="flex gap-2.5 items-center px-3 py-2 cursor-pointer hover:bg-[var(--el-fill-color)]"
              :class="{
                'opacity-60 cursor-not-allowed hover:bg-transparent': isDisabled(item)
              }"
              @click="handleToggle(item)"
            >
              <!-- 圆形勾选指示器：未选灰色空心圆，选中实心微信绿 + 白对勾；锁定 / 禁用走灰底 -->
              <span
                class="flex flex-shrink-0 justify-center items-center w-5 h-5 rounded-full transition-colors"
                :class="getCheckClass(item)"
              >
                <Icon
                  v-if="isSelected(item) || isLocked(item)"
                  icon="ant-design:check-outlined"
                  :size="12"
                  color="#fff"
                />
              </span>
              <UserAvatar
                :id="(item).id"
                :url="(item).avatar"
                :name="(item).nickname"
                :size="36"
                :clickable="false"
              />
              <!-- 行内名字：备注优先，列表里不重复展示昵称 -->
              <span
                class="flex-1 min-w-0 overflow-hidden text-sm truncate text-[var(--el-text-color-primary)]"
              >
                {{ (item).displayName || (item).nickname }}
              </span>
            </div>
          </template>
        </PagedScroller>
        <div v-else class="py-10 text-13px text-center text-[var(--el-text-color-disabled)]">
          {{ keyword ? '没有匹配的好友' : '暂无好友' }}
        </div>
      </div>
    </div>

    <!-- 右栏 -->
    <div class="flex flex-col flex-1 min-w-0">
      <!-- 标题：已选数；高度对齐左侧 input default（32px），保证两侧第一项起点同水平 -->
      <div
        class="flex-shrink-0 h-12 px-4 leading-[3rem] border-b border-b-solid text-13px text-[var(--el-text-color-secondary)] border-[var(--el-border-color-lighter)]"
      >
        已选择 {{ selectedCount }} 个好友
      </div>

      <!-- 已选预览：按 selectedIds + lockedIds 数组顺序（点击顺序）展示 -->
      <el-scrollbar class="flex-1">
        <div
          v-for="friend in selectedFriends"
          :key="friend.id"
          class="flex gap-2.5 items-center px-4 py-2"
        >
          <UserAvatar
            :id="friend.id"
            :url="friend.avatar"
            :name="friend.nickname"
            :size="36"
            :clickable="false"
          />
          <span
            class="flex-1 min-w-0 overflow-hidden text-sm truncate text-[var(--el-text-color-primary)]"
          >
            {{ friend.displayName || friend.nickname }}
          </span>
          <!-- 锁定项不渲染 ×，避免误以为可移除 -->
          <Icon
            v-if="!isLocked(friend)"
            icon="ant-design:close-outlined"
            :size="14"
            class="flex-shrink-0 cursor-pointer transition-colors text-[var(--el-text-color-placeholder)] hover:text-[var(--el-color-danger)]"
            @click="handleToggle(friend)"
          />
        </div>
        <div
          v-if="selectedFriends.length === 0"
          class="py-10 text-13px text-center text-[var(--el-text-color-disabled)]"
        >
          请从左侧选择好友
        </div>
      </el-scrollbar>

      <!-- 业务壳塞额外内容的位置；FriendPickerPanel 主流场景不需要 footer -->
      <div
        v-if="$slots.footer"
        class="flex-shrink-0 border-t border-t-solid border-[var(--el-border-color-lighter)]"
      >
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue';
import { computed, ref } from 'vue';
import Icon from '@/views/im/home/components/user/ImIcon.vue';
import { useMessage } from '@/views/im/utils/messageUi';
import UserAvatar from '../user/UserAvatar.vue';
import PagedScroller from '../PagedScroller.vue';
import { useFriendBuckets } from '../../composables/useFriendBuckets';
import { useSelectedItems } from '../../composables/useSelectedItems';
const __sfc__ = /*@__PURE__*/_defineComponent({
  ...{
    name: 'ImFriendPickerPanel'
  },
  components: {
    Icon,
    UserAvatar,
    PagedScroller
  },
  __name: 'FriendPickerPanel',
  props: {
    friends: {
      type: Array,
      required: true
    },
    selectedIds: {
      type: Array,
      required: true
    },
    lockedIds: {
      type: Array,
      required: false,
      default: () => []
    },
    disabledIds: {
      type: Array,
      required: false,
      default: () => []
    },
    hideIds: {
      type: Array,
      required: false,
      default: () => []
    },
    maxSize: {
      type: Number,
      required: false,
      default: 0
    }
  },
  emits: ["update:selectedIds"],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const message = useMessage();
    const keyword = ref('');

    /** id → friend 映射，已选反查 / 三态判定共用，避免每次 O(N) 扫 */
    const byId = computed(() => {
      const map = new Map();
      for (const friend of props.friends) {
        map.set(friend.id, friend);
      }
      return map;
    });

    /** 三态 id 集合：每次过滤复用 */
    const hideSet = computed(() => new Set(props.hideIds));
    const lockedSet = computed(() => new Set(props.lockedIds));
    const disabledSet = computed(() => new Set(props.disabledIds));
    const selectedSet = computed(() => new Set(props.selectedIds));

    /** 候选好友：剔除 hideIds（hide 优先级最高） */
    const candidates = computed(() => props.friends.filter(friend => !hideSet.value.has(friend.id)));

    /** 委托 useFriendBuckets：搜索规则复用，左侧列表按滚动分页渲染 */
    const {
      filtered
    } = useFriendBuckets(candidates, keyword);

    /** 已选数 + 已选好友列表：三态优先级 + 顺序拼接由 useSelectedItems 统一承担 */
    const {
      selectedCount,
      selectedItems: selectedFriends
    } = useSelectedItems(() => props.selectedIds, () => props.lockedIds, () => props.disabledIds, () => props.hideIds, byId);

    /** 是否被锁定 */
    function isLocked(friend) {
      return lockedSet.value.has(friend.id);
    }

    /** 是否被禁用：locked / hide 已被前置过滤，剩下的才算 disabled */
    function isDisabled(friend) {
      return !lockedSet.value.has(friend.id) && disabledSet.value.has(friend.id);
    }

    /** 是否选中：locked 视为永远选中 */
    function isSelected(friend) {
      return selectedSet.value.has(friend.id);
    }

    /** 圆形勾选指示器的 class：选中 / 锁定走绿底，禁用灰底，未选空心圆 */
    function getCheckClass(friend) {
      if (isLocked(friend) || isSelected(friend)) {
        return 'bg-[#07c160] border border-solid border-[#07c160]';
      }
      if (isDisabled(friend)) {
        return 'bg-[var(--el-fill-color)] border border-solid border-[var(--el-border-color)]';
      }
      return 'border border-solid border-[var(--el-border-color)] bg-[var(--el-bg-color)]';
    }

    /** 切换选中态：locked / disabled 不响应；右栏 × 移除 / 行 click 都走这里 */
    function handleToggle(friend) {
      if (isLocked(friend) || isDisabled(friend)) {
        return;
      }
      const next = [...props.selectedIds];
      const index = next.indexOf(friend.id);
      if (index >= 0) {
        next.splice(index, 1);
      } else {
        if (props.maxSize > 0 && selectedCount.value >= props.maxSize) {
          message.error(`最多选择 ${props.maxSize} 位好友`);
          return;
        }
        next.push(friend.id);
      }
      emit('update:selectedIds', next);
    }
    const __returned__ = {
      props,
      emit,
      message,
      keyword,
      byId,
      hideSet,
      lockedSet,
      disabledSet,
      selectedSet,
      candidates,
      filtered,
      selectedCount,
      selectedFriends,
      isLocked,
      isDisabled,
      isSelected,
      getCheckClass,
      handleToggle,
      Icon,
      UserAvatar,
      PagedScroller
    };
    Object.defineProperty(__returned__, '__isScriptSetup', {
      enumerable: false,
      value: true
    });
    return __returned__;
  }
});
export default __sfc__;
</script>
