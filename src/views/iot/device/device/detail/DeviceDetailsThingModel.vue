<template>
<div class="iot-vue2-root">

  <div class="iot-content-wrap">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="设备属性（运行状态）" name="property">
        <DeviceDetailsThingModelProperty :device-id="deviceId" />
      </el-tab-pane>
      <el-tab-pane label="设备事件上报" name="event">
        <DeviceDetailsThingModelEvent
          :device-id="props.deviceId"
          :thing-model-list="props.thingModelList"
        />
      </el-tab-pane>
      <el-tab-pane label="设备服务调用" name="service">
        <DeviceDetailsThingModelService
          :device-id="deviceId"
          :thing-model-list="props.thingModelList"
        />
      </el-tab-pane>
    </el-tabs>
  </div>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import DeviceDetailsThingModelProperty from './DeviceDetailsThingModelProperty.vue';
import DeviceDetailsThingModelEvent from './DeviceDetailsThingModelEvent.vue';
import DeviceDetailsThingModelService from './DeviceDetailsThingModelService.vue';
export default /*@__PURE__*/ _defineComponent({
    __name: 'DeviceDetailsThingModel',
    components: {
        DeviceDetailsThingModelProperty,
        DeviceDetailsThingModelEvent,
        DeviceDetailsThingModelService,
    },
    props: {
        deviceId: { type: Number, required: true },
        thingModelList: { type: Array, required: true }
    },
    setup(__props, { expose: __expose }) {
        __expose();
        const props = __props;
        const activeTab = ref('property'); // 默认选中设备属性
        const __returned__ = { props, activeTab, DeviceDetailsThingModelProperty, DeviceDetailsThingModelEvent, DeviceDetailsThingModelService };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
