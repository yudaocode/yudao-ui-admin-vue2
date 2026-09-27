<template>
<div class="iot-vue2-root">

  <el-dialog :visible.sync="dialogVisible" title="新增升级任务" width="800px" append-to-body>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item label="任务描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入任务描述"
        />
      </el-form-item>
      <el-form-item label="升级范围" prop="deviceScope">
        <el-select v-model="formData.deviceScope" placeholder="请选择升级范围" class="w-full">
          <el-option
            v-for="item in Object.values(IoTOtaTaskDeviceScopeEnum)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="选择设备"
        prop="deviceIds"
        v-if="formData.deviceScope === IoTOtaTaskDeviceScopeEnum.SELECT.value"
      >
        <el-select
          v-model="formData.deviceIds"
          multiple
          placeholder="请选择设备"
          class="w-full"
          filterable
          reserve-keyword
        >
          <el-option
            v-for="device in devices"
            :key="device.id"
            :label="
              device.nickname ? `${device.deviceName} (${device.nickname})` : device.deviceName
            "
            :value="device.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { ref } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { IoTOtaTaskApi } from '@/api/iot/ota/task';
import { IoTOtaTaskDeviceScopeEnum } from '@/views/iot/utils/constants';
import { DeviceApi } from '@/api/iot/device/device';
/** IoT OTA 升级任务表单 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'OtaTaskForm' },
    __name: 'OtaTaskForm',
    props: {
        firmwareId: { type: Number, required: true },
        productId: { type: Number, required: true }
    },
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const props = __props;
        const message = createIotMessage(); // 消息弹窗
        const dialogVisible = ref(false); // 弹窗的是否展示
        const formLoading = ref(false); // 表单的加载中：修改时的数据加载
        const formData = ref({
            name: '',
            deviceScope: IoTOtaTaskDeviceScopeEnum.ALL.value,
            firmwareId: props.firmwareId,
            description: '',
            deviceIds: []
        });
        const formRef = ref(); // 表单 Ref
        const formRules = {
            name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
            deviceScope: [{ required: true, message: '请选择升级范围', trigger: 'change' }],
            deviceIds: [{ required: true, message: '请至少选择一个设备', trigger: 'change' }]
        };
        const devices = ref([]); // 设备选择相关
        /** 打开弹窗 */
        const open = async () => {
            dialogVisible.value = true;
            resetForm();
            // 加载设备列表
            devices.value = (await DeviceApi.getDeviceListByProductId(props.productId)).data;
        };
        __expose({ open }); // 提供 open 方法，用于打开弹窗
        /** 提交表单 */
        const emit = __emit; // 定义 success 事件，用于操作成功后的回调
        const submitForm = async () => {
            // 校验表单
            await formRef.value.validate();
            // 提交请求
            formLoading.value = true;
            try {
                (await IoTOtaTaskApi.createOtaTask(formData.value)).data;
                message.success('创建成功');
                dialogVisible.value = false;
                // 发送操作成功的事件
                emit('success');
            }
            finally {
                formLoading.value = false;
            }
        };
        /** 重置表单 */
        const resetForm = () => {
            formData.value = {
                name: '',
                deviceScope: IoTOtaTaskDeviceScopeEnum.ALL.value,
                firmwareId: props.firmwareId,
                description: '',
                deviceIds: []
            };
            formRef.value?.resetFields();
        };
        const __returned__ = { props, message, dialogVisible, formLoading, formData, formRef, formRules, devices, open, emit, submitForm, resetForm, get IoTOtaTaskDeviceScopeEnum() { return IoTOtaTaskDeviceScopeEnum; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
