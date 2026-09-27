<template>
<div class="iot-vue2-root">

  <div class="flex items-center gap-8px">
    <el-select
      v-model="localValue"
      placeholder="请选择监控项"
      filterable
      clearable
      @change="handleChange"
      class="!w-150px"
      :loading="loading"
    >
      <el-option-group v-for="group in propertyGroups" :key="group.label" :label="group.label">
        <el-option
          v-for="property in group.options"
          :key="property.identifier"
          :label="property.name"
          :value="property.identifier"
        >
          <div class="flex items-center justify-between w-full py-2px">
            <span class="text-14px font-500 text-[var(--el-text-color-primary)] flex-1 truncate">
              {{ property.name }}
            </span>
            <el-tag
              :type="getDataTypeTagType(property.dataType)"
              size="small"
              class="ml-8px flex-shrink-0"
            >
              {{ property.identifier }}
            </el-tag>
          </div>
        </el-option>
      </el-option-group>
    </el-select>

    <!-- 属性详情弹出层 -->
    <el-popover
      v-if="selectedProperty"
      placement="right-start"
      :width="350"
      trigger="click"
      :show-arrow="true"
      :offset="8"
      popper-class="property-detail-popover"
    >
      <template #reference>
        <el-button
          type="info"
          icon="el-icon-info"
          circle
          size="small"
          class="flex-shrink-0"
          title="查看属性详情"
        />
      </template>

      <!-- 弹出层内容 -->
      <div class="property-detail-content">
        <div class="flex items-center gap-8px mb-12px">
          <Icon icon="ep:info-filled" class="text-[var(--el-color-info)] text-16px" />
          <span class="text-14px font-500 text-[var(--el-text-color-primary)]">
            {{ selectedProperty.name }}
          </span>
          <el-tag :type="getDataTypeTagType(selectedProperty.dataType)" size="small">
            {{ getDataTypeName(selectedProperty.dataType) }}
          </el-tag>
        </div>

        <div class="space-y-8px ml-24px">
          <div class="flex items-start gap-8px">
            <span class="text-12px text-[var(--el-text-color-secondary)] min-w-60px flex-shrink-0">
              标识符：
            </span>
            <span class="text-12px text-[var(--el-text-color-primary)] flex-1">
              {{ selectedProperty.identifier }}
            </span>
          </div>

          <div v-if="selectedProperty.description" class="flex items-start gap-8px">
            <span class="text-12px text-[var(--el-text-color-secondary)] min-w-60px flex-shrink-0">
              描述：
            </span>
            <span class="text-12px text-[var(--el-text-color-primary)] flex-1">
              {{ selectedProperty.description }}
            </span>
          </div>

          <div v-if="selectedProperty.unit" class="flex items-start gap-8px">
            <span class="text-12px text-[var(--el-text-color-secondary)] min-w-60px flex-shrink-0">
              单位：
            </span>
            <span class="text-12px text-[var(--el-text-color-primary)] flex-1">
              {{ selectedProperty.unit }}
            </span>
          </div>

          <div v-if="selectedProperty.range" class="flex items-start gap-8px">
            <span class="text-12px text-[var(--el-text-color-secondary)] min-w-60px flex-shrink-0">
              取值范围：
            </span>
            <span class="text-12px text-[var(--el-text-color-primary)] flex-1">
              {{ selectedProperty.range }}
            </span>
          </div>

          <!-- 根据属性类型显示额外信息 -->
          <div
            v-if="
              selectedProperty.type === IoTThingModelTypeEnum.PROPERTY &&
              selectedProperty.accessMode
            "
            class="flex items-start gap-8px"
          >
            <span class="text-12px text-[var(--el-text-color-secondary)] min-w-60px flex-shrink-0">
              访问模式：
            </span>
            <span class="text-12px text-[var(--el-text-color-primary)] flex-1">
              {{ getAccessModeLabel(selectedProperty.accessMode) }}
            </span>
          </div>

          <div
            v-if="
              selectedProperty.type === IoTThingModelTypeEnum.EVENT && selectedProperty.eventType
            "
            class="flex items-start gap-8px"
          >
            <span class="text-12px text-[var(--el-text-color-secondary)] min-w-60px flex-shrink-0">
              事件类型：
            </span>
            <span class="text-12px text-[var(--el-text-color-primary)] flex-1">
              {{ getEventTypeLabel(selectedProperty.eventType) }}
            </span>
          </div>

          <div
            v-if="
              selectedProperty.type === IoTThingModelTypeEnum.SERVICE && selectedProperty.callType
            "
            class="flex items-start gap-8px"
          >
            <span class="text-12px text-[var(--el-text-color-secondary)] min-w-60px flex-shrink-0">
              调用类型：
            </span>
            <span class="text-12px text-[var(--el-text-color-primary)] flex-1">
              {{ getThingModelServiceCallTypeLabel(selectedProperty.callType) }}
            </span>
          </div>
        </div>
      </div>
    </el-popover>
  </div>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { ref, computed, watch } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { useVModel } from '@/views/iot/utils/composables';
