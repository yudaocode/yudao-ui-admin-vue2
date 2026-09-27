<template>
<!--
    引用预览块（对齐微信 PC）：2px 竖线作为「引用」视觉标识 + 紧凑内容预览
    - clickable=true（气泡内）：点击触发 locate emit；撤回态禁用跳转
    - closable=true（输入条）：尾部 × 关闭按钮
    - mirrored=true（自己发送的气泡）：竖线镜像到右侧，与气泡同侧
    - 内容预览（与主气泡同源，不缩写成「[文件]/[语音]」）：
      - 文本：截断后纯文字
      - 图片 / 视频：缩略图（IMAGE 用 thumbnailUrl/url，VIDEO 用 coverUrl）
      - 文件：file icon + 文件名 + 大小
      - 语音：audio icon + 时长
      - 撤回（命中本地缓存且 type === RECALL）：「原消息已撤回」斜体灰字
  -->
  <div
    class="flex w-fit gap-1.5 items-center min-w-0 py-0.5 text-12px text-[var(--el-text-color-secondary)] rounded transition-colors"
    :class="[
      mirrored
        ? 'pl-1 pr-2 border-r-2 border-r-solid border-r-[var(--el-border-color)]'
        : 'pl-2 pr-1 border-l-2 border-l-solid border-l-[var(--el-border-color)]',
      {
        'cursor-pointer hover:text-[var(--el-text-color-primary)]': clickable && !isRecalled,
        'hover:bg-[var(--el-fill-color-light)]': (clickable && !isRecalled) || closable
      }
    ]"
    @click="onClick"
  >
    <span class="flex-shrink-0">{{ senderName }}:</span>

    <!-- 撤回降级 -->
    <span v-if="isRecalled" class="italic">原消息已撤回</span>

    <!-- 文本 -->
    <span v-else-if="isText" class="min-w-0 line-clamp-2 break-words">{{ textPreview }}</span>

    <!-- 文件：icon + 文件名 + 大小 -->
    <template v-else-if="isFile">
      <Icon :icon="fileIcon.icon" :color="fileIcon.color" :size="14" class="flex-shrink-0" />
      <span v-if="parsedPayload?.name" class="min-w-0 line-clamp-2 break-words">
        {{ parsedPayload.name }}
      </span>
      <span
        v-if="parsedPayload?.size"
        class="flex-shrink-0 text-[var(--el-text-color-placeholder)]"
      >
        {{ formatFileSize(parsedPayload.size) }}
      </span>
    </template>

    <!-- 语音：audio icon + 时长 -->
    <template v-else-if="isVoice">
      <Icon icon="ant-design:audio-outlined" :size="14" class="flex-shrink-0" />
      <span v-if="parsedPayload?.duration" class="flex-shrink-0">
        {{ formatSeconds(parsedPayload.duration) }}
      </span>
    </template>

    <!-- 名片 -->
    <CardLineLabel
      v-else-if="isCard"
      :card="parsedPayload"
      class="min-w-0 line-clamp-2 break-words"
    />

    <!-- 表情贴图：缩略图 + name（无 name 仅显示 [表情]） -->
    <template v-else-if="isFace">
      <span class="flex-shrink-0">[表情]</span>
      <span v-if="parsedPayload?.name" class="min-w-0 line-clamp-2 break-words">
        {{ parsedPayload.name }}
      </span>
    </template>

    <!-- 频道素材：[频道] + 标题 + 封面缩略图 -->
    <template v-else-if="isMaterial">
      <span class="flex-shrink-0">[频道]</span>
      <span v-if="parsedPayload?.title" class="min-w-0 line-clamp-2 break-words">
        {{ parsedPayload.title }}
      </span>
    </template>

    <!-- 图片 / 视频 / 表情贴图 / 频道素材缩略图 -->
    <img
      v-if="thumbnailUrl"
      :src="thumbnailUrl"
      class="flex-shrink-0 object-cover w-6 h-6 rounded"
      alt=""
    />

    <!-- 关闭按钮 -->
    <button
      v-if="closable"
      type="button"
      class="flex-shrink-0 inline-flex items-center justify-center w-4 h-4 cursor-pointer rounded-full bg-transparent border-none text-[var(--el-text-color-secondary)] hover:bg-[var(--el-fill-color)] hover:text-[var(--el-text-color-primary)]"
      @click.stop="$emit('close')"
    >
      <Icon icon="ant-design:close-outlined" :size="10" />
    </button>
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue';
import { computed } from 'vue';
import Icon from '@/views/im/home/components/user/ImIcon.vue';
import { formatSeconds } from '@/utils/formatTime';
import { formatFileSize } from '@/utils/file';
import { useConversationStore } from '../../../../store/conversationStore';
import { useMessageStore } from '../../../../store/messageStore';
import { getSenderDisplayName } from '@/views/im/utils/user';
import { ImContentType } from '@/views/im/utils/constants';
import { getClientConversationId } from '@/views/im/utils/db';
import CardLineLabel from '@/views/im/home/components/card/CardLineLabel.vue';
import { parseMessage, getFileIconInfo } from '@/views/im/utils/message';
const MAX_TEXT_PREVIEW_LEN = 60;
const __sfc__ = /*@__PURE__*/_defineComponent({
  ...{
    name: 'ImReplyPreview'
  },
  components: {
    Icon,
    CardLineLabel
  },
  __name: 'ReplyPreview',
  props: {
    quote: {
      type: null,
      required: true
    },
    clickable: {
      type: Boolean,
      required: false,
      default: false
    },
    closable: {
      type: Boolean,
      required: false,
      default: false
    },
    mirrored: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ["locate", "close"],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    __expose();

    /** 文本摘要在引用块里展示的最大字符数 */
    const props = __props;
    const emit = __emit;
    const conversationStore = useConversationStore();
    const messageStore = useMessageStore();

    /** 在当前会话消息列表里查找原消息,仅用于实时判断是否已撤回;摘要 / 缩略图都从 quote.content 直接派生 */
    const liveMessage = computed(() => {
      const conversation = conversationStore.activeConversation;
      if (!conversation || !props.quote.messageId) {
        return undefined;
      }
      return messageStore.getMessages(getClientConversationId(conversation.type, conversation.targetId)).find(message => message.id === props.quote.messageId);
    });

    /** 命中本地缓存且 type === RECALL 才判定为已撤回;不在缓存的当快照仍有效 */
    const isRecalled = computed(() => liveMessage.value?.type === ImContentType.RECALL);

    /** 渲染时实时算,与气泡上方显示名走同一套规则,避免备注变更后引用块陈旧 */
    const senderName = computed(() => {
      const conversation = conversationStore.activeConversation;
      if (!conversation) {
        return '';
      }
      return getSenderDisplayName(props.quote.senderId, conversation.type, conversation.targetId);
    });

    /** quote.content 解析一次缓存，让多个 computed 复用，长会话每条引用气泡少一次 JSON.parse */
    const parsedPayload = computed(() => parseMessage(props.quote.content));
    const isText = computed(() => props.quote.type === ImContentType.TEXT);
    const isFile = computed(() => props.quote.type === ImContentType.FILE);
    const isVoice = computed(() => props.quote.type === ImContentType.VOICE);
    const isCard = computed(() => props.quote.type === ImContentType.CARD);
    const isFace = computed(() => props.quote.type === ImContentType.FACE);
    const isMaterial = computed(() => props.quote.type === ImContentType.MATERIAL);

    /** 文本超过 MAX_TEXT_PREVIEW_LEN 截断，长内容不撑爆引用块 */
    const textPreview = computed(() => {
      const text = parsedPayload.value?.content ?? '';
      return text.length <= MAX_TEXT_PREVIEW_LEN ? text : `${text.substring(0, MAX_TEXT_PREVIEW_LEN)}…`;
    });

    /** 文件 icon：按扩展名挑色，跟主气泡渲染同源 */
    const fileIcon = computed(() => getFileIconInfo(parsedPayload.value?.name));

    /** 缩略图 URL：图片 / 视频 / 表情贴图 / 频道素材封面从 quote.content 直接取，不依赖本地缓存 */
    const thumbnailUrl = computed(() => {
      if (isRecalled.value) {
        return undefined;
      }
      const {
        type
      } = props.quote;
      if (type === ImContentType.IMAGE) {
        return parsedPayload.value?.thumbnailUrl || parsedPayload.value?.url;
      }
      if (type === ImContentType.VIDEO || type === ImContentType.MATERIAL) {
        return parsedPayload.value?.coverUrl;
      }
      if (type === ImContentType.FACE) {
        return parsedPayload.value?.url;
      }
      return undefined;
    });

    /** 仅 clickable 且未撤回时触发跳转 */
    function onClick() {
      if (!props.clickable || isRecalled.value) {
        return;
      }
      emit('locate', props.quote.messageId);
    }
    const __returned__ = {
      MAX_TEXT_PREVIEW_LEN,
      props,
      emit,
      conversationStore,
      messageStore,
      liveMessage,
      isRecalled,
      senderName,
      parsedPayload,
      isText,
      isFile,
      isVoice,
      isCard,
      isFace,
      isMaterial,
      textPreview,
      fileIcon,
      thumbnailUrl,
      onClick,
      Icon,
      get formatSeconds() {
        return formatSeconds;
      },
      get formatFileSize() {
        return formatFileSize;
      },
      CardLineLabel
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
