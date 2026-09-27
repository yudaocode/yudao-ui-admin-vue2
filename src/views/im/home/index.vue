<template>
<!--
    IM 外层容器：聊天模块的全屏沉浸式壳
    - 左侧 ToolBar：头像 + 三 Tab（消息/好友/群聊）+ 底部设置
    - 右侧 <router-view>：按路由渲染 MessagePage / FriendPage / GroupPage
    - 挂载全局弹层：UserInfoCard / GroupInfoCard / ContextMenu
  -->
  <div class="im-home-shell flex w-full h-full overflow-hidden">
    <ToolBar />
    <!--
      keep-alive 缓存子页面：
      - 切 Tab 不重建组件，MessagePanel 滚动位置、输入框草稿等 UI 状态不丢
      - Vue 3 里 keep-alive 不能直接包 <router-view>（会有警告），必须走 v-slot 拿 Component
    -->
    <keep-alive v-if="childRouteReady">
      <router-view />
    </keep-alive>

    <!-- 全局弹层：由 useImUiStore 统一调度 -->
    <UserInfoCard />
    <GroupInfoCard />
    <ContextMenu />

    <!-- 实时通话浮层；监听 rtcStore 全局状态，可在任意 IM 子页弹出 -->
    <RtcCallContainer />
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue';
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import router from '@/router';
import { useConversationStore } from './store/conversationStore';
import { useMessageStore } from './store/messageStore';
import { useFriendStore } from './store/friendStore';
import { useGroupStore } from './store/groupStore';
import { useGroupRequestStore } from './store/groupRequestStore';
import { useFaceStore } from './store/faceStore';
import { useChannelStore } from './store/channelStore';
import { useImWebSocketStore } from './store/websocketStore';
import { useRtcStore } from './store/rtcStore';
import { useMessagePuller } from './composables/useMessagePuller';
import { useMessageSender } from './composables/useMessageSender';
import { useVoicePlayer } from './composables/useVoicePlayer';
import { ImConversationType } from '../utils/constants';
import { closeDb, initDb, StorageKeys } from '../utils/db';
import { clearMessageSyncState } from '../utils/messageSync';
import { clearResourceRequests } from '../utils/resourceRequest';
import ToolBar from './components/ToolBar.vue';
import UserInfoCard from './components/user/UserInfoCard.vue';
import GroupInfoCard from './components/group/GroupInfoCard.vue';
import ContextMenu from './components/ContextMenu.vue';
import RtcCallContainer from './components/rtc/RtcCallContainer.vue';
import './styles/vue3-utilities.css';

