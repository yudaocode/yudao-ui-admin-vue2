<template>
<div class="iot-vue2-root">

  <el-form-item
    :rules="[{ required: true, message: '请选择事件类型', trigger: 'change' }]"
    label="事件类型"
    prop="event.type"
  >
    <el-radio-group v-model="thingModelEvent.type">
      <el-radio
        v-for="eventType in Object.values(IoTThingModelEventTypeEnum)"
        :key="eventType.value"
        :label="eventType.value"
      >
        {{ eventType.label }}
      </el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="输出参数">
    <ThingModelInputOutputParam
      v-model="thingModelEvent.outputParams"
      :direction="IoTThingModelParamDirectionEnum.OUTPUT"
    />
  </el-form-item>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { watch } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import ThingModelInputOutputParam from './ThingModelInputOutputParam.vue';
import { useVModel } from '@/views/iot/utils/composables';
import { isEmpty } from '@/utils/is';
import { IoTThingModelEventTypeEnum, IoTThingModelParamDirectionEnum } from '@/views/iot/utils/constants';
/** IoT 物模型事件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ThingModelEvent' },
    components: {
        ThingModelInputOutputParam,
    },
    __name: 'ThingModelEvent',
    props: {
        value: { type: null, required: true },
        isStructDataSpecs: { type: Boolean, required: false }
    },
    emits: ['input'],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emits = __emit;
        const thingModelEvent = useVModel(props, 'value', emits);
        // 默认选中，INFO 信息
        watch(() => thingModelEvent.value.type, (val) => isEmpty(val) && (thingModelEvent.value.type = IoTThingModelEventTypeEnum.INFO.value), { immediate: true });
        const __returned__ = { props, emits, thingModelEvent, ThingModelInputOutputParam, get IoTThingModelEventTypeEnum() { return IoTThingModelEventTypeEnum; }, get IoTThingModelParamDirectionEnum() { return IoTThingModelParamDirectionEnum; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
<style scoped lang="scss">

:deep(.el-form-item) {
  .el-form-item {
    margin-bottom: 0;
  }
}

</style>
