<template>
<div class="iot-vue2-root">

  <el-form-item label="元素类型" prop="property.dataSpecs.childDataType">
    <el-radio-group v-model="dataSpecs.childDataType" @change="handleChange">
      <el-radio
        v-for="item in arrayDataTypeOptions"
        :key="item.value"
        :label="item.value"
        class="w-1/3"
      >
        {{ `${item.value}(${item.label})` }}
      </el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="元素个数" prop="property.dataSpecs.size">
    <el-input v-model="dataSpecs.size" placeholder="请输入数组中的元素个数" />
  </el-form-item>
  <!-- Struct 型配置-->
  <ThingModelStructDataSpecs
    v-if="dataSpecs.childDataType === IoTDataSpecsDataTypeEnum.STRUCT"
    v-model="dataSpecs.dataSpecsList"
  />

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { computed, defineComponent as _defineComponent } from 'vue';
import { useVModel } from '@/views/iot/utils/composables';
import ThingModelStructDataSpecs from './ThingModelStructDataSpecs.vue';
import { getDataTypeOptions, IoTDataSpecsDataTypeEnum } from '@/views/iot/utils/constants';
/** 数组型的 dataSpecs 配置组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ThingModelArrayDataSpecs' },
    components: {
        ThingModelStructDataSpecs,
    },
    __name: 'ThingModelArrayDataSpecs',
    props: {
        value: { type: null, required: true }
    },
    emits: ['input'],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emits = __emit;
        const dataSpecs = useVModel(props, 'value', emits);
        const arrayDataTypeOptions = computed(() => getDataTypeOptions().filter((item) => ![
            IoTDataSpecsDataTypeEnum.ENUM,
            IoTDataSpecsDataTypeEnum.ARRAY,
            IoTDataSpecsDataTypeEnum.DATE
        ].includes(item.value)));
        /** 元素类型改变时间。当值为 struct 时，对 dataSpecs 中的 dataSpecsList 进行初始化 */
        const handleChange = (val) => {
            if (val !== IoTDataSpecsDataTypeEnum.STRUCT) {
                return;
            }
            dataSpecs.value.dataSpecsList = [];
        };
        const __returned__ = { props, emits, dataSpecs, arrayDataTypeOptions, handleChange, ThingModelStructDataSpecs, get IoTDataSpecsDataTypeEnum() { return IoTDataSpecsDataTypeEnum; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
