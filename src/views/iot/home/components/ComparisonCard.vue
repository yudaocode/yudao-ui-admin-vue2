<template>
<div class="iot-vue2-root">

  <el-card class="stat-card" shadow="never" :loading="loading">
    <div class="flex flex-col">
      <div class="flex justify-between items-center mb-1">
        <span class="text-gray-500 text-base font-medium">{{ title }}</span>
        <Icon :icon="icon" :class="`text-[32px] ${iconColor}`" />
      </div>
      <span class="text-3xl font-bold text-gray-700">
        <span v-if="value === -1">--</span>
        <span v-else>{{ value }}</span>
      </span>
      <el-divider class="my-2" />
      <div class="flex justify-between items-center text-gray-400 text-sm">
        <span>今日新增</span>
        <span class="text-green-500" v-if="todayCount !== -1">+{{ todayCount }}</span>
        <span v-else>--</span>
      </div>
    </div>
  </el-card>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { defineComponent as _defineComponent } from 'vue';
/** 【总数 + 新增数】统计卡片组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTComparisonCard' },
    components: {
        Icon: IotIcon,
    },
    __name: 'ComparisonCard',
    props: {
        title: { type: String, required: true, default: '' },
        value: { type: Number, required: true, default: 0 },
        todayCount: { type: Number, required: true, default: 0 },
        icon: { type: String, required: true, default: '' },
        iconColor: { type: String, default: '' },
        loading: {
            type: Boolean,
            default: false
        }
    },
    setup(__props, { expose: __expose }) {
        __expose();
        const props = __props;
        const __returned__ = { Icon: IotIcon, props };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
<style scoped lang="scss">

.stat-card {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgb(0 0 0 / 8%);
  }
}

</style>
