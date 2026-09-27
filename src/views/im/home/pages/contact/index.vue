<template>
  <!--
    通讯录 Tab 整页（参考微信 PC 通讯录）
    - 左：搜索 + GroupList / FriendList 两个折叠分组（好友按字母分桶）
    - 右：选中项的详情，好友走共享 <UserInfo>（relation=friend），群聊走 GroupDetail
    - 本页仅做：选中分发 + 数据源转换 + 跨组件事件落 store
  -->
  <div class="im-contact-page flex flex-1 h-full min-w-0 bg-[var(--el-bg-color)]">
    <ResizableAside
      :default-width="260"
      :storage-key="StorageKeys.localStorage.asideWidth"
    >
      <!-- 顶部：仅搜索框；h-14 与消息 Tab 顶部对齐，避免切换时搜索框上下抖动 -->
      <div
        class="flex flex-shrink-0 items-center h-14 px-4 border-b border-b-solid border-[var(--el-border-color-lighter)]"
      >
        <el-input
          v-model="keyword"
          placeholder="搜索"
          clearable
          class="flex-1"
        >
          <template #prefix>
            <Icon icon="ant-design:search-outlined" />
          </template>
        </el-input>
      </div>

      <!-- 列表主体：拆 FriendRequestList / GroupList / FriendList 三个子组件，各自管理折叠 + 过滤；本页只透传选中态 -->
      <el-scrollbar class="flex-1">
        <FriendRequestList
          :requests="friendRequests"
          :active-id="selection?.type === 'request' ? selection.request.id : undefined"
          @select="handleSelectRequest"
        />
        <GroupList
          :groups="groups"
          :keyword="keyword"
          :active-id="selection?.type === 'group' ? selection.group.id : undefined"
          @select="handleSelectGroup"
        />
        <FriendList
          :friends="friends"
          :keyword="keyword"
          :active-id="selection?.type === 'friend' ? selection.friend.id : undefined"
          @select="handleSelectFriend"
          @chat="handleChatFriend"
          @delete="handleDeleteFriend"
        />
      </el-scrollbar>
    </ResizableAside>

    <!-- 右侧详情区 -->
    <div class="flex-1 min-w-0">
      <!-- 空态：占位图标 + 提示文案 -->
      <div
        v-if="!selection"
        class="flex flex-col items-center justify-center h-full gap-3 text-[var(--el-text-color-secondary)]"
      >
        <Icon
          icon="ant-design:contacts-outlined"
          :size="64"
          class="text-[var(--el-text-color-placeholder)]"
        />
        <span class="text-sm">在左侧选择好友或群聊查看详情</span>
      </div>
      <!-- 好友详情 -->
      <div
        v-else-if="selection.type === 'friend'"
        class="flex justify-center pt-12 px-6"
      >
        <div class="w-full max-w-[320px]">
          <UserInfo
            :user="friendUser"
            :display-name="selection.friend.displayName || ''"
            relation="friend"
            @chat="handleChatFriend(selection.friend)"
            @deleted="selection = null"
            @saved="onRemarkSaved"
          />
        </div>
      </div>
      <!-- 群详情 -->
      <GroupDetail
        v-else-if="selection.type === 'group'"
        :group="selection.group"
        @chat="handleChatGroup"
      />
      <!-- 新的朋友 - 申请详情 -->
      <FriendRequestDetail
        v-else-if="selection.type === 'request'"
        :request="currentRequest"
        @chat="handleChatPeer"
      />
    </div>
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'
import Icon from '../../components/user/ImIcon.vue'
import { useMessage } from '@/views/im/utils/messageUi'
import router from '@/router'
import ResizableAside from './ResizableAside.vue'
import UserInfo from '../../components/user/UserInfo.vue'
import FriendList from './FriendList.vue'
import FriendRequestList from './FriendRequestList.vue'
import FriendRequestDetail from './FriendRequestDetail.vue'
import GroupList from './GroupList.vue'
import GroupDetail from './GroupDetail.vue'
import { useConversationStore } from '../../store/conversationStore'
import { useFriendStore } from '../../store/friendStore'
import { useGroupStore } from '../../store/groupStore'
import { getFriendDisplayName, getGroupDisplayName, isGroupQuit } from '../../../utils/user'
import { ImConversationType } from '../../../utils/constants'
import { StorageKeys } from '../../../utils/db'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImContactPage'
  },
  components: {
    Icon,
    ResizableAside,
    UserInfo,
    FriendList,
    FriendRequestList,
    FriendRequestDetail,
    GroupList,
    GroupDetail
  },
  __name: 'index',
  setup(__props, {
    expose: __expose
  }) {
    __expose()

    const conversationStore = useConversationStore()
    const friendStore = useFriendStore()
    const groupStore = useGroupStore()
    const message = useMessage()

    /** 用 type 判别选中是好友 / 群聊 / 好友申请 */
    const selection = ref(null)
    const keyword = ref('')

    /** 选中申请详情：详情用 store 里的最新副本（同意 / 拒绝后状态会变） */
    const currentRequest = computed(() => {
      const req = selection.value?.type === 'request' ? selection.value.request : null
      if (!req) {
        return {}
      }
      return friendStore.getFriendRequest(req.id) || req
    })

    /** 我相关的申请列表（用 friendStore 里的实时副本，便于通知到达后自动刷新） */
    const friendRequests = computed(() => friendStore.friendRequests)

    /** 好友列表的展示快照：附带后端算好的拼音，给 FriendList 做字母分桶 / 拼音搜索 */
    const friends = computed(() => friendStore.getActiveFriendLiteList)
    const groups = computed(() =>
    // 通讯录只展示当前仍在群的；已退群历史群只留在 store 里供消息展示群名 / 头像，不进通讯录
      groupStore.groups.filter(group => !isGroupQuit(group)).map(group => ({
        id: group.id,
        name: group.name,
        showGroupName: getGroupDisplayName(group),
        // 优先用群备注 groupRemark，没设置时回落到原群名；避免点"进入群聊"时把已同步的备注会话名刷回原名
        showImage: group.avatar,
        showImageThumb: group.avatar,
        memberCount: group.memberCount
      })))

    /**
     * store 列表变化时同步 selection 持的对象副本：对端推送 / 跨端动作改 store 后，右侧详情能跟上：
     * - 命中则替换为最新引用，资料 / 备注 / 申请状态变更立刻反映
     * - 找不到（删除 / 拒绝 / 已通过等让记录消失）则置 null 收起详情
     */
    watch(friends, list => {
      const selected = selection.value
      if (selected?.type !== 'friend') {
        return
      }
      const fresh = list.find(friend => friend.id === selected.friend.id)
      if (!fresh) {
        selection.value = null
      } else if (fresh !== selected.friend) {
        selection.value = {
          type: 'friend',
          friend: fresh
        }
      }
    }, {
      deep: true
    })
    watch(groups, list => {
      const selected = selection.value
      if (selected?.type !== 'group') {
        return
      }
      const fresh = list.find(group => group.id === selected.group.id)
      if (!fresh) {
        selection.value = null
      } else if (fresh !== selected.group) {
        selection.value = {
          type: 'group',
          group: fresh
        }
      }
    }, {
      deep: true
    })
    watch(friendRequests, list => {
      const selected = selection.value
      if (selected?.type !== 'request') {
        return
      }
      const fresh = list.find(request => request.id === selected.request.id)
      if (!fresh) {
        selection.value = null
      } else if (fresh !== selected.request) {
        selection.value = {
          type: 'request',
          request: fresh
        }
      }
    }, {
      deep: true
    })
    const friendUser = computed(() => {
      if (selection.value?.type !== 'friend') {
        return null
      }
      const friend = selection.value.friend
      return {
        id: friend.id,
        nickname: friend.nickname,
        avatar: friend.avatar
      }
    })
    onMounted(async() => {
      await Promise.all([friendStore.fetchFriendList(), friendStore.fetchFriendRequestList(), groupStore.fetchGroupList()])
    })

    /** 选中好友 → 切到好友详情 */
    function handleSelectFriend(friend) {
      selection.value = {
        type: 'friend',
        friend
      }
    }

    /** 选中群聊 → 切到群详情 */
    function handleSelectGroup(group) {
      selection.value = {
        type: 'group',
        group
      }
    }

    /** 选中好友申请 → 切到「新的朋友」详情 */
    function handleSelectRequest(request) {
      selection.value = {
        type: 'request',
        request
      }
    }

    /** 申请详情里点「发消息」：直接进与对端的私聊会话 */
    function handleChatPeer(peerUserId) {
      const friend = friendStore.getFriend(peerUserId)
      const conversationName = friend ? getFriendDisplayName(friend) : String(peerUserId)
      conversationStore.openConversation(peerUserId, ImConversationType.PRIVATE, conversationName, friend?.avatar || '', {
        silent: !!friend?.silent
      })
      router.push({
        name: 'ImHomeConversation'
      })
    }

    /** 进入与该好友的私聊会话 */
    function handleChatFriend(friend) {
      // 从 friendStore 同步备注 + 免打扰，避免新建会话用过期数据
      const entry = friendStore.getFriend(friend.id)
      const conversationName = entry ? getFriendDisplayName(entry) : friend.nickname
      conversationStore.openConversation(friend.id, ImConversationType.PRIVATE, conversationName, friend.avatar || '', {
        silent: !!entry?.silent
      })
      router.push({
        name: 'ImHomeConversation'
      })
    }

    /** 进入该群的群聊会话 */
    function handleChatGroup(group) {
      const entry = groupStore.getGroup(group.id)
      conversationStore.openConversation(group.id, ImConversationType.GROUP, group.showGroupName || group.name || '', group.showImage || group.showImageThumb || '', {
        silent: !!entry?.silent
      })
      router.push({
        name: 'ImHomeConversation'
      })
    }

    /** 删除好友：二次确认 → store 落库 → 清空当前选中 */
    async function handleDeleteFriend(friend) {
      const friendId = friend.id
      try {
        await message.confirm(`确定删除好友「${friend.nickname}」吗？`, '删除联系人')
      } catch {
        return
      }
      try {
        // friendStore.deleteFriend 内部已经级联清理对应私聊会话
        await friendStore.deleteFriend(friendId)
      } catch (error) {
        console.warn('[IM contact] 删除好友失败', error)
        return
      }
      if (selection.value?.type === 'friend' && selection.value.friend.id === friendId) {
        selection.value = null
      }
      message.success('已删除好友')
    }

    /** 备注已保存：UserInfo 内部已经走完 friendStore 落库 + 提示，本侧只负责同步 selection 持的旧 FriendLite 副本 */
    function onRemarkSaved(displayName) {
      if (selection.value?.type === 'friend') {
        selection.value.friend.displayName = displayName
      }
    }
    const __returned__ = {
      router,
      conversationStore,
      friendStore,
      groupStore,
      message,
      selection,
      keyword,
      currentRequest,
      friendRequests,
      friends,
      groups,
      friendUser,
      handleSelectFriend,
      handleSelectGroup,
      handleSelectRequest,
      handleChatPeer,
      handleChatFriend,
      handleChatGroup,
      handleDeleteFriend,
      onRemarkSaved,
      Icon,
      ResizableAside,
      UserInfo,
      FriendList,
      FriendRequestList,
      FriendRequestDetail,
      GroupList,
      GroupDetail,
      get StorageKeys() {
        return StorageKeys
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
<style>
.im-contact-page { --el-bg-color:#fff; --el-border-color-lighter:#ebeef5; --el-fill-color:#f0f2f5; --el-fill-color-light:#f5f7fa; --el-fill-color-lighter:#fafafa; --el-color-primary:#409eff; --el-color-danger:#f56c6c; --el-text-color-primary:#303133; --el-text-color-regular:#606266; --el-text-color-secondary:#909399; --el-text-color-placeholder:#a8abb2; --el-text-color-disabled:#c0c4cc; }
.im-contact-page [class~="flex"] { display:flex; }
.im-contact-page [class~="inline-flex"] { display:inline-flex; }
.im-contact-page [class~="flex-1"] { flex:1 1 0%; }
.im-contact-page [class~="flex-col"] { flex-direction:column; }
.im-contact-page [class~="flex-wrap"] { flex-wrap:wrap; }
.im-contact-page [class~="flex-shrink-0"] { flex-shrink:0; }
.im-contact-page [class~="items-center"] { align-items:center; }
.im-contact-page [class~="items-start"] { align-items:flex-start; }
.im-contact-page [class~="justify-center"] { justify-content:center; }
.im-contact-page [class~="justify-between"] { justify-content:space-between; }
.im-contact-page [class~="justify-around"] { justify-content:space-around; }
.im-contact-page [class~="h-full"] { height:100%; }
.im-contact-page [class~="h-14"] { height:56px; }
.im-contact-page [class~="h-7"] { height:28px; }
.im-contact-page [class~="h-px"] { height:1px; }
.im-contact-page [class~="h-[400px]"] { height:400px; }
.im-contact-page [class~="w-full"] { width:100%; }
.im-contact-page [class~="w-16"] { width:64px; }
.im-contact-page [class~="w-7"] { width:28px; }
.im-contact-page [class~="max-w-[320px]"] { max-width:320px; }
.im-contact-page [class~="max-w-[420px]"] { max-width:420px; }
.im-contact-page [class~="min-w-0"] { min-width:0; }
.im-contact-page [class~="relative"] { position:relative; }
.im-contact-page [class~="overflow-hidden"] { overflow:hidden; }
.im-contact-page [class~="object-cover"] { object-fit:cover; }
.im-contact-page [class~="truncate"] { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.im-contact-page [class~="break-words"] { overflow-wrap:break-word; }
.im-contact-page [class~="whitespace-nowrap"] { white-space:nowrap; }
.im-contact-page [class~="cursor-pointer"] { cursor:pointer; }
.im-contact-page [class~="select-none"] { user-select:none; }
.im-contact-page [class~="text-center"] { text-align:center; }
.im-contact-page [class~="font-medium"] { font-weight:500; }
.im-contact-page [class~="font-semibold"] { font-weight:600; }
.im-contact-page [class~="text-xs"],.im-contact-page [class~="text-12px"] { font-size:12px; }
.im-contact-page [class~="text-13px"] { font-size:13px; }
.im-contact-page [class~="text-sm"] { font-size:14px; }
.im-contact-page [class~="text-15px"] { font-size:15px; }
.im-contact-page [class~="text-base"] { font-size:16px; }
.im-contact-page [class~="text-lg"] { font-size:18px; }
.im-contact-page [class~="gap-1"] { gap:4px; }.im-contact-page [class~="gap-1.5"] { gap:6px; }.im-contact-page [class~="gap-2"] { gap:8px; }.im-contact-page [class~="gap-2.5"] { gap:10px; }.im-contact-page [class~="gap-3"] { gap:12px; }.im-contact-page [class~="gap-5"] { gap:20px; }
.im-contact-page [class~="px-1.5"] { padding-left:6px;padding-right:6px; }.im-contact-page [class~="px-2"] { padding-left:8px;padding-right:8px; }.im-contact-page [class~="px-3.5"] { padding-left:14px;padding-right:14px; }.im-contact-page [class~="px-4"] { padding-left:16px;padding-right:16px; }.im-contact-page [class~="px-6"] { padding-left:24px;padding-right:24px; }
.im-contact-page [class~="py-1"] { padding-top:4px;padding-bottom:4px; }.im-contact-page [class~="py-1.5"] { padding-top:6px;padding-bottom:6px; }.im-contact-page [class~="py-2"] { padding-top:8px;padding-bottom:8px; }.im-contact-page [class~="py-2.5"] { padding-top:10px;padding-bottom:10px; }.im-contact-page [class~="py-3"] { padding-top:12px;padding-bottom:12px; }.im-contact-page [class~="py-10"] { padding-top:40px;padding-bottom:40px; }
.im-contact-page [class~="pt-1"] { padding-top:4px; }.im-contact-page [class~="pt-2"] { padding-top:8px; }.im-contact-page [class~="pt-12"] { padding-top:48px; }.im-contact-page [class~="pb-0.5"] { padding-bottom:2px; }
.im-contact-page [class~="mt-1"] { margin-top:4px; }.im-contact-page [class~="mt-2"] { margin-top:8px; }.im-contact-page [class~="mt-2.5"] { margin-top:10px; }.im-contact-page [class~="mt-3"] { margin-top:12px; }.im-contact-page [class~="mt-4"] { margin-top:16px; }.im-contact-page [class~="mt-6"] { margin-top:24px; }.im-contact-page [class~="mt-8"] { margin-top:32px; }
.im-contact-page [class~="mb-1.5"] { margin-bottom:6px; }.im-contact-page [class~="mb-4"] { margin-bottom:16px; }.im-contact-page [class~="ml-1"] { margin-left:4px; }.im-contact-page [class~="mr-2"] { margin-right:8px; }.im-contact-page [class~="my-4"] { margin-top:16px;margin-bottom:16px; }
.im-contact-page [class~="rounded"] { border-radius:4px; }.im-contact-page [class~="rounded-md"] { border-radius:6px; }
.im-contact-page [class~="border-b"] { border-bottom-width:1px; }.im-contact-page [class~="border-b-solid"] { border-bottom-style:solid; }
.im-contact-page [class~="bg-[var(--el-bg-color)]"] { background:var(--el-bg-color); }.im-contact-page [class~="bg-[var(--el-fill-color-light)]"] { background:var(--el-fill-color-light); }.im-contact-page [class~="bg-[var(--el-fill-color-lighter)]"] { background:var(--el-fill-color-lighter); }.im-contact-page [class~="bg-[var(--el-border-color-lighter)]"] { background:var(--el-border-color-lighter); }
.im-contact-page [class~="text-[var(--el-color-primary)]"] { color:var(--el-color-primary); }.im-contact-page [class~="text-[var(--el-color-danger)]"] { color:var(--el-color-danger); }.im-contact-page [class~="text-[var(--el-text-color-primary)]"] { color:var(--el-text-color-primary); }.im-contact-page [class~="text-[var(--el-text-color-regular)]"] { color:var(--el-text-color-regular); }.im-contact-page [class~="text-[var(--el-text-color-secondary)]"] { color:var(--el-text-color-secondary); }.im-contact-page [class~="text-[var(--el-text-color-placeholder)]"] { color:var(--el-text-color-placeholder); }.im-contact-page [class~="text-[var(--el-text-color-disabled)]"] { color:var(--el-text-color-disabled); }.im-contact-page [class~="text-white"] { color:#fff; }
.im-contact-page [class~="opacity-0"] { opacity:0; }.im-contact-page [class~="hover:opacity-75"]:hover { opacity:.75; }.im-contact-page [class~="hover:bg-[var(--el-fill-color-light)]"]:hover { background:var(--el-fill-color-light); }
</style>
