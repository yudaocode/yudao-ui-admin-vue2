<template>
<!--
    分页增量滚动容器
    - 滚到底部自动 page++，直到全部渲染完
    - 通过 slot 暴露每一项，让调用方自己决定渲染
  -->
  <el-scrollbar ref="scrollbarRef" class="w-full h-full">
    <div
      v-for="(item, idx) in displayItems"
      :key="resolveItemKey(item, idx)"
      class="im-paged-scroller__item"
    >
      <slot :item="item" :index="idx"></slot>
    </div>
    <div v-if="showFooter" class="py-3 text-xs text-center text-[var(--el-text-color-secondary)]">
      已到底部
    </div>
  </el-scrollbar>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue';
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Scrollbar as ElScrollbar } from 'element-ui';
const __sfc__ = /*@__PURE__*/_defineComponent({
  ...{
    name: 'ImPagedScroller'
  },
  __name: 'PagedScroller',
  props: {
    items: {
      type: Array,
      required: true
    },
    pageSize: {
      type: Number,
      required: false,
      default: 30
    },
    threshold: {
      type: Number,
      required: false,
      default: 30
    },
    itemKey: {
      type: String,
      required: false
    }
  },
  setup(__props, {
    expose: __expose
  }) {
    const props = __props;

    /** 解析每条 item 的 :key：caller 传 itemKey 则按字段取，无效 / 缺失回退索引，避免传错字段时全表 undefined key */
    function resolveItemKey(item, idx) {
      if (!props.itemKey || item == null || typeof item !== 'object') {
        return idx;
      }
      const value = item[props.itemKey];
      return typeof value === 'string' || typeof value === 'number' ? value : idx;
    }
    const scrollbarRef = ref(null);
    const page = ref(1);
    const displayItems = computed(() => {
      const limit = Math.min(page.value * props.pageSize, props.items.length);
      return props.items.slice(0, limit);
    });
    const allLoaded = computed(() => displayItems.value.length >= props.items.length);

    /** 仅当超过一页时才显示「已到底部」，避免短列表也出现这条提示 */
    const showFooter = computed(() => allLoaded.value && props.items.length > props.pageSize);

    // el-scrollbar 根节点是 overflow:hidden 的，真正的滚动容器是内部 .el-scrollbar__wrap
    let wrapEl = null;
    onMounted(() => {
      wrapEl = scrollbarRef.value?.$el?.querySelector('.el-scrollbar__wrap') ?? null;
      wrapEl?.addEventListener('scroll', onScroll);
    });
    onBeforeUnmount(() => {
      wrapEl?.removeEventListener('scroll', onScroll);
    });

    /** 切换数据源（如切会话）时重置分页：避免新列表沿用旧 page，首屏出现空段 */
    watch(() => props.items, () => {
      page.value = 1;
    });

    /** 滚到距底 threshold 内时自增 page，扩出下一段切片 */
    function onScroll(e) {
      const el = e.target;
      if (el.scrollTop + el.clientHeight < el.scrollHeight - props.threshold) {
        return;
      }
      if (allLoaded.value) {
        return;
      }
      page.value++;
    }
    __expose({
      /** 手动滚到顶部 */
      scrollTop: () => {
        if (wrapEl) {
          wrapEl.scrollTop = 0;
        }
      },
      /** 手动滚到底部 */
      scrollBottom: () => {
        if (wrapEl) {
          wrapEl.scrollTop = wrapEl.scrollHeight;
        }
      }
    });
    const __returned__ = {
      props,
      resolveItemKey,
      scrollbarRef,
      page,
      displayItems,
      allLoaded,
      showFooter,
      get wrapEl() {
        return wrapEl;
      },
      set wrapEl(v) {
        wrapEl = v;
      },
      onScroll,
      get ElScrollbar() {
        return ElScrollbar;
      }
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
<style scoped>
.im-paged-scroller__item {
  display: contents;
}
</style>
