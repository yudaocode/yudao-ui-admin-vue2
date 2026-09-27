<template>
<div class="iot-vue2-root">

  <el-form
    ref="innerFormRef"
    :model="condition"
    :rules="conditionRules"
    label-width="110px"
    class="flex flex-col gap-16px"
  >
    <!-- 条件类型选择 -->
    <el-row :gutter="16">
      <el-col :span="8">
        <el-form-item label="条件类型" prop="type" required>
          <el-select
            :value="condition.type"
            @input="(value) => updateConditionField('type', value)"
            @change="handleConditionTypeChange"
            placeholder="请选择条件类型"
            class="w-full"
          >
            <el-option
              v-for="option in getConditionTypeOptions()"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 产品设备选择 - 设备相关条件的公共部分 -->
    <el-row v-if="isDeviceCondition" :gutter="16">
      <el-col :span="12">
        <el-form-item label="产品" prop="productId" required>
          <ProductSelector
            :value="condition.productId"
            @input="(value) => updateConditionField('productId', value)"
            @change="handleProductChange"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="设备" prop="deviceId" required>
          <DeviceSelector
            :value="condition.deviceId"
            @input="(value) => updateConditionField('deviceId', value)"
            :product-id="condition.productId"
            @change="handleDeviceChange"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 设备状态条件配置 -->
    <div
      v-if="condition.type === IotRuleSceneTriggerConditionTypeEnum.DEVICE_STATUS"
      class="flex flex-col gap-16px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="操作符" prop="operator" required>
            <el-select
              :value="condition.operator"
              @input="(value) => updateConditionField('operator', value)"
              placeholder="请选择操作符"
              class="w-full"
            >
              <el-option
                v-for="option in statusOperatorOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="设备状态" prop="param" required>
            <el-select
              :value="condition.param"
              @input="(value) => updateConditionField('param', value)"
              placeholder="请选择设备状态"
              class="w-full"
            >
              <el-option
                v-for="option in deviceStatusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 设备属性条件配置 -->
    <div
      v-else-if="condition.type === IotRuleSceneTriggerConditionTypeEnum.DEVICE_PROPERTY"
      class="space-y-16px"
    >
      <el-row :gutter="16">
        <el-col :span="6">
          <el-form-item label="监控项" prop="identifier" required>
            <PropertySelector
              :value="condition.identifier"
              @input="(value) => updateConditionField('identifier', value)"
              :trigger-type="triggerType"
              :product-id="condition.productId"
              :device-id="condition.deviceId"
              @change="handlePropertyChange"
            />
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="操作符" prop="operator" required>
            <OperatorSelector
              :value="condition.operator"
              @input="(value) => updateConditionField('operator', value)"
              :property-type="propertyType"
              @change="handleOperatorChange"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="比较值" prop="param" required>
            <ValueInput
              :value="condition.param"
              @input="(value) => updateConditionField('param', value)"
              :property-type="propertyType"
              :operator="condition.operator"
              :property-config="propertyConfig"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 当前时间条件配置 -->
    <CurrentTimeConditionConfig
      v-else-if="condition.type === IotRuleSceneTriggerConditionTypeEnum.CURRENT_TIME"
      :value="condition"
      @input="updateCondition"
      @field-change="handleCurrentTimeFieldChange"
    />
  </el-form>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref, computed, nextTick } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { useVModel } from '@/views/iot/utils/composables';
