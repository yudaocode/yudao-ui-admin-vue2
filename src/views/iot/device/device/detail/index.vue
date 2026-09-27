<template>
<div class="iot-vue2-root">

  <DeviceDetailsHeader
    :loading="loading"
    :product="product"
    :device="device"
    @refresh="getDeviceData"
  />
  <el-col>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="设备信息" name="info">
        <DeviceDetailsInfo v-if="activeTab === 'info'" :product="product" :device="device" />
      </el-tab-pane>
      <el-tab-pane label="物模型数据" name="model">
        <DeviceDetailsThingModel
          v-if="activeTab === 'model'"
          :device-id="device.id"
          :thing-model-list="thingModelList"
        />
      </el-tab-pane>
      <el-tab-pane
        label="子设备管理"
        name="subDevice"
        v-if="product.deviceType === DeviceTypeEnum.GATEWAY"
      >
        <DeviceDetailsSubDevice v-if="activeTab === 'subDevice'" :gateway-id="device.id" />
      </el-tab-pane>
      <el-tab-pane label="设备消息" name="log">
        <DeviceDetailsMessage v-if="activeTab === 'log'" :device-id="device.id" />
      </el-tab-pane>
      <el-tab-pane label="模拟设备" name="simulator">
        <DeviceDetailsSimulator
          v-if="activeTab === 'simulator'"
          :product="product"
          :device="device"
          :thing-model-list="thingModelList"
        />
      </el-tab-pane>
      <el-tab-pane label="设备配置" name="config">
        <DeviceDetailConfig
          v-if="activeTab === 'config'"
          :device="device"
          @success="getDeviceData"
        />
      </el-tab-pane>
      <el-tab-pane
        label="Modbus 配置"
        name="modbus"
        v-if="
          [ProtocolTypeEnum.MODBUS_TCP_CLIENT, ProtocolTypeEnum.MODBUS_TCP_SERVER].includes(
            product.protocolType
          )
        "
      >
        <DeviceModbusConfig
          v-if="activeTab === 'modbus'"
          :device="device"
          :product="product"
          :thing-model-list="thingModelList"
        />
      </el-tab-pane>
    </el-tabs>
  </el-col>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { useRoute, useRouter } from '@/views/iot/utils/composables';
import { ref, onMounted, unref } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { useTagsViewStore } from '@/views/iot/utils/composables';
import { DeviceApi } from '@/api/iot/device/device';
import { DeviceTypeEnum, ProductApi, ProtocolTypeEnum } from '@/api/iot/product/product';
import { ThingModelApi } from '@/api/iot/thingmodel';
import DeviceDetailsHeader from './DeviceDetailsHeader.vue';
import DeviceDetailsInfo from './DeviceDetailsInfo.vue';
import DeviceDetailsThingModel from './DeviceDetailsThingModel.vue';
import DeviceDetailsMessage from './DeviceDetailsMessage.vue';
import DeviceDetailsSimulator from './DeviceDetailsSimulator.vue';
import DeviceDetailConfig from './DeviceDetailConfig.vue';
import DeviceModbusConfig from './DeviceModbusConfig.vue';
import DeviceDetailsSubDevice from './DeviceDetailsSubDevice.vue';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTDeviceDetail' },
    components: {
        DeviceDetailsHeader,
        DeviceDetailsInfo,
        DeviceDetailsThingModel,
        DeviceDetailsSubDevice,
        DeviceDetailsMessage,
        DeviceDetailsSimulator,
        DeviceDetailConfig,
        DeviceModbusConfig,
    },
    __name: 'index',
    setup(__props, { expose: __expose }) {
        __expose();
        const route = useRoute();
        const message = createIotMessage();
        const id = Number(route.params.id); // 将字符串转换为数字
        const loading = ref(true); // 加载中
        const product = ref({}); // 产品详情
        const device = ref({}); // 设备详情
        const activeTab = ref('info'); // 默认激活的标签页
        const thingModelList = ref([]); // 物模型列表数据
        /** 获取设备详情 */
        const getDeviceData = async () => {
            loading.value = true;
            try {
                device.value = (await DeviceApi.getDevice(id)).data;
                await getProductData(device.value.productId);
                await getThingModelList(device.value.productId);
            }
            finally {
                loading.value = false;
            }
        };
        /** 获取产品详情 */
        const getProductData = async (id) => {
            product.value = (await ProductApi.getProduct(id)).data;
        };
        /** 获取物模型列表 */
        const getThingModelList = async (productId) => {
            try {
                const data = (await ThingModelApi.getThingModelList({
                    productId: productId
                })).data;
                thingModelList.value = data;
            }
            catch (error) {
                console.error('获取物模型列表失败:', error);
                thingModelList.value = [];
            }
        };
        /** 初始化 */
        const { delView } = useTagsViewStore(); // 视图操作
        const router = useRouter(); // 路由
        const { currentRoute } = router;
        onMounted(async () => {
            if (!id) {
                message.warning('参数错误，产品不能为空！');
                delView(unref(currentRoute));
                return;
            }
            await getDeviceData();
            activeTab.value = route.query.tab || 'info';
        });
        const __returned__ = { route, message, id, loading, product, device, activeTab, thingModelList, getDeviceData, getProductData, getThingModelList, delView, router, currentRoute, get DeviceTypeEnum() { return DeviceTypeEnum; }, get ProtocolTypeEnum() { return ProtocolTypeEnum; }, DeviceDetailsHeader, DeviceDetailsInfo, DeviceDetailsThingModel, DeviceDetailsMessage, DeviceDetailsSimulator, DeviceDetailConfig, DeviceModbusConfig, DeviceDetailsSubDevice };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
