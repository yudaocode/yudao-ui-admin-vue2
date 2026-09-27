<template>
<div class="iot-vue2-root">

  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="ProductKey" prop="productKey">
        <el-input
          v-model="formData.productKey"
          placeholder="请输入 ProductKey"
          :readonly="formType === 'update'"
        >
          <template #append>
            <el-button @click="generateProductKey" :disabled="formType === 'update'">
              重新生成
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="产品名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入产品名称" />
      </el-form-item>
      <el-form-item label="产品分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择产品分类" clearable>
          <el-option
            v-for="category in categoryList"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-radio-group v-model="formData.deviceType" :disabled="formType === 'update'">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.IOT_PRODUCT_DEVICE_TYPE)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="[DeviceTypeEnum.DEVICE, DeviceTypeEnum.GATEWAY].includes(formData.deviceType)"
        label="联网方式"
        prop="netType"
      >
        <el-select v-model="formData.netType" placeholder="请选择联网方式">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.IOT_NET_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="协议类型" prop="protocolType">
        <el-select v-model="formData.protocolType" placeholder="请选择协议类型">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.IOT_PROTOCOL_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="serializeType">
        <template #label>
          <el-tooltip
            content="iot-gateway-server 默认根据接入的协议类型确定数据格式，仅 MQTT、EMQX 协议支持自定义序列化类型"
            placement="top"
          >
            <span>
              序列化类型
              <Icon icon="ep:question-filled" class="ml-2px" />
            </span>
          </el-tooltip>
        </template>
        <el-select v-model="formData.serializeType" placeholder="请选择序列化类型">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.IOT_SERIALIZE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-collapse>
        <el-collapse-item title="更多配置">
          <el-form-item label="动态注册" prop="registerEnabled">
            <template #label>
              <el-tooltip
                content="设备动态注册无需一一烧录设备证书（DeviceSecret），每台设备烧录相同的产品证书，即 ProductKey 和 ProductSecret ，云端鉴权通过后下发设备证书，您可以根据需要开启或关闭动态注册，保障安全性。"
                placement="top"
              >
                <span>
                  动态注册
                  <Icon icon="ep:question-filled" class="ml-2px" />
                </span>
              </el-tooltip>
            </template>
            <el-switch v-model="formData.registerEnabled" />
          </el-form-item>
          <el-form-item label="产品图标" prop="icon">
            <UploadImg v-model="formData.icon" :height="'80px'" :width="'80px'" />
          </el-form-item>
          <el-form-item label="产品图片" prop="picUrl">
            <UploadImg v-model="formData.picUrl" :height="'120px'" :width="'120px'" />
          </el-form-item>
          <el-form-item label="产品描述" prop="description">
            <el-input type="textarea" v-model="formData.description" placeholder="请输入产品描述" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
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
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { ref, reactive } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { ProductApi, ProtocolTypeEnum, SerializeTypeEnum, DeviceTypeEnum } from '@/api/iot/product/product';
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict';
import { ProductCategoryApi } from '@/api/iot/product/category';
import UploadImg from '@/components/UploadImg';
import { generateRandomStr } from '@/utils';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTProductForm' },
    components: {
        Icon: IotIcon,
        UploadImg,
    },
    __name: 'ProductForm',
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const { t } = useIotI18n();
        const message = createIotMessage();
        const dialogVisible = ref(false);
        const dialogTitle = ref('');
        const formLoading = ref(false);
        const formType = ref('');
        const formData = ref({
            id: undefined,
            name: undefined,
            productKey: '',
            categoryId: undefined,
            icon: undefined,
            picUrl: undefined,
            description: undefined,
            deviceType: undefined,
            netType: undefined,
            protocolType: ProtocolTypeEnum.MQTT,
            serializeType: SerializeTypeEnum.JSON,
            registerEnabled: false
        });
        const formRules = reactive({
            productKey: [{ required: true, message: 'ProductKey 不能为空', trigger: 'blur' }],
            name: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
            categoryId: [{ required: true, message: '产品分类不能为空', trigger: 'change' }],
            deviceType: [{ required: true, message: '设备类型不能为空', trigger: 'change' }],
            netType: [
                {
                    required: true,
                    message: '联网方式不能为空',
                    trigger: 'change'
                }
            ],
            protocolType: [{ required: true, message: '协议类型不能为空', trigger: 'change' }],
            serializeType: [{ required: true, message: '序列化类型不能为空', trigger: 'change' }]
        });
        const formRef = ref();
        const categoryList = ref([]); // 产品分类列表
        /** 打开弹窗 */
        const open = async (type, id) => {
            dialogVisible.value = true;
            dialogTitle.value = t('action.' + type);
            formType.value = type;
            resetForm();
            if (id) {
                formLoading.value = true;
                try {
                    formData.value = (await ProductApi.getProduct(id)).data;
                }
                finally {
                    formLoading.value = false;
                }
            }
            else {
                // 新增时，生成随机 productKey
                generateProductKey();
            }
            // 加载分类列表
            categoryList.value = (await ProductCategoryApi.getSimpleProductCategoryList()).data;
        };
        __expose({ open, close: () => (dialogVisible.value = false) });
        /** 提交表单 */
        const emit = __emit;
        const submitForm = async () => {
            await formRef.value.validate();
            formLoading.value = true;
            try {
                const data = formData.value;
                if (formType.value === 'create') {
                    (await ProductApi.createProduct(data)).data;
                    message.success(t('common.createSuccess'));
                }
                else {
                    (await ProductApi.updateProduct(data)).data;
                    message.success(t('common.updateSuccess'));
                }
                dialogVisible.value = false; // 确保关闭弹框
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
                name: undefined,
                productKey: '',
                categoryId: undefined,
                icon: undefined,
                picUrl: undefined,
                description: undefined,
                deviceType: undefined,
                netType: undefined,
                protocolType: ProtocolTypeEnum.MQTT,
                serializeType: SerializeTypeEnum.JSON,
                registerEnabled: false
            };
            formRef.value?.resetFields();
        };
        /** 生成 ProductKey */
        const generateProductKey = () => {
            formData.value.productKey = generateRandomStr(16);
        };
        const __returned__ = { Icon: IotIcon, t, message, dialogVisible, dialogTitle, formLoading, formType, formData, formRules, formRef, categoryList, open, emit, submitForm, resetForm, generateProductKey, get DeviceTypeEnum() { return DeviceTypeEnum; }, get DICT_TYPE() { return DICT_TYPE; }, get getIntDictOptions() { return getIntDictOptions; }, get getStrDictOptions() { return getStrDictOptions; }, get UploadImg() { return UploadImg; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