import CurrentTimeConditionConfig from './CurrentTimeConditionConfig.vue';
import ProductSelector from '../selectors/ProductSelector.vue';
import DeviceSelector from '../selectors/DeviceSelector.vue';
import PropertySelector from '../selectors/PropertySelector.vue';
import OperatorSelector from '../selectors/OperatorSelector.vue';
import ValueInput from '../inputs/ValueInput.vue';
import { IotRuleSceneTriggerConditionTypeEnum, IotRuleSceneTriggerConditionParameterOperatorEnum, getConditionTypeOptions, IoTDeviceStatusEnum } from '@/views/iot/utils/constants';
import { buildSubConditionRules } from '@/views/iot/utils/sceneRule';
/** 单个条件配置组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ConditionConfig' },
    components: {
        ProductSelector,
        DeviceSelector,
        PropertySelector,
        OperatorSelector,
        ValueInput,
        CurrentTimeConditionConfig,
    },
    __name: 'ConditionConfig',
    props: {
        value: { type: null, required: true },
        triggerType: { type: Number, required: true }
    },
    emits: ["input"],
    setup(__props, { expose: __expose, emit: __emit }) {
        const props = __props;
        const emit = __emit;
        /** 获取设备状态选项 */
        const deviceStatusOptions = [
            {
                value: IoTDeviceStatusEnum.ONLINE.value,
                label: IoTDeviceStatusEnum.ONLINE.label
            },
            {
                value: IoTDeviceStatusEnum.OFFLINE.value,
                label: IoTDeviceStatusEnum.OFFLINE.label
            }
        ];
        /** 获取状态操作符选项 */
        const statusOperatorOptions = [
            {
                value: IotRuleSceneTriggerConditionParameterOperatorEnum.EQUALS.value,
                label: IotRuleSceneTriggerConditionParameterOperatorEnum.EQUALS.name
            },
            {
                value: IotRuleSceneTriggerConditionParameterOperatorEnum.NOT_EQUALS.value,
                label: IotRuleSceneTriggerConditionParameterOperatorEnum.NOT_EQUALS.name
            }
        ];
        const condition = useVModel(props, 'value', emit);
        const innerFormRef = ref();
        const propertyType = ref('string');
        const propertyConfig = ref(null);
        const isDeviceCondition = computed(() => {
            return (condition.value.type === IotRuleSceneTriggerConditionTypeEnum.DEVICE_STATUS ||
                condition.value.type === IotRuleSceneTriggerConditionTypeEnum.DEVICE_PROPERTY);
        });
        const conditionRules = computed(() => buildSubConditionRules(condition.value.type, () => condition.value.operator));
        /**
         * 更新条件字段
         * @param field 字段名
         * @param value 字段值
         */
        const updateConditionField = (field, value) => {
            ;
            condition.value[field] = value;
            emit('input', condition.value);
            nextTick(() => {
                innerFormRef.value?.validateField(field, () => { });
            });
        };
        /**
         * 更新整个条件对象
         * @param newCondition 新的条件对象
         */
        const updateCondition = (newCondition) => {
            condition.value = newCondition;
            emit('input', condition.value);
        };
        /** 当前时间子组件字段变更后触发校验 */
        const handleCurrentTimeFieldChange = (field) => {
            nextTick(() => {
                innerFormRef.value?.validateField(field, () => { });
            });
        };
        /**
         * 处理条件类型变化事件
         * @param type 条件类型
         */
        const handleConditionTypeChange = (type) => {
            const isCurrentTime = type === IotRuleSceneTriggerConditionTypeEnum.CURRENT_TIME;
            const isDeviceStatus = type === IotRuleSceneTriggerConditionTypeEnum.DEVICE_STATUS;
            if (isCurrentTime || isDeviceStatus) {
                condition.value.identifier = undefined;
            }
            if (isCurrentTime) {
                condition.value.productId = undefined;
                condition.value.deviceId = undefined;
            }
            condition.value.operator = isCurrentTime
                ? 'at_time'
                : IotRuleSceneTriggerConditionParameterOperatorEnum.EQUALS.value;
            condition.value.param = '';
            emit('input', condition.value);
            nextTick(() => clearValidate());
        };
        /** 处理产品变化事件 */
        const handleProductChange = () => {
            condition.value.deviceId = undefined;
            condition.value.identifier = '';
            emit('input', condition.value);
            nextTick(() => {
                innerFormRef.value?.clearValidate(['deviceId', 'identifier']);
            });
        };
        /** 处理设备变化事件 */
        const handleDeviceChange = () => {
            condition.value.identifier = '';
            emit('input', condition.value);
            nextTick(() => {
                innerFormRef.value?.clearValidate('identifier');
            });
        };
        /**
         * 处理属性变化事件
         * @param propertyInfo 属性信息对象
         */
        const handlePropertyChange = (propertyInfo) => {
            propertyType.value = propertyInfo.type;
            propertyConfig.value = propertyInfo.config;
            condition.value.operator = IotRuleSceneTriggerConditionParameterOperatorEnum.EQUALS.value;
            condition.value.param = '';
            emit('input', condition.value);
        };
        /** 处理操作符变化事件 */
        const handleOperatorChange = () => {
            condition.value.param = '';
            emit('input', condition.value);
            nextTick(() => {
                innerFormRef.value?.validateField('param', () => { });
            });
        };
        const validate = async () => {
            if (!innerFormRef.value) {
                return true;
            }
            try {
                await innerFormRef.value.validate();
                return true;
            }
            catch {
                return false;
            }
        };
        const clearValidate = () => {
            innerFormRef.value?.clearValidate();
        };
        __expose({ validate, clearValidate });
        const __returned__ = { props, emit, deviceStatusOptions, statusOperatorOptions, condition, innerFormRef, propertyType, propertyConfig, isDeviceCondition, conditionRules, updateConditionField, updateCondition, handleCurrentTimeFieldChange, handleConditionTypeChange, handleProductChange, handleDeviceChange, handlePropertyChange, handleOperatorChange, validate, clearValidate, CurrentTimeConditionConfig, ProductSelector, DeviceSelector, PropertySelector, OperatorSelector, ValueInput, get IotRuleSceneTriggerConditionTypeEnum() { return IotRuleSceneTriggerConditionTypeEnum; }, get getConditionTypeOptions() { return getConditionTypeOptions; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
<style scoped>

:deep(.el-form-item) {
  margin-bottom: 0;
}

</style>
