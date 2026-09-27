<template>
  <!--
    新的朋友详情面板
    - 已通过 → 直接走 UserInfo 好友详情，跟通讯录里点开好友的体验完全一致
    - 未处理 / 已拒绝 → 申请态面板：头像 + 申请/拒绝对话气泡 + 来源 + 操作按钮
  -->
  <div
    v-if="agreed"
    class="flex justify-center pt-12 px-6"
  >
    <div class="w-full max-w-[320px]">
      <UserInfo
        :user="peerUser"
        :display-name="friendStore.getFriend(peerUserId)?.displayName || ''"
        relation="friend"
        @chat="emit('chat', peerUserId)"
      />
    </div>
  </div>

  <div
    v-else
    class="flex flex-col items-center px-6 pt-12"
  >
    <UserAvatar
      :id="peerUserId"
      :url="peerAvatar"
      :name="peerNickname"
      :size="64"
      :clickable="false"
    />
    <div class="mt-3 text-base font-semibold text-[var(--el-text-color-primary)]">
      {{ peerNickname }}
    </div>

    <!-- 申请理由块：仿微信灰底气泡，按申请方身份前缀；长文本 break-words 折行 -->
    <div
      v-if="request.applyContent"
      class="w-full max-w-[420px] mt-6 px-3.5 py-3 rounded-md bg-[var(--el-fill-color-light)] text-13px text-[var(--el-text-color-primary)] break-words"
    >
      <span class="text-[var(--el-text-color-secondary)]">
        {{ iSentIt ? '我' : peerNickname }}:
      </span>
      <span class="ml-1">{{ request.applyContent }}</span>
    </div>
    <!-- 来源行：label 左、value 右，对齐微信「来源」行 -->
    <div
      v-if="request.addSource"
      class="w-full max-w-[420px] mt-3 flex items-center text-13px text-[var(--el-text-color-secondary)]"
    >
      <span class="w-16 flex-shrink-0 whitespace-nowrap">来源</span>
      <span class="text-[var(--el-text-color-primary)]">
        {{ getDictLabel(DICT_TYPE.IM_FRIEND_ADD_SOURCE, request.addSource) }}
      </span>
    </div>
    <!-- 拒绝理由：label 左、value 右；长文本 break-words 自动折行 -->
    <div
      v-if="refused && request.handleContent"
      class="w-full max-w-[420px] mt-3 flex items-start text-13px text-[var(--el-text-color-secondary)]"
    >
      <span class="w-16 flex-shrink-0 whitespace-nowrap">拒绝理由</span>
      <span class="flex-1 min-w-0 break-words text-[var(--el-text-color-primary)]">
        {{ request.handleContent }}
      </span>
    </div>

    <!-- 操作按钮 -->
    <div class="w-full max-w-[420px] mt-8 flex justify-center">
      <!-- 我发起 + 等待中：禁用「等待对方验证」 -->
      <el-button
        v-if="iSentIt && request.handleResult === ImFriendRequestHandleResult.UNHANDLED"
        disabled
      >
        等待对方验证
      </el-button>
      <!-- 别人加我 + 等待中：同意 / 拒绝 -->
      <template v-if="!iSentIt && request.handleResult === ImFriendRequestHandleResult.UNHANDLED">
        <el-button
          :loading="refusing"
          :disabled="processing"
          @click="handleRefuse"
        >拒绝</el-button>
        <el-button
          type="primary"
          :loading="agreeing"
          :disabled="processing"
          @click="handleAgree"
        >
          同意
        </el-button>
      </template>
      <!-- 已拒绝：占位禁用按钮 -->
      <el-button
        v-if="refused"
        disabled
      >已拒绝</el-button>
    </div>
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import { computed, ref } from 'vue'
import { useMessage } from '@/views/im/utils/messageUi'
import { MessageBox as ElMessageBox } from '@/views/im/utils/messageUi'
import UserAvatar from '../../components/user/UserAvatar.vue'
import UserInfo from '../../components/user/UserInfo.vue'
import { useFriendStore } from '../../store/friendStore'
import { getCurrentUserId } from '../../../utils/session'
import { ImFriendRequestHandleResult } from '../../../utils/constants'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImContactFriendRequestDetail'
  },
  components: {
    UserAvatar,
    UserInfo
  },
  __name: 'FriendRequestDetail',
  props: {
    request: {
      type: null,
      required: true
    }
  },
  emits: ['chat'],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    __expose()
    const props = __props
    const emit = __emit
    const friendStore = useFriendStore()
    const message = useMessage()

    /** 当前登录用户编号；用 computed 包一层，切账号后随 wsCache 重取，避免顶层求值在 keep-alive 实例里持有旧 id */
    const currentUserId = computed(() => getCurrentUserId())

    /** 是不是我发起的（fromUserId === currentUserId） */
    const iSentIt = computed(() => props.request.fromUserId === currentUserId.value)

    /** 是否「已拒绝」态：模板里多处用到，computed 一次省得到处写枚举比对 */
    const refused = computed(() => props.request.handleResult === ImFriendRequestHandleResult.REFUSED)

    /** 是否「已通过」态：转走 UserInfo 好友详情入口 */
    const agreed = computed(() => props.request.handleResult === ImFriendRequestHandleResult.AGREED)

    /** 对端的用户编号 / 昵称 / 头像 */
    const peerUserId = computed(() => iSentIt.value ? props.request.toUserId : props.request.fromUserId)
    const peerNickname = computed(() => iSentIt.value ? props.request.toNickname || String(props.request.toUserId) : props.request.fromNickname || String(props.request.fromUserId))
    const peerAvatar = computed(() => iSentIt.value ? props.request.toAvatar : props.request.fromAvatar)

    /** 透给 UserInfo 的最小用户信息；UserInfo 内部会按 id 调 getSimpleUser 补齐性别 / 部门 */
    const peerUser = computed(() => ({
      id: peerUserId.value,
      nickname: peerNickname.value,
      avatar: peerAvatar.value
    }))

    // 各自的 loading 用于按钮 spinner 显示；processing 是跨按钮互斥锁，避免同意 / 拒绝并发提交同一申请
    const agreeing = ref(false)
    const refusing = ref(false)
    const processing = ref(false)

    /** 同意申请：互斥锁 + 状态二次校验，避免并发 / 服务端已处理后再次提交 */
    async function handleAgree() {
      const requestId = props.request.id
      if (processing.value) {
        return
      }
      if (props.request.handleResult !== ImFriendRequestHandleResult.UNHANDLED) {
        return
      }
      processing.value = true
      agreeing.value = true
      try {
        await friendStore.agreeFriendRequest(requestId)
        message.success('已同意好友申请')
      } catch (error) {
        console.warn('[IM FriendRequestDetail] 同意好友申请失败', error)
      } finally {
        agreeing.value = false
        processing.value = false
      }
    }

    /** 拒绝申请：弹 prompt 收集可选拒绝理由（点取消则中止），随后调 store 落库 + 提示 */
    async function handleRefuse() {
      const requestId = props.request.id
      if (processing.value) {
        return
      }
      if (props.request.handleResult !== ImFriendRequestHandleResult.UNHANDLED) {
        return
      }
      // 1. 弹 prompt 收集拒绝理由（最多 255 字）；用户点「取消」会 reject，中止后续流程
      let handleContent
      try {
        const result = await ElMessageBox.prompt('可填写拒绝理由（选填）', '拒绝好友申请', {
          confirmButtonText: '拒绝',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputValue: '',
          inputPlaceholder: '不填则不告知对方原因',
          inputValidator: value => (value || '').length <= 255 || '最多 255 个字符'
        })
        handleContent = result.value || undefined
      } catch {
        return
      }
      // 2. prompt 期间状态可能被跨端改成 AGREED / REFUSED，再校验一次避免重复提交
      if (processing.value) {
        return
      }
      if (props.request.handleResult !== ImFriendRequestHandleResult.UNHANDLED) {
        return
      }
      processing.value = true
      refusing.value = true
      try {
        await friendStore.refuseFriendRequest(requestId, handleContent)
        message.success('已拒绝好友申请')
      } catch (error) {
        console.warn('[IM FriendRequestDetail] 拒绝好友申请失败', error)
      } finally {
        refusing.value = false
        processing.value = false
      }
    }
    const __returned__ = {
      props,
      emit,
      friendStore,
      message,
      currentUserId,
      iSentIt,
      refused,
      agreed,
      peerUserId,
      peerNickname,
      peerAvatar,
      peerUser,
      agreeing,
      refusing,
      processing,
      handleAgree,
      handleRefuse,
      UserAvatar,
      UserInfo,
      get ImFriendRequestHandleResult() {
        return ImFriendRequestHandleResult
      },
      get DICT_TYPE() {
        return DICT_TYPE
      },
      get getDictLabel() {
        return getDictLabel
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
