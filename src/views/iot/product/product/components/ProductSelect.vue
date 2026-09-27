<template>
<div class="iot-vue2-root">

  <el-select
    :value="value"
    @input="handleChange"
    placeholder="请选择产品"
    filterable
    clearable
    class="w-full"
    :loading="loading"
  >
    <el-option
      v-for="product in productList"
      :key="product.id"
      :label="product.name"
      :value="product.id"
    />
  </el-select>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref, onMounted } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { ProductApi } from '@/api/iot/product/product';
/** 产品下拉选择器组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ProductSelect' },
    __name: 'ProductSelect',
    props: {
        value: { type: Number, required: false },
        deviceType: { type: Number, required: false }
    },
    emits: ["input", "change"],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emit = __emit;
        const loading = ref(false); // 产品加载状态
        const productList = ref([]); // 产品列表
        /**
         * 处理选择变化事件
         *
         * @param value 选中的产品 ID
         */
        const handleChange = (value) => {
            emit('input', value);
            emit('change', value);
        };
        /** 获取产品列表 */
        const getProductList = async () => {
            try {
                loading.value = true;
                const res = (await ProductApi.getSimpleProductList(props.deviceType)).data;
                productList.value = res;
            }
            finally {
                loading.value = false;
            }
        };
        /** 组件挂载时获取产品列表 */
        onMounted(() => {
            getProductList();
        });
        const __returned__ = { props, emit, loading, productList, handleChange, getProductList };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