import { IotRuleSceneTriggerTypeEnum, IoTThingModelTypeEnum, getAccessModeLabel, getEventTypeLabel, getThingModelServiceCallTypeLabel, getDataTypeName, getDataTypeTagType, THING_MODEL_GROUP_LABELS } from '@/views/iot/utils/constants';
import { ThingModelApi } from '@/api/iot/thingmodel';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'PropertySelector' },
    components: {
        Icon: IotIcon,
    },
    __name: 'PropertySelector',
    props: {
        value: { type: String, required: false },
        triggerType: { type: Number, required: true },
        productId: { type: Number, required: false },
        deviceId: { type: Number, required: false }
    },
    emits: ["input", "change"],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        /** 属性选择器内部使用的统一数据结构 */
        const props = __props;
        const emit = __emit;
        const localValue = useVModel(props, 'value', emit);
        const loading = ref(false); // 加载状态
        const propertyList = ref([]); // 属性列表
        const thingModelTSL = ref(null); // 物模型TSL数据
        // 计算属性：属性分组
        const propertyGroups = computed(() => {
            const groups = [];
            // 设备属性上报触发器、定时触发器（条件组中的设备属性条件）
            if (props.triggerType === IotRuleSceneTriggerTypeEnum.DEVICE_PROPERTY_POST ||
                props.triggerType === IotRuleSceneTriggerTypeEnum.TIMER) {
                const propertyOptions = propertyList.value.filter((property) => property.type === IoTThingModelTypeEnum.PROPERTY);
                if (propertyOptions.length > 0) {
                    groups.push({
                        label: THING_MODEL_GROUP_LABELS.PROPERTY,
                        options: propertyOptions
                    });
                }
            }
            // 设备事件上报触发器
            if (props.triggerType === IotRuleSceneTriggerTypeEnum.DEVICE_EVENT_POST) {
                groups.push({
                    label: THING_MODEL_GROUP_LABELS.EVENT,
                    options: propertyList.value.filter((p) => p.type === IoTThingModelTypeEnum.EVENT)
                });
            }
            // 设备服务调用触发器
            if (props.triggerType === IotRuleSceneTriggerTypeEnum.DEVICE_SERVICE_INVOKE) {
                groups.push({
                    label: THING_MODEL_GROUP_LABELS.SERVICE,
                    options: propertyList.value.filter((p) => p.type === IoTThingModelTypeEnum.SERVICE)
                });
            }
            return groups.filter((group) => group.options.length > 0);
        });
        // 计算属性：当前选中的属性
        const selectedProperty = computed(() => {
            return propertyList.value.find((p) => p.identifier === localValue.value);
        });
        /**
         * 处理选择变化事件
         * @param value 选中的属性标识符
         */
        const handleChange = (value) => {
            const property = propertyList.value.find((p) => p.identifier === value);
            if (property) {
                emit('change', {
                    type: property.dataType,
                    config: property
                });
            }
        };
        /**
         * 获取物模型TSL数据
         */
        const getThingModelTSL = async () => {
            if (!props.productId) {
                thingModelTSL.value = null;
                propertyList.value = [];
                return;
            }
            loading.value = true;
            try {
                const tslData = (await ThingModelApi.getThingModelTSLByProductId(props.productId)).data;
                if (tslData) {
                    thingModelTSL.value = tslData;
                    parseThingModelData();
                }
                else {
                    console.error('获取物模型TSL失败: 返回数据为空');
                    propertyList.value = [];
                }
            }
            catch (error) {
                console.error('获取物模型TSL失败:', error);
                propertyList.value = [];
            }
            finally {
                loading.value = false;
            }
        };
        /** 解析物模型 TSL 数据 */
        const parseThingModelData = () => {
            const tsl = thingModelTSL.value;
            const properties = [];
            if (!tsl) {
                propertyList.value = properties;
                return;
            }
            // 解析属性
            if (tsl.properties && Array.isArray(tsl.properties)) {
                tsl.properties.forEach((prop) => {
                    properties.push({
                        identifier: prop.identifier,
                        name: prop.name,
                        description: prop.description,
                        dataType: prop.dataType,
                        type: IoTThingModelTypeEnum.PROPERTY,
                        accessMode: prop.accessMode,
                        required: prop.required,
                        unit: getPropertyUnit(prop),
                        range: getPropertyRange(prop),
                        property: prop
                    });
                });
            }
            // 解析事件
            if (tsl.events && Array.isArray(tsl.events)) {
                tsl.events.forEach((event) => {
                    properties.push({
                        identifier: event.identifier,
                        name: event.name,
                        description: event.description,
                        dataType: 'struct',
                        type: IoTThingModelTypeEnum.EVENT,
                        eventType: event.type,
                        required: event.required,
                        outputParams: event.outputParams,
                        event: event
                    });
                });
            }
            // 解析服务
            if (tsl.services && Array.isArray(tsl.services)) {
                tsl.services.forEach((service) => {
                    properties.push({
                        identifier: service.identifier,
                        name: service.name,
                        description: service.description,
                        dataType: 'struct',
                        type: IoTThingModelTypeEnum.SERVICE,
                        callType: service.callType,
                        required: service.required,
                        inputParams: service.inputParams,
                        outputParams: service.outputParams,
                        service: service
                    });
                });
            }
            propertyList.value = properties;
        };
        /**
         * 获取属性单位
         * @param property 属性对象
         * @returns 属性单位
         */
        const getPropertyUnit = (property) => {
            if (!property)
                return undefined;
            // 数值型数据的单位
            if (property.dataSpecs && property.dataSpecs.unit) {
                return property.dataSpecs.unit;
            }
            return undefined;
        };
        /**
         * 获取属性范围描述
         * @param property 属性对象
         * @returns 属性范围描述
         */
        const getPropertyRange = (property) => {
            if (!property)
                return undefined;
            // 数值型数据的范围
            if (property.dataSpecs) {
                const specs = property.dataSpecs;
                if (specs.min !== undefined && specs.max !== undefined) {
                    return `${specs.min}~${specs.max}`;
                }
            }
            // 枚举型和布尔型数据的选项
            if (property.dataSpecsList && Array.isArray(property.dataSpecsList)) {
                return property.dataSpecsList.map((item) => `${item.name}(${item.value})`).join(', ');
            }
            return undefined;
        };
        /** 监听产品变化 */
        watch(() => props.productId, () => {
            getThingModelTSL();
        }, { immediate: true });
        /** 监听触发类型变化 */
        watch(() => props.triggerType, () => {
            localValue.value = '';
        });
        const __returned__ = { Icon: IotIcon, props, emit, localValue, loading, propertyList, thingModelTSL, propertyGroups, selectedProperty, handleChange, getThingModelTSL, parseThingModelData, getPropertyUnit, getPropertyRange, get IoTThingModelTypeEnum() { return IoTThingModelTypeEnum; }, get getAccessModeLabel() { return getAccessModeLabel; }, get getEventTypeLabel() { return getEventTypeLabel; }, get getThingModelServiceCallTypeLabel() { return getThingModelServiceCallTypeLabel; }, get getDataTypeName() { return getDataTypeName; }, get getDataTypeTagType() { return getDataTypeTagType; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
<style scoped>

/* 下拉选项样式 */
:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 6px 20px;
}

/* 弹出层内容样式 */
.property-detail-content {
  padding: 4px 0;
}

/* 弹出层自定义样式 */
:global(.property-detail-popover) {
  /* 可以在这里添加全局弹出层样式 */
  max-width: 400px !important;
}

:global(.property-detail-popover .el-popover__content) {
  padding: 16px !important;
}

</style>
