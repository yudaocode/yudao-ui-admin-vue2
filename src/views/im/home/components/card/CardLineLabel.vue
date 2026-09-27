<template>
<!-- 名片单行 inline label：「[icon] 群名片 / 个人名片：xx」；列表摘要 / 引用预览 / 后台预览复用 -->
  <span class="inline-flex gap-1.5 items-center">
    <Icon :icon="labelInfo.icon" :size="iconSize" />
    <span>{{ labelInfo.label }}：{{ card?.name || '' }}</span>
  </span>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue';
import { computed } from 'vue';
import Icon from '@/views/im/home/components/user/ImIcon.vue';
import { getCardLabelInfo } from '@/views/im/utils/message';
const __sfc__ = /*@__PURE__*/_defineComponent({
  ...{
    name: 'ImCardLineLabel'
  },
  components: {
    Icon
  },
  __name: 'CardLineLabel',
  props: {
    card: {
      type: null,
      required: true
    },
    iconSize: {
      type: Number,
      required: false,
      default: 14
    }
  },
  setup(__props, {
    expose: __expose
  }) {
    __expose();
    const props = __props;

    /** 标签 + 图标按 targetType 二分；兜底「个人名片」避免 null 时 UI 空白 */
    const labelInfo = computed(() => getCardLabelInfo(props.card));
    const __returned__ = {
      props,
      labelInfo,
      Icon
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
