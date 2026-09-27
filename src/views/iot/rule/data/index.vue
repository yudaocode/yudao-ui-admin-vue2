<template>
<div class="iot-vue2-root">

  <el-tabs v-model="activeTab" type="border-card">
    <el-tab-pane label="规则" name="rule">
      <RuleIndex />
    </el-tab-pane>
    <el-tab-pane label="目的" name="sink" lazy>
      <SinkIndex />
    </el-tab-pane>
  </el-tabs>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import RuleIndex from './rule/index.vue';
import SinkIndex from './sink/index.vue';
/** IoT 数据流转 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTDataRule' },
    components: {
        RuleIndex,
        SinkIndex,
    },
    __name: 'index',
    setup(__props, { expose: __expose }) {
        __expose();
        const activeTab = ref('rule');
        const __returned__ = { activeTab, RuleIndex, SinkIndex };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
