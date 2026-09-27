<template>
<div class="iot-vue2-root">

  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="产品" prop="productId">
        <el-select
          v-model="formData.productId"
          placeholder="请选择产品"
          :disabled="formType === 'update'"
          clearable
          @change="handleProductChange"
        >
          <el-option
            v-for="product in products"
            :key="product.id"
            :label="product.name"
            :value="product.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="DeviceName" prop="deviceName">
        <el-input
          v-model="formData.deviceName"
          placeholder="请输入 DeviceName"
          :disabled="formType === 'update'"
        />
      </el-form-item>

      <el-collapse>
        <el-collapse-item title="更多配置">
          <el-form-item label="备注名称" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="请输入备注名称" />
          </el-form-item>
          <el-form-item label="设备图片" prop="picUrl">
            <UploadImg v-model="formData.picUrl" :height="'120px'" :width="'120px'" />
          </el-form-item>
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
          <el-form-item label="设备序列号" prop="serialNumber">
            <el-input v-model="formData.serialNumber" placeholder="请输入设备序列号" />
          </el-form-item>
          <el-form-item label="设备位置" prop="longitude">
            <div class="flex items-center gap-2 w-full">
              <el-input v-model="formData.longitude" placeholder="经度" class="flex-1">
                <template #prepend>经度</template>
              </el-input>
              <el-input v-model="formData.latitude" placeholder="纬度" class="flex-1">
                <template #prepend>纬度</template>
              </el-input>
              <el-button type="primary" @click="openMapDialog">坐标拾取</el-button>
            </div>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
  <!-- 地图选择弹窗 -->
  <MapDialog ref="mapDialogRef" @confirm="handleMapConfirm" />

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { useIotI18n } from '@/views/iot/utils/ui';
import { reactive } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { DeviceApi } from '@/api/iot/device/device';
import { DeviceGroupApi } from '@/api/iot/device/group';
import { ProductApi } from '@/api/iot/product/product';
import UploadImg from '@/components/UploadImg';
import { MapDialog } from '@/components/Map';
import { ref } from 'vue';
/** IoT 设备表单 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTDeviceForm' },
    components: {
        UploadImg,
        MapDialog,
    },
    __name: 'DeviceForm',
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const { t } = useIotI18n(); // 国际化
        const message = createIotMessage(); // 消息窗
        const dialogVisible = ref(false); // 弹窗的是否展示
        const dialogTitle = ref(''); // 弹窗的标题
        const formLoading = ref(false); // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
        const formType = ref(''); // 表单的类型：create - 新增；update - 修改
        const mapDialogRef = ref(); // 地图弹窗 Ref
        const formData = ref({
            id: undefined,
            productId: undefined,
            deviceName: undefined,
            nickname: undefined,
            picUrl: undefined,
            deviceType: undefined,
            serialNumber: undefined,
            longitude: undefined,
            latitude: undefined,
            groupIds: []
        });
        /** 打开地图选择弹窗 */
        const openMapDialog = () => {
            mapDialogRef.value?.open(formData.value.longitude ? Number(formData.value.longitude) : undefined, formData.value.latitude ? Number(formData.value.latitude) : undefined);
        };
        /** 处理地图选择确认 */
        const handleMapConfirm = (data) => {
            formData.value.longitude = data.longitude;
            formData.value.latitude = data.latitude;
        };
        const formRules = reactive({
            productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
            deviceName: [
                { required: true, message: 'DeviceName 不能为空', trigger: 'blur' },
                {
                    pattern: /^[a-zA-Z0-9_.\-:@]{4,32}$/,
                    message: '支持英文字母、数字、下划线（_）、中划线（-）、点号（.）、半角冒号（:）和特殊字符@，长度限制为 4~32 个字符',
                    trigger: 'blur'
                }
            ],
            nickname: [
                {
                    validator: (_rule, value) => {
                        if (value === undefined || value === null) {
                            return Promise.resolve();
                        }
                        const length = value.replace(/[\u4e00-\u9fa5\u3040-\u30ff]/g, 'aa').length;
                        if (length < 4 || length > 64) {
                            return Promise.reject(new Error('备注名称长度限制为 4~64 个字符，中文及日文算 2 个字符'));
                        }
                        if (!/^[\u4e00-\u9fa5\u3040-\u30ff_a-zA-Z0-9]+$/.test(value)) {
                            return Promise.reject(new Error('备注名称只能包含中文、英文字母、日文、数字和下划线（_）'));
                        }
                        return Promise.resolve();
                    },
                    trigger: 'blur'
                }
            ],
            serialNumber: [
                {
                    pattern: /^[a-zA-Z0-9-_]+$/,
                    message: '序列号只能包含字母、数字、中划线和下划线',
                    trigger: 'blur'
                }
            ],
            longitude: [
                {
                    validator: (_rule, value) => {
                        if (value !== undefined && value !== null && value !== '') {
                            const num = Number(value);
                            if (isNaN(num)) {
                                return Promise.reject(new Error('经度必须是有效数字'));
                            }
                            if (num < -180 || num > 180) {
                                return Promise.reject(new Error('经度范围为 -180 到 180'));
                            }
                            if (!formData.value.latitude && formData.value.latitude !== 0) {
                                return Promise.reject(new Error('请同时填写纬度'));
                            }
                        }
                        return Promise.resolve();
                    },
                    trigger: 'blur'
                }
            ],
            latitude: [
                {
                    validator: (_rule, value) => {
                        if (value !== undefined && value !== null && value !== '') {
                            const num = Number(value);
                            if (isNaN(num)) {
                                return Promise.reject(new Error('纬度必须是有效数字'));
                            }
                            if (num < -90 || num > 90) {
                                return Promise.reject(new Error('纬度范围为 -90 到 90'));
                            }
                            if (!formData.value.longitude && formData.value.longitude !== 0) {
                                return Promise.reject(new Error('请同时填写经度'));
                            }
                        }
                        return Promise.resolve();
                    },
                    trigger: 'blur'
                }
            ]
        });
        const formRef = ref(); // 表单 Ref
        const products = ref([]); // 产品列表
        const deviceGroups = ref([]);
        /** 打开弹窗 */
        const open = async (type, id) => {
            dialogVisible.value = true;
            dialogTitle.value = t('action.' + type);
            formType.value = type;
            resetForm();
            // 修改时，设置数据
            if (id) {
                formLoading.value = true;
                try {
                    formData.value = (await DeviceApi.getDevice(id)).data;
                }
                finally {
                    formLoading.value = false;
                }
            }
            // 加载产品列表
            products.value = (await ProductApi.getSimpleProductList()).data;
            // 加载设备分组列表
            deviceGroups.value = (await DeviceGroupApi.getSimpleDeviceGroupList()).data;
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
                const data = formData.value;
                if (formType.value === 'create') {
                    (await DeviceApi.createDevice(data)).data;
                    message.success(t('common.createSuccess'));
                }
                else {
                    (await DeviceApi.updateDevice(data)).data;
                    message.success(t('common.updateSuccess'));
                }
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
                id: undefined,
                productId: undefined,
                deviceName: undefined,
                nickname: undefined,
                picUrl: undefined,
                deviceType: undefined,
                serialNumber: undefined,
                longitude: undefined,
                latitude: undefined,
                groupIds: []
            };
            formRef.value?.resetFields();
        };
        /** 产品选择变化 */
        const handleProductChange = (productId) => {
            if (!productId) {
                formData.value.deviceType = undefined;
                return;
            }
            const product = products.value?.find((item) => item.id === productId);
            formData.value.deviceType = product?.deviceType;
        };
        const __returned__ = { t, message, dialogVisible, dialogTitle, formLoading, formType, mapDialogRef, formData, openMapDialog, handleMapConfirm, formRules, formRef, products, deviceGroups, open, emit, submitForm, resetForm, handleProductChange, get UploadImg() { return UploadImg; }, get MapDialog() { return MapDialog; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
