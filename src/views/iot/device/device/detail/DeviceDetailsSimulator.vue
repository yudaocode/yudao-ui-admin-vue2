<template>
<div class="iot-vue2-root">

  <div class="iot-content-wrap">
    <el-row :gutter="20">
      <!-- 左侧指令调试区域 -->
      <el-col :span="12">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 上行指令调试 -->
          <el-tab-pane label="上行指令调试" name="upstream">
            <el-tabs v-if="activeTab === 'upstream'" v-model="upstreamTab">
              <!-- 属性上报 -->
              <el-tab-pane label="属性上报" :name="IotDeviceMessageMethodEnum.PROPERTY_POST.method">
                <div class="iot-content-wrap">
                  <el-table :data="propertyList" :show-overflow-tooltip="true" :stripe="true">
                    <el-table-column
                      fixed="left"
                      align="center"
                      label="功能名称"
                      prop="name"
                      width="120"
                    />
                    <el-table-column
                      fixed="left"
                      align="center"
                      label="标识符"
                      prop="identifier"
                      width="120"
                    />
                    <el-table-column align="center" label="数据类型" width="100">
                      <template #default="{ row }">
                        {{ row.property?.dataType ?? '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column align="left" label="数据定义" min-width="200">
                      <template #default="{ row }">
                        <DataDefinition :data="row" />
                      </template>
                    </el-table-column>
                    <el-table-column fixed="right" align="center" label="值" width="150">
                      <template #default="scope">
                        <el-input
                          :value="getFormValue(scope.row.identifier)"
                          @input="setFormValue(scope.row.identifier, $event)"
                          placeholder="输入值"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="flex justify-between items-center mt-4">
                    <span class="text-sm text-gray-600">
                      设置属性值后，点击「发送属性上报」按钮
                    </span>
                    <el-button type="primary" @click="handlePropertyPost">发送属性上报</el-button>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 事件上报 -->
              <el-tab-pane label="事件上报" :name="IotDeviceMessageMethodEnum.EVENT_POST.method">
                <div class="iot-content-wrap">
                  <el-table :data="eventList" :show-overflow-tooltip="true" :stripe="true">
                    <el-table-column
                      fixed="left"
                      align="center"
                      label="功能名称"
                      prop="name"
                      width="120"
                    />
                    <el-table-column
                      fixed="left"
                      align="center"
                      label="标识符"
                      prop="identifier"
                      width="120"
                    />
                    <el-table-column align="center" label="数据类型" width="100">
                      <template #default="{ row }">
                        {{ row.event?.dataType ?? '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column align="left" label="数据定义" min-width="200">
                      <template #default="{ row }">
                        <DataDefinition :data="row" />
                      </template>
                    </el-table-column>
                    <el-table-column align="center" label="值" width="200">
                      <template #default="scope">
                        <el-input
                          :value="getFormValue(scope.row.identifier)"
                          @input="setFormValue(scope.row.identifier, $event)"
                          type="textarea"
                          :rows="3"
                          placeholder="输入事件参数（JSON格式）"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column fixed="right" align="center" label="操作" width="100">
                      <template #default="scope">
                        <el-button type="primary" size="small" @click="handleEventPost(scope.row)">
                          上报事件
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>

              <!-- 状态变更 -->
              <el-tab-pane label="状态变更" :name="IotDeviceMessageMethodEnum.STATE_UPDATE.method">
                <div class="iot-content-wrap">
                  <div class="flex gap-4">
                    <el-button type="primary" @click="handleDeviceState(DeviceStateEnum.ONLINE)">
                      设备上线
                    </el-button>
                    <el-button type="danger" @click="handleDeviceState(DeviceStateEnum.OFFLINE)">
                      设备下线
                    </el-button>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>

          <!-- 下行指令调试 -->
          <el-tab-pane label="下行指令调试" name="downstream">
            <el-tabs v-if="activeTab === 'downstream'" v-model="downstreamTab">
              <!-- 属性调试 -->
              <el-tab-pane label="属性设置" :name="IotDeviceMessageMethodEnum.PROPERTY_SET.method">
                <div class="iot-content-wrap">
                  <el-table :data="propertyList" :show-overflow-tooltip="true" :stripe="true">
                    <el-table-column
                      fixed="left"
                      align="center"
                      label="功能名称"
                      prop="name"
                      width="120"
                    />
                    <el-table-column
                      fixed="left"
                      align="center"
                      label="标识符"
                      prop="identifier"
                      width="120"
                    />
                    <el-table-column align="center" label="数据类型" width="100">
                      <template #default="{ row }">
                        {{ row.property?.dataType ?? '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column align="left" label="数据定义" min-width="200">
                      <template #default="{ row }">
                        <DataDefinition :data="row" />
                      </template>
                    </el-table-column>
                    <el-table-column fixed="right" align="center" label="值" width="150">
                      <template #default="scope">
                        <el-input
                          :value="getFormValue(scope.row.identifier)"
                          @input="setFormValue(scope.row.identifier, $event)"
                          placeholder="输入值"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="flex justify-between items-center mt-4">
                    <span class="text-sm text-gray-600">
                      设置属性值后，点击「发送属性设置」按钮
                    </span>
                    <el-button type="primary" @click="handlePropertySet">发送属性设置</el-button>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 服务调用 -->
              <el-tab-pane
                label="设备服务调用"
                :name="IotDeviceMessageMethodEnum.SERVICE_INVOKE.method"
              >
                <div class="iot-content-wrap">
                  <el-table :data="serviceList" :show-overflow-tooltip="true" :stripe="true">
                    <el-table-column
                      fixed="left"
                      align="center"
                      label="服务名称"
                      prop="name"
                      width="120"
                    />
                    <el-table-column
                      fixed="left"
                      align="center"
                      label="标识符"
                      prop="identifier"
                      width="120"
                    />
                    <el-table-column align="left" label="输入参数" min-width="200">
                      <template #default="{ row }">
                        <DataDefinition :data="row" />
                      </template>
                    </el-table-column>
                    <el-table-column align="center" label="参数值" width="200">
                      <template #default="scope">
                        <el-input
                          :value="getFormValue(scope.row.identifier)"
                          @input="setFormValue(scope.row.identifier, $event)"
                          type="textarea"
                          :rows="3"
                          placeholder="输入服务参数（JSON格式）"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column fixed="right" align="center" label="操作" width="100">
                      <template #default="scope">
                        <el-button
                          type="primary"
                          size="small"
                          @click="handleServiceInvoke(scope.row)"
                        >
                          服务调用
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <!-- 右侧设备日志区域 -->
      <el-col :span="12">
        <div class="iot-content-wrap">
          <DeviceDetailsMessage ref="deviceMessageRef" :device-id="device.id" />
        </div>
      </el-col>
    </el-row>
  </div>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { ref, computed } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { DeviceApi } from '@/api/iot/device/device';
import DeviceDetailsMessage from './DeviceDetailsMessage.vue';
import { DataDefinition } from '@/views/iot/thingmodel/components';
import { DeviceStateEnum, IotDeviceMessageMethodEnum, IoTThingModelTypeEnum } from '@/views/iot/utils/constants';
const deviceMessageRefreshDelay = 2000; // 延迟 N 秒，保证模拟上行的消息被处理
// 表单数据：存储用户输入的模拟值
export default /*@__PURE__*/ _defineComponent({
    __name: 'DeviceDetailsSimulator',
    components: {
        DataDefinition,
        DeviceDetailsMessage,
    },
    props: {
        product: { type: null, required: true },
        device: { type: null, required: true },
        thingModelList: { type: Array, required: true }
    },
    setup(__props, { expose: __expose }) {
        __expose();
        const props = __props;
        const message = createIotMessage(); // 消息弹窗
        const activeTab = ref('upstream'); // 上行upstream、下行downstream
        const upstreamTab = ref(IotDeviceMessageMethodEnum.PROPERTY_POST.method); // 上行子标签
        const downstreamTab = ref(IotDeviceMessageMethodEnum.PROPERTY_SET.method); // 下行子标签
        const deviceMessageRef = ref(); // 设备消息组件引用
        const formData = ref({});
        // 根据类型过滤物模型数据
        const getFilteredThingModelList = (type) => {
            return props.thingModelList.filter((item) => item.type === type);
        };
        const propertyList = computed(() => getFilteredThingModelList(IoTThingModelTypeEnum.PROPERTY));
        const eventList = computed(() => getFilteredThingModelList(IoTThingModelTypeEnum.EVENT));
        const serviceList = computed(() => getFilteredThingModelList(IoTThingModelTypeEnum.SERVICE));
        /** 获取表单值的辅助函数 */
        const getFormValue = (identifier) => {
            if (!identifier)
                return '';
            return formData.value[String(identifier)] || '';
        };
        /** 设置表单值的辅助函数 */
        const setFormValue = (identifier, value) => {
            if (!identifier)
                return;
            formData.value[String(identifier)] = value;
        };
        /** 模拟属性上报 */
        const handlePropertyPost = async () => {
            const data = {};
            propertyList.value.forEach((item) => {
                const value = getFormValue(item.identifier);
                if (value && item.identifier) {
                    data[String(item.identifier)] = value;
                }
            });
            if (Object.keys(data).length === 0) {
                message.warning('请至少设置一个属性值');
                return;
            }
            try {
                (await DeviceApi.sendDeviceMessage({
                    deviceId: props.device.id,
                    method: IotDeviceMessageMethodEnum.PROPERTY_POST.method,
                    params: data
                })).data;
                message.success('属性上报成功');
                deviceMessageRef.value.refresh(deviceMessageRefreshDelay);
            }
            catch (error) {
                message.error('属性上报失败');
            }
        };
        /** 模拟事件上报 */
        const handleEventPost = async (eventItem) => {
            const value = getFormValue(eventItem.identifier);
            if (!value) {
                message.warning('请输入事件参数');
                return;
            }
            let eventParams;
            try {
                eventParams = JSON.parse(value);
            }
            catch {
                message.error('事件参数格式不正确，请输入有效的JSON格式');
                return;
            }
            try {
                (await DeviceApi.sendDeviceMessage({
                    deviceId: props.device.id,
                    method: IotDeviceMessageMethodEnum.EVENT_POST.method,
                    params: {
                        identifier: String(eventItem.identifier),
                        value: eventParams,
                        time: Date.now()
                    }
                })).data;
                message.success(`事件【${String(eventItem.name)}】上报成功`);
                deviceMessageRef.value.refresh(deviceMessageRefreshDelay);
            }
            catch (error) {
                message.error(`事件【${String(eventItem.name)}】上报失败`);
            }
        };
        /** 模拟设备状态 */
        const handleDeviceState = async (state) => {
            try {
                (await DeviceApi.sendDeviceMessage({
                    deviceId: props.device.id,
                    method: IotDeviceMessageMethodEnum.STATE_UPDATE.method,
                    params: {
                        state: state
                    }
                })).data;
                message.success(`设备${state === DeviceStateEnum.ONLINE ? '上线' : '下线'}成功`);
                deviceMessageRef.value.refresh(deviceMessageRefreshDelay);
            }
            catch (error) {
                message.error(`设备${state === DeviceStateEnum.ONLINE ? '上线' : '下线'}失败`);
            }
        };
        /** 模拟属性设置 */
        const handlePropertySet = async () => {
            const data = {};
            propertyList.value.forEach((item) => {
                const value = getFormValue(item.identifier);
                if (value && item.identifier) {
                    data[String(item.identifier)] = value;
                }
            });
            if (Object.keys(data).length === 0) {
                message.warning('请至少设置一个属性值');
                return;
            }
            try {
                (await DeviceApi.sendDeviceMessage({
                    deviceId: props.device.id,
                    method: IotDeviceMessageMethodEnum.PROPERTY_SET.method,
                    params: data
                })).data;
                message.success('属性设置成功');
                deviceMessageRef.value.refresh(deviceMessageRefreshDelay);
            }
            catch (error) {
                message.error('属性设置失败');
            }
        };
        /** 模拟服务调用 */
        const handleServiceInvoke = async (serviceItem) => {
            const value = getFormValue(serviceItem.identifier);
            if (!value) {
                message.warning('请输入服务参数');
                return;
            }
            let serviceParams;
            try {
                serviceParams = JSON.parse(value);
            }
            catch {
                message.error('服务参数格式不正确，请输入有效的JSON格式');
                return;
            }
            try {
                (await DeviceApi.sendDeviceMessage({
                    deviceId: props.device.id,
                    method: IotDeviceMessageMethodEnum.SERVICE_INVOKE.method,
                    params: {
                        identifier: String(serviceItem.identifier),
                        inputParams: serviceParams
                    }
                })).data;
                message.success(`服务【${String(serviceItem.name)}】调用成功`);
                deviceMessageRef.value.refresh(deviceMessageRefreshDelay);
            }
            catch (error) {
                message.error(`服务【${String(serviceItem.name)}】调用失败`);
            }
        };
        const __returned__ = { props, message, activeTab, upstreamTab, downstreamTab, deviceMessageRef, deviceMessageRefreshDelay, formData, getFilteredThingModelList, propertyList, eventList, serviceList, getFormValue, setFormValue, handlePropertyPost, handleEventPost, handleDeviceState, handlePropertySet, handleServiceInvoke, DeviceDetailsMessage, get DataDefinition() { return DataDefinition; }, get DeviceStateEnum() { return DeviceStateEnum; }, get IotDeviceMessageMethodEnum() { return IotDeviceMessageMethodEnum; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
