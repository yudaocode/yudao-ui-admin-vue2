<template>
  <span>
  <template v-for="(segment, _index) in segments">
    <span
      v-if="segment.type === 'mention'"
      :key="`${_index}-mention`"
      class="text-[#576b95]"
      :class="{ 'cursor-pointer hover:underline': isClickableMention(segment) }"
      @click.stop="handleMentionClick(segment, $event)"
      >{{ segment.text }}</span
    >
    <a
      v-else-if="segment.type === 'link'"
      :key="`${_index}-link`"
      :href="segment.href"
      target="_blank"
      rel="noopener noreferrer"
      class="text-[#576b95] hover:underline break-all"
      @click.stop
      >{{ segment.text }}</a
    >
    <span v-else :key="`${_index}-text`">{{ segment.text }}</span>
  </template>
  </span>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue';
import { IM_AT_ALL_USER_ID } from '@/views/im/utils/constants';
import { openMentionUserInfoCardAtEvent } from '@/views/im/utils/user';
const __sfc__ = /*@__PURE__*/_defineComponent({
  ...{
    name: 'ImTipSegments'
  },
  __name: 'TipSegments',
  props: {
    segments: {
      type: Array,
      required: true
    }
  },
  setup(__props, {
    expose: __expose
  }) {
    __expose();

    /** @全体成员是广播 mention，仅高亮配色，不挂可点击交互 */
    function isClickableMention(segment) {
      return segment.userId !== IM_AT_ALL_USER_ID;
    }

    /** mention 段点击：fallbackName 取 segment 文本，避免 friend / member 都查不到时弹空 */
    function handleMentionClick(segment, event) {
      if (!isClickableMention(segment)) {
        return;
      }
      openMentionUserInfoCardAtEvent(segment.userId, event, segment.text);
    }
    const __returned__ = {
      isClickableMention,
      handleMentionClick
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
