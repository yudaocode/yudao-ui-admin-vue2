<template>
<div class="iot-vue2-root">

  <el-dialog :visible.sync="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="ThingModelFormRules"
      label-width="100px"
    >
      <el-form-item label="功能类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button
            v-for="dict in getIntDictOptions(DICT_TYPE.IOT_THING_MODEL_TYPE)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="功能名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入功能名称" />
      </el-form-item>
      <el-form-item label="标识符" prop="identifier">
        <el-input v-model="formData.identifier" placeholder="请输入标识符" />
      </el-form-item>
      <!-- 属性配置 -->
      <ThingModelProperty
        v-if="formData.type === IoTThingModelTypeEnum.PROPERTY"
        v-model="formData.property"
      />
      <!-- 服务配置 -->
      <ThingModelService
        v-if="formData.type === IoTThingModelTypeEnum.SERVICE"
        v-model="formData.service"
      />
      <!-- 事件配置 -->
      <ThingModelEvent
        v-if="formData.type === IoTThingModelTypeEnum.EVENT"
        v-model="formData.event"
      />
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          :maxlength="200"
          :rows="3"
          placeholder="请输入属性描述"
          type="textarea"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { useIotI18n } from '@/views/iot/utils/ui';
import { ref, inject } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import ThingModelProperty from './ThingModelProperty.vue';
import ThingModelService from './ThingModelService.vue';
import ThingModelEvent from './ThingModelEvent.vue';
import { ThingModelApi, ThingModelFormRules } from '@/api/iot/thingmodel';
import { IOT_PROVIDE_KEY, IoTDataSpecsDataTypeEnum, IoTThingModelTypeEnum } from '@/views/iot/utils/constants';
import { cloneDeep } from 'lodash';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { isEmpty } from '@/utils/is';
/** IoT 物模型数据表单 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTThingModelForm' },
    components: {
        ThingModelProperty,
        ThingModelService,
        ThingModelEvent,
    },
    __name: 'ThingModelForm',
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const product = inject(IOT_PROVIDE_KEY.PRODUCT); // 注入产品信息
        const { t } = useIotI18n(); // 国际化
        const message = createIotMessage(); // 消息弹窗
        const dialogVisible = ref(false); // 弹窗的是否展示
        const dialogTitle = ref(''); // 弹窗的标题
        const formLoading = ref(false); // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
        const formType = ref(''); // 表单的类型：create - 新增；update - 修改
        const formData = ref({
            type: IoTThingModelTypeEnum.PROPERTY,
            dataType: IoTDataSpecsDataTypeEnum.INT,
            property: {
                dataType: IoTDataSpecsDataTypeEnum.INT,
                dataSpecs: {
                    dataType: IoTDataSpecsDataTypeEnum.INT
                }
            },
            service: {},
            event: {}
        });
        const formRef = ref(); // 表单 Ref
        /** 打开弹窗 */
        const open = async (type, id) => {
            var _a, _b, _c;
            dialogVisible.value = true;
            dialogTitle.value = t('action.' + type);
            formType.value = type;
            resetForm();
            if (id) {
                formLoading.value = true;
                try {
                    formData.value = (await ThingModelApi.getThingModel(id)).data;
                    // 情况一：属性初始化
                    if (isEmpty(formData.value.property)) {
                        formData.value.dataType = IoTDataSpecsDataTypeEnum.INT;
                        formData.value.property = {
                            dataType: IoTDataSpecsDataTypeEnum.INT,
                            dataSpecs: {
                                dataType: IoTDataSpecsDataTypeEnum.INT
                            }
                        };
                    }
                    // 情况二：服务初始化
                    if (isEmpty(formData.value.service)) {
                        formData.value.service = {
                            inputParams: [],
                            outputParams: []
                        };
                    }
                    else {
                        (_a = formData.value.service).inputParams ?? (_a.inputParams = []);
                        (_b = formData.value.service).outputParams ?? (_b.outputParams = []);
                    }
                    // 情况三：事件初始化
                    if (isEmpty(formData.value.event)) {
                        formData.value.event = { outputParams: [] };
                    }
                    else {
                        (_c = formData.value.event).outputParams ?? (_c.outputParams = []);
                    }
                }
                finally {
                    formLoading.value = false;
                }
            }
        };
        __expose({ open, close: () => (dialogVisible.value = false) });
        /** 提交表单 */
        const emit = __emit;
        const submitForm = async () => {
            await formRef.value.validate();
            formLoading.value = true;
            try {
                const data = cloneDeep(formData.value);
                // 信息补全
                data.productId = product.value.id;
                data.productKey = product.value.productKey;
                fillExtraAttributes(data);
                if (formType.value === 'create') {
                    (await ThingModelApi.createThingModel(data)).data;
                    message.success(t('common.createSuccess'));
                }
                else {
                    (await ThingModelApi.updateThingModel(data)).data;
                    message.success(t('common.updateSuccess'));
                }
                // 关闭弹窗
                dialogVisible.value = false;
                emit('success');
            }
            finally {
                formLoading.value = false;
            }
        };
        /** 填写额外的属性（处理不同类型的情况） */
        const fillExtraAttributes = (data) => {
            // 属性
            if (data.type === IoTThingModelTypeEnum.PROPERTY) {
                removeDataSpecs(data.property);
                data.dataType = data.property.dataType;
                data.property.identifier = data.identifier;
                data.property.name = data.name;
                delete data.service;
                delete data.event;
            }
            // 服务
            if (data.type === IoTThingModelTypeEnum.SERVICE) {
                removeDataSpecs(data.service);
                data.dataType = data.service.dataType;
                data.service.identifier = data.identifier;
                data.service.name = data.name;
                delete data.property;
                delete data.event;
            }
            // 事件
            if (data.type === IoTThingModelTypeEnum.EVENT) {
                removeDataSpecs(data.event);
                data.dataType = data.event.dataType;
                data.event.identifier = data.identifier;
                data.event.name = data.name;
                delete data.property;
                delete data.service;
            }
        };
        /** 处理 dataSpecs 为空的情况 */
        const removeDataSpecs = (val) => {
            if (isEmpty(val.dataSpecs)) {
                delete val.dataSpecs;
            }
            if (isEmpty(val.dataSpecsList)) {
                delete val.dataSpecsList;
            }
        };
        /** 重置表单 */
        const resetForm = () => {
            formData.value = {
                type: IoTThingModelTypeEnum.PROPERTY,
                dataType: IoTDataSpecsDataTypeEnum.INT,
                property: {
                    dataType: IoTDataSpecsDataTypeEnum.INT,
                    dataSpecs: {
                        dataType: IoTDataSpecsDataTypeEnum.INT
                    }
                },
                service: {},
                event: {}
            };
            formRef.value?.resetFields();
        };
        const __returned__ = { product, t, message, dialogVisible, dialogTitle, formLoading, formType, formData, formRef, open, emit, submitForm, fillExtraAttributes, removeDataSpecs, resetForm, ThingModelProperty, ThingModelService, ThingModelEvent, get ThingModelFormRules() { return ThingModelFormRules; }, get IoTThingModelTypeEnum() { return IoTThingModelTypeEnum; }, get DICT_TYPE() { return DICT_TYPE; }, get getIntDictOptions() { return getIntDictOptions; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
