<template>
<div class="iot-vue2-root">

  <el-select
    :value="value"
    @input="handleChange"
    placeholder="请选择产品"
    filterable
    clearable
    class="w-full"
    :loading="productLoading"
  >
    <el-option
      v-for="product in productList"
      :key="product.id"
      :label="product.name"
      :value="product.id"
    >
      <div class="flex items-center justify-between w-full py-4px">
        <div class="flex-1">
          <div class="text-14px font-500 text-[var(--el-text-color-primary)] mb-2px">
            {{ product.name }}
          </div>
          <div class="text-12px text-[var(--el-text-color-secondary)]">
            {{ product.productKey }}
          </div>
        </div>
        <dict-tag :type="DICT_TYPE.IOT_PRODUCT_STATUS" :value="product.status" />
      </div>
    </el-option>
  </el-select>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref, onMounted } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { ProductApi } from '@/api/iot/product/product';
import { DICT_TYPE } from '@/utils/dict';
/** 产品选择器组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ProductSelector' },
    __name: 'ProductSelector',
    props: {
        value: { type: Number, required: false }
    },
    emits: ["input", "change"],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const emit = __emit;
        const productLoading = ref(false); // 产品加载状态
        const productList = ref([]); // 产品列表
        /**
         * 处理选择变化事件
         * @param value 选中的产品 ID
         */
        const handleChange = (value) => {
            emit('input', value);
            emit('change', value);
        };
        /** 获取产品列表 */
        const getProductList = async () => {
            try {
                productLoading.value = true;
                const res = (await ProductApi.getSimpleProductList()).data;
                productList.value = res;
            }
            catch (error) {
                console.error('获取产品列表失败:', error);
                productList.value = [];
            }
            finally {
                productLoading.value = false;
            }
        };
        // 组件挂载时获取产品列表
        onMounted(() => {
            getProductList();
        });
        const __returned__ = { emit, productLoading, productList, handleChange, getProductList, get DICT_TYPE() { return DICT_TYPE; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
