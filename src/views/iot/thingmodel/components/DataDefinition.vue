<template>
<div class="iot-vue2-root">

  <!-- 属性 -->
  <template v-if="data.type === IoTThingModelTypeEnum.PROPERTY">
    <!-- 非列表型：数值 -->
    <div
      v-if="
        [
          IoTDataSpecsDataTypeEnum.INT,
          IoTDataSpecsDataTypeEnum.DOUBLE,
          IoTDataSpecsDataTypeEnum.FLOAT
        ].includes(data.property.dataType)
      "
    >
      取值范围：{{
        `${getDataSpecsValue(data.property, 'min')}~${getDataSpecsValue(data.property, 'max')}`
      }}
    </div>
    <!-- 非列表型：文本 -->
    <div v-if="IoTDataSpecsDataTypeEnum.TEXT === data.property.dataType">
      数据长度：{{ getDataSpecsValue(data.property, 'length') }}
    </div>
    <!-- 列表型: 数组、结构、时间（特殊） -->
    <div
      v-if="
        [
          IoTDataSpecsDataTypeEnum.ARRAY,
          IoTDataSpecsDataTypeEnum.STRUCT,
          IoTDataSpecsDataTypeEnum.DATE
        ].includes(data.property.dataType)
      "
    >
      -
    </div>
    <!-- 列表型: 布尔值、枚举 -->
    <div
      v-if="
        ([IoTDataSpecsDataTypeEnum.BOOL, IoTDataSpecsDataTypeEnum.ENUM]).includes(
          data.property.dataType
        )
      "
    >
      <div>
        {{ IoTDataSpecsDataTypeEnum.BOOL === data.property.dataType ? '布尔值' : '枚举值' }}：
      </div>
      <div v-for="item in data.property.dataSpecsList || []" :key="item.value">
        {{ `${item.name}-${item.value}` }}
      </div>
    </div>
  </template>
  <!-- 服务 -->
  <div v-if="data.type === IoTThingModelTypeEnum.SERVICE">
    调用方式：{{ getThingModelServiceCallTypeLabel(data.service.callType) }}
  </div>
  <!-- 事件 -->
  <div v-if="data.type === IoTThingModelTypeEnum.EVENT">
    事件类型：{{ getEventTypeLabel(data.event.type) }}
  </div>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { defineComponent as _defineComponent } from 'vue';
import { getEventTypeLabel, getThingModelServiceCallTypeLabel, IoTDataSpecsDataTypeEnum, IoTThingModelTypeEnum } from '@/views/iot/utils/constants';
/** 数据定义展示组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'DataDefinition' },
    __name: 'DataDefinition',
    props: {
        data: { type: null, required: true }
    },
    setup(__props, { expose: __expose }) {
        __expose();
        const getDataSpecsValue = (property, key) => {
            return property.dataSpecs?.[key];
        };
        const __returned__ = { getDataSpecsValue, get getEventTypeLabel() { return getEventTypeLabel; }, get getThingModelServiceCallTypeLabel() { return getThingModelServiceCallTypeLabel; }, get IoTDataSpecsDataTypeEnum() { return IoTDataSpecsDataTypeEnum; }, get IoTThingModelTypeEnum() { return IoTThingModelTypeEnum; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

