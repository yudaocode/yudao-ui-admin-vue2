<template>
<div class="iot-vue2-root">

  <ProductDetailsHeader :loading="loading" :product="product" @refresh="() => getProductData(id)" />
  <el-col>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="产品信息" name="info">
        <ProductDetailsInfo v-if="activeTab === 'info'" :product="product" />
      </el-tab-pane>
      <el-tab-pane label="物模型（功能定义）" lazy name="thingModel">
        <IoTProductThingModel ref="thingModelRef" />
      </el-tab-pane>
    </el-tabs>
  </el-col>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { useRoute } from '@/views/iot/utils/composables';
import { ref, onMounted, unref, provide } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { ProductApi } from '@/api/iot/product/product';
import { DeviceApi } from '@/api/iot/device/device';
import ProductDetailsHeader from './ProductDetailsHeader.vue';
import ProductDetailsInfo from './ProductDetailsInfo.vue';
import IoTProductThingModel from '@/views/iot/thingmodel/index.vue';
import { useTagsViewStore } from '@/views/iot/utils/composables';
import { useRouter } from '@/views/iot/utils/composables';
import { IOT_PROVIDE_KEY } from '@/views/iot/utils/constants';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTProductDetail' },
    components: {
        ProductDetailsHeader,
        ProductDetailsInfo,
        IoTProductThingModel,
    },
    __name: 'index',
    setup(__props, { expose: __expose }) {
        __expose();
        const { delView } = useTagsViewStore(); // 视图操作
        const { currentRoute } = useRouter();
        const route = useRoute();
        const message = createIotMessage();
        const id = Number(route.params.id); // 编号
        const loading = ref(true); // 加载中
        const product = ref({}); // 详情
        const activeTab = ref('info'); // 默认为 info 标签页
        provide(IOT_PROVIDE_KEY.PRODUCT, product); // 提供产品信息给产品信息详情页的所有子组件
        /** 获取详情 */
        const getProductData = async (id) => {
            loading.value = true;
            try {
                product.value = (await ProductApi.getProduct(id)).data;
            }
            finally {
                loading.value = false;
            }
        };
        /** 查询设备数量 */
        const getDeviceCount = async (productId) => {
            try {
                return (await DeviceApi.getDeviceCount(productId)).data;
            }
            catch (error) {
                console.error('Error fetching device count:', error, 'productId:', productId);
                return 0;
            }
        };
        /** 初始化 */
        onMounted(async () => {
            if (!id) {
                message.warning('参数错误，产品不能为空！');
                delView(unref(currentRoute));
                return;
            }
            await getProductData(id);
            // 处理 tab 参数
            const { tab } = route.query;
            if (tab) {
                activeTab.value = tab;
            }
            // 查询设备数量
            if (product.value.id) {
                product.value.deviceCount = await getDeviceCount(product.value.id);
            }
        });
        const __returned__ = { delView, currentRoute, route, message, id, loading, product, activeTab, getProductData, getDeviceCount, ProductDetailsHeader, ProductDetailsInfo, IoTProductThingModel };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