// 模块级单例协调前后两个 IM 页面实例
let activeImShellOwner = null;
const __sfc__ = /*@__PURE__*/_defineComponent({
  ...{
    name: 'ImIndex'
  },
  components: {
    ToolBar,
    UserInfoCard,
    GroupInfoCard,
    ContextMenu,
    RtcCallContainer
  },
  __name: 'index',
  setup(__props, {
    expose: __expose
  }) {
    __expose();
    const shellOwner = {}; // 当前 IM 页面壳 owner；旧卸载回调不得停止后来重新挂载的壳
    activeImShellOwner = shellOwner;
    const route = router.currentRoute;
    const appStore = {
      get getTitle() {
        return process.env.VUE_APP_TITLE;
      }
    };
    const conversationStore = useConversationStore();
    const messageStore = useMessageStore();
    const friendStore = useFriendStore();
    const groupStore = useGroupStore();
    const groupRequestStore = useGroupRequestStore();
    const faceStore = useFaceStore();
    const channelStore = useChannelStore();
    const wsStore = useImWebSocketStore();
    const rtcStore = useRtcStore();
    const {
      pullOnce,
      cancelPull
    } = useMessagePuller();
    const {
      readActive,
      syncPrivateReadStatus
    } = useMessageSender();
    const voicePlayer = useVoicePlayer();
    const childRouteReady = ref(false); // 子路由是否允许挂载
    let disposed = false; // 当前 IM 主壳是否已经卸载

    /** 判断当前首页初始化任务仍属于本组件 */
    function isInitializationActive() {
      return !disposed;
    }

    /** 初始化：先吃本地缓存让首屏立即渲染，再远端刷新最新数据，最后建实时通信拉离线消息 */
    onMounted(async () => {
      // 1.1 整段 loading=true 阻断会话列表抖动写盘 + WebSocket 普通消息进缓冲，避免 connect 到 pullOnce 之间收到的实时消息推进 maxId 导致 pull 跳过断线积压消息
      conversationStore.loading = true;
      try {
        await initDb();
        if (!isInitializationActive()) {
          return;
        }
        wsStore.connect();
        // 0.1 系统表情包后台预拉：独立链路与本地恢复并发，失败仅记日志
        void faceStore.ensureFacePackList().catch(e => console.warn('[IM] 后台预拉表情包失败', e));
        // 1.3 多个 store 并发从 IDB 读取本地缓存
        const [,, hasFriendRows, hasGroupRows, hasChannelRows] = await Promise.all([conversationStore.loadConversationList(), messageStore.loadMessageCursorList(), friendStore.loadFriendData(), groupStore.loadGroupList(), channelStore.loadChannelList(), groupRequestStore.loadGroupRequestList()]);
        if (!isInitializationActive()) {
          return;
        }
        childRouteReady.value = true;
        groupStore.markAllGroupActiveCallsExpired();
        groupStore.markAllGroupMembersExpired();
        // 1.4 我管理的群下未处理加群申请红点：首登用 unhandled-list（服务端直接过滤未处理，语义精准、启动轻）；
        //     pullGroupRequests 只在重连 / 后续补偿时跑（见 useMessagePuller.pullStateEvents），不进首登主链路
        void groupRequestStore.fetchUnhandledGroupRequestList().catch(e => console.warn('[IM] 拉取未处理加群申请失败', e));

        // 2. 好友主数据恢复走 pull；群列表用快照刷新，覆盖离线期间自己的入群 / 退群状态变化
        // 2.1 有缓存：异步背景增量刷新，失败仅记日志（IDB 数据已经够撑首屏，pullOnce 也能正常入库）
        // 2.2 无缓存（首登 / 切账号回切）：必须 await + 失败抛出中断本轮 onMounted，
        //     否则 pullOnce 会用 senderId 数字给会话起名落到 IDB 后续基本无法自愈；无缓存分支并发 Promise.all 省一个 RTT
        const requiredFetches = [];
        if (hasFriendRows) {
          void friendStore.pullFriends().catch(e => console.warn('[IM] 后台增量拉好友失败', e));
        } else {
          requiredFetches.push(friendStore.pullFriends());
        }
        if (hasGroupRows) {
          void groupStore.fetchGroupList(true).catch(e => console.warn('[IM] 后台刷新群列表失败', e));
        } else {
          requiredFetches.push(groupStore.fetchGroupList(true));
        }
        // 2.3 频道无增量 pull 接口，继续走 list
        if (hasChannelRows) {
          void channelStore.fetchChannelList().catch(e => console.warn('[IM] 后台刷频道列表失败', e));
        } else {
          requiredFetches.push(channelStore.fetchChannelList());
        }
        // 2.4 执行加载
        if (requiredFetches.length > 0) {
          await Promise.all(requiredFetches);
          if (!isInitializationActive()) {
            return;
          }
        }

        // 2.5 好友申请增量补偿：首登也要跑，离线期间好友申请变更不会影响好友主表
        void friendStore.pullFriendRequests().catch(e => console.warn('[IM] 后台增量拉好友申请失败', e));

        // 3. 会话读位置先补偿，消息入库时可直接过滤已读历史消息
        await conversationStore.pullConversationReads().catch(e => {
          console.warn('[IM] 拉取会话读位置失败', e);
        });
        if (!isInitializationActive()) {
          return;
        }

        // 4. 实时通信：建 WebSocket 长连接 + 拉离线消息（pullOnce finally 把 loading 归位）
        await pullOnce();
        if (!isInitializationActive()) {
          return;
        }

        // 5. 默认选中第一个会话；若置顶分组处于折叠态，需跳过被折叠隐藏的置顶项，避免自动展开折叠
        const sorted = conversationStore.getSortedConversationList;
        const firstVisible = pickFirstVisibleConversation(sorted);
        if (firstVisible && !conversationStore.activeConversation) {
          conversationStore.setActiveConversation(firstVisible);
        }
      } catch (e) {
        if (!isInitializationActive()) {
          return;
        }
        // 1. 首拉失败：手动复位 loading（pullOnce 没跑到，它的 finally 兜不到这里），否则后续会话列表写入全被早 return 阻断
        // 2. WebSocket 不在这里 disconnect——路由离开会走 onUnmounted 自然清理，用户也可以刷新重试
        conversationStore.loading = false;
        console.error('[IM] 初始化失败', e);
      }
    });

    /**
     * 选首屏自动激活的会话；置顶分组折叠时跳过被折叠隐藏的置顶项，避免激活后被自动顶上来
     *
     * 折叠态判定只看用户开关；非置顶 / 有未读的置顶项始终可见，全是可折叠置顶时回退到 sorted[0] 兜底
     */
    function pickFirstVisibleConversation(sorted) {
      if (sorted.length === 0) {
        return undefined;
      }
      const pinnedExpanded = localStorage.getItem(StorageKeys.localStorage.conversationPinnedExpanded) === 'true';
      if (pinnedExpanded) {
        return sorted[0];
      }
      return sorted.find(c => !c.top || !c.silent && (c.unreadCount || 0) > 0) ?? sorted[0];
    }

    /** 标签关闭前 flush 草稿队列；debounce 默认 trail-edge 触发，最后一次输入可能还压在队列里 */
    function onBeforeUnload() {
      void conversationStore.flushConversationDraftSave();
    }
    window.addEventListener('beforeunload', onBeforeUnload);

    /** 离开 IM 主壳：取消拉取、断开实时资源、保存草稿并关闭本地库 */
    onUnmounted(async () => {
      disposed = true;
      cancelPull();
      rtcStore.reset();
      rtcStore.clearGroupCallCache();
      // 模块级单例 audio 不会随视图卸载自动停，主动停掉避免切路由后语音继续响
      voicePlayer.stop();
      window.removeEventListener('beforeunload', onBeforeUnload);
      await conversationStore.flushConversationDraftSave();
      // 旧壳等待草稿期间可能已有新壳挂载，不能停止新壳复用的物理资源
      if (activeImShellOwner !== shellOwner) {
        return;
      }
      // 先释放旧壳 owner；后续 await 后若新壳接管，则停止清理共享资源
      activeImShellOwner = null;
      wsStore.disconnect();
      await clearResourceRequests();
      if (activeImShellOwner) {
        return;
      }
      await clearMessageSyncState(() => !activeImShellOwner);
      if (activeImShellOwner) {
        return;
      }
      await closeDb();
      if (activeImShellOwner) {
        return;
      }
      messageStore.clear();
      conversationStore.clear();
      friendStore.clear();
      groupStore.clear();
      channelStore.clear();
      groupRequestStore.clear();
      faceStore.clear();
    });

    /**
     * 当前会话切换：本地清零未读 + 上报后端已读 + 私聊补"对方已读到哪条"
     *
     * type+targetId 一起监听：私聊与群聊 id 同号时切换也能触发；其它会话已读状态由 WebSocket
     * READ / RECEIPT 事件被动同步。私聊补一次拉对方已读位置，弥补离线 / 多端漏掉的 RECEIPT 推送
     */
    watch(() => [conversationStore.activeConversation?.type, conversationStore.activeConversation?.targetId], async ([type, targetId]) => {
      if (!targetId || !type) {
        return;
      }
      try {
        // 本地清零未读 + 上报后端已读，让其它端 / 对方 UI 同步
        await readActive();
        // 私聊补一次"对方已读到哪条"，弥补离线 / 多端漏掉的 RECEIPT 推送
        if (type === ImConversationType.PRIVATE) {
          await syncPrivateReadStatus(targetId);
        }
      } catch (error) {
        console.warn('[IM] 会话已读同步失败', error);
      }
    });

    /**
     * 浏览器标签 title 拼上未读数前缀；例：(63条未读)芋道源码
     *
     * 路由切换时 router.afterEach 会调 useTitle 重置 title；用 nextTick 排在它之后再覆盖
     * 一并监听 route.fullPath，IM 子路由切换（消息 / 通讯录）也能重新加上前缀
     */
    watch([() => conversationStore.getTotalUnreadCount, () => route.fullPath], ([count]) => {
      nextTick(() => {
        const base = appStore.getTitle;
        document.title = count > 0 ? `(${count > 99 ? '99+' : count}条未读)${base}` : base;
      });
    }, {
      immediate: true
    });
    const __returned__ = {
      get activeImShellOwner() {
        return activeImShellOwner;
      },
      set activeImShellOwner(v) {
        activeImShellOwner = v;
      },
      shellOwner,
      route,
      appStore,
      conversationStore,
      messageStore,
      friendStore,
      groupStore,
      groupRequestStore,
      faceStore,
      channelStore,
      wsStore,
      rtcStore,
      pullOnce,
      cancelPull,
      readActive,
      syncPrivateReadStatus,
      voicePlayer,
      childRouteReady,
      get disposed() {
        return disposed;
      },
      set disposed(v) {
        disposed = v;
      },
      isInitializationActive,
      pickFirstVisibleConversation,
      onBeforeUnload,
      ToolBar,
      UserInfoCard,
      GroupInfoCard,
      ContextMenu,
      RtcCallContainer
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
