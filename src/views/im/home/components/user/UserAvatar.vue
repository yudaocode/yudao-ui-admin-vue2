<template>
  <!--
    通用用户头像组件
    - 有 url 时展示图片；无 url 时展示色卡 + 首字母/首字
    - 点击默认触发 UserInfoCard（clickable）
    - previewable=true 时改为点头像直接放大预览（用于名片 / 详情页等大头像位）
  -->
  <div
    class="relative inline-flex"
    :style="{ cursor: clickable && !previewable ? 'pointer' : 'default' }"
    v-bind="$attrs"
    @click="handleClick"
  >
    <el-image
      v-if="url && previewable"
      class="block overflow-hidden"
      :src="url"
      :preview-src-list="[url]"
      :preview-teleported="true"
      :z-index="previewZIndex"
      :style="imgStyle"
      fit="cover"
    />
    <img
      v-else-if="url"
      class="block overflow-hidden object-cover"
      :src="url"
      :style="imgStyle"
      loading="lazy"
      :alt="name || 'avatar'"
    >
    <div
      v-else
      class="flex items-center justify-center text-white font-medium select-none"
      :style="textStyle"
    >
      {{ avatarText }}
    </div>
    <!-- 允许外部插入装饰，如群聊角标 -->
    <slot />
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import { computed } from 'vue'
import { useImUiStore } from '../../store/uiStore'
import { ImFriendAddSource } from '../../../utils/constants'
import { getAvatarBgColor, getAvatarText } from '../../../utils/user'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImUserAvatar',
    inheritAttrs: false
  },
  __name: 'UserAvatar',
  props: {
    id: {
      type: [String, Number],
      required: false
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
      default: true
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
    },
    user: {
      type: null,
      required: false
    },
    addSource: {
      type: Number,
      required: false,
      default: ImFriendAddSource.SEARCH
    },
    addSourceExtra: {
      type: String,
      required: false
    }
  },
  setup(__props, {
    expose: __expose
  }) {
    __expose()
    const props = __props
    const uiStore = useImUiStore()
    const imgStyle = computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`,
      borderRadius: props.radius
    }))
    const textStyle = computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`,
      fontSize: `${Math.floor(props.size * (avatarText.value.length > 1 ? 0.34 : 0.42))}px`,
      background: textColor.value,
      borderRadius: props.radius
    }))

    /** 色卡首字：中文取 1 个字、英文 / 拉丁取前 2 个字母 */
    const avatarText = computed(() => getAvatarText(props.name))

    /** 色卡底色：按昵称 charCode 哈希取调色板色 */
    const textColor = computed(() => getAvatarBgColor(props.name))

    /** 头像点击：previewable 走 el-image 预览不弹名片；否则按 user / id 任一入参打开名片 */
    function handleClick(e) {
      if (props.previewable) {
        return
      }
      if (!props.clickable) {
        return
      }
      // 情况一：有预传 user 信息：就直接用，省一次接口
      if (props.user) {
        uiStore.openUserInfoCardAtEvent(props.user, e, props.addSource, props.addSourceExtra)
        return
      }
      // 情况二：无预传 user 信息：打开名片，传最小必要信息（id + 昵称 + 头像），位置在鼠标右侧
      const numId = Number(props.id)
      if (!numId || numId <= 0) {
        return
      }
      uiStore.openUserInfoCardAtEvent({
        id: numId,
        nickname: props.name,
        avatar: props.url
      }, e, props.addSource, props.addSourceExtra)
    }
    const __returned__ = {
      props,
      uiStore,
      imgStyle,
      textStyle,
      avatarText,
      textColor,
      handleClick
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
