<template>
<div class="iot-vue2-root">

  <el-dialog :title="'添加设备到分组'" :visible.sync="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="设备分组" prop="groupIds">
        <el-select v-model="formData.groupIds" placeholder="请选择设备分组" multiple clearable>
          <el-option
            v-for="group in deviceGroups"
            :key="group.id"
            :label="group.name"
            :value="group.id"
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
import { useIotI18n } from '@/views/iot/utils/ui';
import { ref, reactive } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { DeviceApi } from '@/api/iot/device/device';
import { DeviceGroupApi } from '@/api/iot/device/group';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTDeviceGroupForm' },
    __name: 'DeviceGroupForm',
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const { t } = useIotI18n(); // 国际化
        const message = createIotMessage(); // 消息窗
        const dialogVisible = ref(false); // 弹窗的是否展示
        const formLoading = ref(false); // 表单的加载中
        const formData = ref({
            ids: [],
            groupIds: []
        });
        const formRules = reactive({
            groupIds: [{ required: true, message: '设备分组不能为空', trigger: 'change' }]
        });
        const formRef = ref(); // 表单 Ref
        const deviceGroups = ref([]); // 设备分组列表
        /** 打开弹窗 */
        const open = async (ids) => {
            dialogVisible.value = true;
            resetForm();
            formData.value.ids = ids;
            // 加载设备分组列表
            try {
                deviceGroups.value = (await DeviceGroupApi.getSimpleDeviceGroupList()).data;
            }
            catch (error) {
                console.error('加载设备分组列表失败:', error);
            }
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
                (await DeviceApi.updateDeviceGroup(formData.value)).data;
                message.success(t('common.updateSuccess'));
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
                ids: [],
                groupIds: []
            };
            formRef.value?.resetFields();
        };
        const __returned__ = { t, message, dialogVisible, formLoading, formData, formRules, formRef, deviceGroups, open, emit, submitForm, resetForm };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

