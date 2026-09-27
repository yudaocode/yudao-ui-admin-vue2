<template>
<div class="iot-vue2-root">

  <el-form-item
    :rules="[{ required: true, message: '请选择调用方式', trigger: 'change' }]"
    label="调用方式"
    prop="service.callType"
  >
    <el-radio-group v-model="service.callType">
      <el-radio
        v-for="callType in Object.values(IoTThingModelServiceCallTypeEnum)"
        :key="callType.value"
        :label="callType.value"
      >
        {{ callType.label }}
      </el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="输入参数">
    <ThingModelInputOutputParam
      v-model="service.inputParams"
      :direction="IoTThingModelParamDirectionEnum.INPUT"
    />
  </el-form-item>
  <el-form-item label="输出参数">
    <ThingModelInputOutputParam
      v-model="service.outputParams"
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
import { IoTThingModelParamDirectionEnum, IoTThingModelServiceCallTypeEnum } from '@/views/iot/utils/constants';
/** IoT 物模型服务 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ThingModelService' },
    components: {
        ThingModelInputOutputParam,
    },
    __name: 'ThingModelService',
    props: {
        value: { type: null, required: true },
        isStructDataSpecs: { type: Boolean, required: false }
    },
    emits: ['input'],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emits = __emit;
        const service = useVModel(props, 'value', emits);
        /** 默认选中，ASYNC 异步 */
        watch(() => service.value.callType, (val) => isEmpty(val) && (service.value.callType = IoTThingModelServiceCallTypeEnum.ASYNC.value), { immediate: true });
        const __returned__ = { props, emits, service, ThingModelInputOutputParam, get IoTThingModelParamDirectionEnum() { return IoTThingModelParamDirectionEnum; }, get IoTThingModelServiceCallTypeEnum() { return IoTThingModelServiceCallTypeEnum; } };
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
