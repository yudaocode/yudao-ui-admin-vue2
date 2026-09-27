<template>
  <!--
    群单行项
    - 头像 + 群名
    - 选中态 active
  -->
  <div
    class="relative flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--el-fill-color)]"
    :class="{ '!bg-[#d9ecff] dark:!bg-[var(--el-color-primary-light-8)]': active }"
    @click="$emit('click', group)"
  >
    <GroupAvatar
      :group-id="group.id"
      :url="group.showImage || group.showImageThumb"
      :name="group.showGroupName || group.name"
      :size="42"
    />
    <div class="flex flex-1 min-w-0">
      <!-- 单行展示群名；成员数仅在群详情面板展示，列表里不重复 -->
      <div class="overflow-hidden text-sm truncate text-[var(--el-text-color-primary)]">
        {{ group.showGroupName || group.name }}
      </div>
    </div>
    <slot />
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import GroupAvatar from './GroupAvatar.vue'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImGroupItem'
  },
  components: {
    GroupAvatar
  },
  __name: 'GroupItem',
  props: {
    group: {
      type: null,
      required: true
    },
    active: {
      type: Boolean,
      required: false
    }
  },
  emits: ['click'],
  setup(__props, {
    expose: __expose
  }) {
    __expose()
    const __returned__ = {
      GroupAvatar
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
