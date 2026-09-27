<template>
  <!--
    通讯录 - 群聊详情
    - 内容走共享 <GroupInfo>，与 GroupInfoCard 浮层用同一份组件
    - 通讯录里都是已加群（GroupInfo 内部按 groupStore 推导）；chat 抛上去由父级承接
  -->
  <div class="pt-12 px-6">
    <GroupInfo
      :group="group"
      @chat="emit('chat', $event)"
    />
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue'
import GroupInfo from '../../components/group/GroupInfo.vue'
const __sfc__ = /* @__PURE__*/_defineComponent({
  ...{
    name: 'ImContactGroupDetail'
  },
  components: {
    GroupInfo
  },
  __name: 'GroupDetail',
  props: {
    group: {
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
    const emit = __emit
    const __returned__ = {
      emit,
      GroupInfo
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
