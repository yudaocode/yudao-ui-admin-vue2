<template>
  <!-- url 非空走原图；url 空时取前 9 个成员头像拼九宫格 dataURL，成员未在 store 缓存时走色卡兜底 -->
  <UserAvatar
    :url="finalUrl"
    :name="name"
    :size="size"
    :radius="radius"
    :clickable="clickable"
    :previewable="previewable"
    :preview-z-index="previewZIndex"
  />
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import { computed, ref, watch } from 'vue'
import UserAvatar from '../user/UserAvatar.vue'
import { useFriendStore } from '../../store/friendStore'
import { useGroupStore } from '../../store/groupStore'
import { buildGroupAvatar, getCachedGroupAvatar, setCachedGroupAvatar } from '../../../utils/group'
import { getMemberDisplayName } from '../../../utils/user'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImGroupAvatar'
  },
  components: {
    UserAvatar
  },
  __name: 'GroupAvatar',
  props: {
    groupId: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    size: {
      type: Number,
      required: false,
      default: 42
    },
    radius: {
      type: String,
      required: false,
      default: '15%'
    },
    clickable: {
      type: Boolean,
      required: false,
      default: false
    },
    previewable: {
      type: Boolean,
      required: false,
      default: false
    },
    previewZIndex: {
      type: Number,
      required: false,
      default: 2000
    }
  },
  setup(__props, {
    expose: __expose
  }) {
    __expose()
    const props = __props
    const friendStore = useFriendStore()
    const groupStore = useGroupStore()
    const mergedUrl = ref('')
    // 竞态保护：丢弃过期 await 结果
    let mergeToken = 0

    /** 按容器 size × DPR 算 canvas 实际像素，避免 2x / 3x retina 屏拼图糊；DPR 封顶 3 防止超高分辨率画布过大 */
    function getTargetSize(size) {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      return Math.max(Math.round(size * dpr), 64)
    }

    /** store 里整群成员是否「完整加载」过；只在为 true 时才拼图，避免列表场景批量发接口 */
    const loadedMembers = computed(() => {
      const g = groupStore.getGroup(props.groupId)
      if (!g?.membersLoaded || !g.members) {
        return null
      }
      return g.members
    })

    /** 前 9 个成员的拼图入参；name 走 getMemberDisplayName 口径（好友备注 > 群昵称 > 真实昵称） */
    const memberItems = computed(() => {
      const members = loadedMembers.value
      if (!members) {
        return []
      }
      return members.slice(0, 9).map(m => ({
        avatar: m.avatar || '',
        name: getMemberDisplayName(m, friendStore.getFriend(m.userId))
      }))
    })

    /** 成员快照签名：拼 (avatar, name) 字段，原地修改任一字段都会让 watch 重算 */
    const memberSignature = computed(() => memberItems.value.map(it => `${it.avatar}#${it.name}`).join('|'))

    /** 走 buildGroupAvatar 拼图并写回 mergedUrl；mergeToken 校验避免老 await 覆盖新结果 */
    async function applyMerge(key, targetSize) {
      const myToken = ++mergeToken
      const cached = getCachedGroupAvatar(key)
      if (cached) {
        mergedUrl.value = cached
        return
      }
      const dataUrl = await buildGroupAvatar(memberItems.value, {
        targetSize
      })
      if (myToken !== mergeToken) {
        return
      }
      if (dataUrl) {
        setCachedGroupAvatar(key, dataUrl)
      }
      mergedUrl.value = dataUrl
    }
    watch(() => [props.url, props.groupId, props.size, memberSignature.value], ([url, groupId, size, signature]) => {
      if (url) {
        mergedUrl.value = ''
        return
      }
      if (!signature) {
        mergeToken++
        mergedUrl.value = ''
        groupStore.loadGroupMemberList(groupId)
        return
      }
      const targetSize = getTargetSize(size)
      const key = `${groupId}:${targetSize}:${signature}`
      applyMerge(key, targetSize)
    }, {
      immediate: true
    })

    /** 最终展示 url：服务端 url 优先 → 拼图 → 空字符串（让 UserAvatar 走色卡） */
    const finalUrl = computed(() => props.url || mergedUrl.value)
    const __returned__ = {
      props,
      friendStore,
      groupStore,
      mergedUrl,
      get mergeToken() {
        return mergeToken
      },
      set mergeToken(v) {
        mergeToken = v
      },
      getTargetSize,
      loadedMembers,
      memberItems,
      memberSignature,
      applyMerge,
      finalUrl,
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
