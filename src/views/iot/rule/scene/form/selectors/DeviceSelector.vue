<template>
<div class="iot-vue2-root">

  <el-select
    :value="value"
    @input="handleChange"
    placeholder="请选择设备"
    filterable
    clearable
    class="w-full"
    :loading="deviceLoading"
    :disabled="!productId"
  >
    <el-option
      v-for="device in deviceList"
      :key="device.id"
      :label="device.deviceName"
      :value="device.id"
    >
      <div class="flex items-center justify-between w-full py-4px">
        <div class="flex-1">
          <div class="text-14px font-500 text-[var(--el-text-color-primary)] mb-2px">
            {{ device.deviceName }}
          </div>
          <div class="text-12px text-[var(--el-text-color-secondary)]">{{ device.deviceKey }}</div>
        </div>
        <div class="flex items-center gap-4px" v-if="device.id > 0">
          <dict-tag :type="DICT_TYPE.IOT_DEVICE_STATE" :value="device.state" />
        </div>
      </div>
    </el-option>
  </el-select>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref, watch } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { DeviceApi } from '@/api/iot/device/device';
import { DEVICE_SELECTOR_OPTIONS } from '@/views/iot/utils/constants';
import { DICT_TYPE } from '@/utils/dict';
/** 设备选择器组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'DeviceSelector' },
    __name: 'DeviceSelector',
    props: {
        value: { type: Number, required: false },
        productId: { type: Number, required: false }
    },
    emits: ["input", "change"],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emit = __emit;
        const deviceLoading = ref(false); // 设备加载状态
        const deviceList = ref([]); // 设备列表
        /**
         * 处理选择变化事件
         * @param value 选中的设备ID
         */
        const handleChange = (value) => {
            emit('input', value);
            emit('change', value);
        };
        /**
         * 获取设备列表
         */
        const getDeviceList = async () => {
            if (!props.productId) {
                deviceList.value = [];
                return;
            }
            try {
                deviceLoading.value = true;
                const data = (await DeviceApi.getDeviceListByProductId(props.productId)).data;
                deviceList.value = [DEVICE_SELECTOR_OPTIONS.ALL_DEVICES, ...data];
            }
            catch (error) {
                console.error('获取设备列表失败:', error);
                deviceList.value = [DEVICE_SELECTOR_OPTIONS.ALL_DEVICES];
            }
            finally {
                deviceLoading.value = false;
            }
        };
        // 监听产品变化
        watch(() => props.productId, (newProductId) => {
            if (newProductId) {
                getDeviceList();
            }
            else {
                deviceList.value = [];
                // 清空当前选择的设备
                if (props.value) {
                    emit('input', undefined);
                    emit('change', undefined);
                }
            }
        }, { immediate: true });
        const __returned__ = { props, emit, deviceLoading, deviceList, handleChange, getDeviceList, get DICT_TYPE() { return DICT_TYPE; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
