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
      <el-form-item label="固件名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入固件名称" />
      </el-form-item>
      <el-form-item label="固件描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入固件描述"
        />
      </el-form-item>
      <el-form-item label="所属产品" prop="productId">
        <el-select
          v-model="formData.productId"
          placeholder="请选择产品"
          clearable
          class="!w-100%"
          :disabled="formType === 'update'"
        >
          <el-option
            v-for="product in productList"
            :key="product.id"
            :label="product.name"
            :value="product.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="版本号" prop="version" v-if="formType === 'create'">
        <el-input v-model="formData.version" placeholder="请输入版本号" />
      </el-form-item>
      <el-form-item label="固件文件" prop="fileUrl" v-if="formType === 'create'">
        <UploadFile
          v-model="formData.fileUrl"
          :file-type="['bin', 'zip', 'pdf']"
          :file-size="50"
          :limit="1"
        />
      </el-form-item>
      <!-- 更新时显示只读信息 -->
      <template v-if="formType === 'update'">
        <el-form-item label="版本号">
          <el-input v-model="formData.version" readonly />
        </el-form-item>
        <el-form-item label="固件文件">
          <el-link
            type="primary"
            :href="formData.fileUrl"
            target="_blank"
            download
            v-if="formData.fileUrl"
          >
            <Icon icon="ep:download" class="mr-5px" />
            下载固件文件
          </el-link>
          <span v-else>无文件</span>
        </el-form-item>
      </template>
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
import { IoTOtaFirmwareApi } from '@/api/iot/ota/firmware';
import { ProductApi } from '@/api/iot/product/product';
import UploadFile from '@/components/FileUpload';
/** IoT OTA 固件表单 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTOtaFirmwareForm' },
    components: {
        UploadFile,
        Icon: IotIcon,
    },
    __name: 'OtaFirmwareForm',
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const { t } = useIotI18n(); // 国际化
        const message = createIotMessage(); // 消息弹窗
        const dialogVisible = ref(false); // 弹窗的是否展示
        const dialogTitle = ref(''); // 弹窗的标题
        const formLoading = ref(false); // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
        const formType = ref(''); // 表单的类型：create - 新增；update - 修改
        const productList = ref([]); // 产品列表
        const formData = ref({
            id: undefined,
            name: undefined,
            description: undefined,
            version: undefined,
            productId: undefined,
            fileUrl: ''
        });
        const formRules = reactive({
            name: [{ required: true, message: '固件名称不能为空', trigger: 'blur' }],
            version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }],
            productId: [{ required: true, message: '产品不能为空', trigger: 'change' }],
            fileUrl: [{ required: true, message: '固件文件不能为空', trigger: 'blur' }]
        });
        const formRef = ref(); // 表单 Ref
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
                    formData.value = (await IoTOtaFirmwareApi.getOtaFirmware(id)).data;
                }
                finally {
                    formLoading.value = false;
                }
            }
            // 获取产品列表
            productList.value = (await ProductApi.getSimpleProductList()).data;
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
                    (await IoTOtaFirmwareApi.createOtaFirmware(data)).data;
                    message.success(t('common.createSuccess'));
                }
                else {
                    // 更新时只提交可编辑的字段
                    (await IoTOtaFirmwareApi.updateOtaFirmware({
                        id: data.id,
                        name: data.name,
                        description: data.description
                    })).data;
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
                name: undefined,
                description: undefined,
                version: undefined,
                productId: undefined,
                fileUrl: ''
            };
            formRef.value?.resetFields();
        };
        const __returned__ = { Icon: IotIcon, t, message, dialogVisible, dialogTitle, formLoading, formType, productList, formData, formRules, formRef, open, emit, submitForm, resetForm, get UploadFile() { return UploadFile; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
