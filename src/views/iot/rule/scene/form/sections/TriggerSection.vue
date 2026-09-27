<template>
<div class="iot-vue2-root">

  <el-card class="border border-[var(--el-border-color-light)] rounded-8px mb-10px" shadow="never">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-8px">
          <Icon icon="ep:lightning" class="text-[var(--el-color-primary)] text-18px" />
          <span class="text-16px font-600 text-[var(--el-text-color-primary)]">触发器配置</span>
          <el-tag size="small" type="info">{{ triggers.length }} 个触发器</el-tag>
        </div>
        <el-button type="primary" size="small" @click="addTrigger">
          <Icon icon="ep:plus" />
          添加触发器
        </el-button>
      </div>
    </template>

    <div class="p-16px space-y-24px">
      <!-- 触发器列表 -->
      <div v-if="triggers.length > 0" class="space-y-24px">
        <div
          v-for="(triggerItem, index) in triggers"
          :key="`trigger-${index}`"
          class="border-2 border-green-200 rounded-8px bg-green-50 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- 触发器头部 - 绿色主题 -->
          <div
            class="flex items-center justify-between p-16px bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 rounded-t-6px"
          >
            <div class="flex items-center gap-12px">
              <div class="flex items-center gap-8px text-16px font-600 text-green-700">
                <div
                  class="w-24px h-24px bg-green-500 text-white rounded-full flex items-center justify-center text-12px font-bold"
                >
                  {{ index + 1 }}
                </div>
                <span>触发器 {{ index + 1 }}</span>
              </div>
              <el-tag size="small" :type="getTriggerTagType(triggerItem.type)" class="font-500">
                {{ getTriggerTypeLabel(triggerItem.type) }}
              </el-tag>
            </div>
            <div class="flex items-center gap-8px">
              <el-button
                v-if="triggers.length > 1"
                type="danger"
                size="small"
                text
                @click="removeTrigger(index)"
                class="hover:bg-red-50"
              >
                <Icon icon="ep:delete" />
                删除
              </el-button>
            </div>
          </div>

          <!-- 触发器内容区域 -->
          <div class="p-16px space-y-16px">
            <!-- 设备触发配置 -->
            <DeviceTriggerConfig
              v-if="isDeviceTrigger(triggerItem.type)"
              :ref="(el) => setDeviceTriggerRef(el, index)"
              :value="triggerItem"
              :index="index"
              @input="(value) => updateTriggerDeviceConfig(index, value)"
              @trigger-type-change="(type) => updateTriggerType(index, type)"
            />

            <!-- 定时触发配置 -->
            <div
              v-else-if="triggerItem.type === IotRuleSceneTriggerTypeEnum.TIMER"
              class="flex flex-col gap-16px"
            >
              <div
                class="flex items-center gap-8px p-12px px-16px bg-[var(--el-fill-color-light)] rounded-6px border border-[var(--el-border-color-lighter)]"
              >
                <Icon icon="ep:timer" class="text-[var(--el-color-danger)] text-18px" />
                <span class="text-14px font-500 text-[var(--el-text-color-primary)]">
                  定时触发配置
                </span>
              </div>

              <!-- CRON 表达式配置 -->
              <div
                class="p-16px border border-[var(--el-border-color-lighter)] rounded-6px bg-[var(--el-fill-color-blank)]"
              >
                <el-form-item label="CRON表达式" required>
                  <Crontab
                    :value="triggerItem.cronExpression || '0 0 12 * * ?'"
                    @input="(value) => updateTriggerCronConfig(index, value)"
                  />
                </el-form-item>
              </div>

              <!-- 附加条件组配置 -->
              <TimerConditionGroupConfig
                :ref="(el) => setTimerConditionRef(el, index)"
                :value="triggerItem.conditionGroups"
                @input="(value) => updateTriggerConditionGroups(index, value)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="py-40px text-center">
        <el-empty description="暂无触发器">
          <template #description>
            <div class="space-y-8px">
              <p class="text-[var(--el-text-color-secondary)]">暂无触发器配置</p>
              <p class="text-12px text-[var(--el-text-color-placeholder)]">
                请使用上方的"添加触发器"按钮来设置触发规则
              </p>
            </div>
          </template>
        </el-empty>
      </div>
    </div>
  </el-card>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { ref, onMounted, nextTick } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { useVModel } from '@/views/iot/utils/composables';
import DeviceTriggerConfig from '../configs/DeviceTriggerConfig.vue';
import TimerConditionGroupConfig from '../configs/TimerConditionGroupConfig.vue';
import Crontab from '@/components/Crontab';
import { getTriggerTypeLabel, IotRuleSceneTriggerTypeEnum, IotRuleSceneTriggerConditionParameterOperatorEnum, isDeviceTrigger } from '@/views/iot/utils/constants';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'TriggerSection' },
    components: {
        Icon: IotIcon,
        DeviceTriggerConfig,
        Crontab,
        TimerConditionGroupConfig,
    },
    __name: 'TriggerSection',
    props: {
        triggers: { type: Array, required: true }
    },
    emits: ["update:triggers"],
    setup(__props, { expose: __expose, emit: __emit }) {
        const props = __props;
        const emit = __emit;
        const triggers = useVModel(props, 'triggers', emit);
        const deviceTriggerRefs = ref({});
        const timerConditionRefs = ref({});
        const setDeviceTriggerRef = (el, index) => {
            if (el) {
                deviceTriggerRefs.value[index] = el;
            }
            else {
                delete deviceTriggerRefs.value[index];
            }
        };
        const setTimerConditionRef = (el, index) => {
            if (el) {
                timerConditionRefs.value[index] = el;
            }
            else {
                delete timerConditionRefs.value[index];
            }
        };
        /** 校验所有触发器（主条件 + 附加子条件组） */
        const validateAllTriggers = async () => {
            for (let i = 0; i < triggers.value.length; i++) {
                const triggerItem = triggers.value[i];
                if (isDeviceTrigger(triggerItem.type)) {
                    const deviceConfig = deviceTriggerRefs.value[i];
                    if (deviceConfig?.validate) {
                        const valid = await deviceConfig.validate();
                        if (!valid) {
                            return false;
                        }
                    }
                    continue;
                }
                if (triggerItem.type === IotRuleSceneTriggerTypeEnum.TIMER) {
                    const timerConfig = timerConditionRefs.value[i];
                    if (timerConfig?.validate) {
                        const valid = await timerConfig.validate();
                        if (!valid) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        const clearAllTriggerValidate = () => {
            Object.values(deviceTriggerRefs.value).forEach((ref) => ref.clearValidate?.());
            Object.values(timerConditionRefs.value).forEach((ref) => ref.clearValidate?.());
        };
        __expose({ validateAllTriggers, clearAllTriggerValidate });
        /** 获取触发器标签类型（用于 el-tag 的 type 属性） */
        const getTriggerTagType = (type) => {
            if (type === IotRuleSceneTriggerTypeEnum.TIMER) {
                return 'warning';
            }
            return isDeviceTrigger(type) ? 'success' : 'info';
        };
        /** 添加触发器 */
        const addTrigger = () => {
            const newTrigger = {
                type: IotRuleSceneTriggerTypeEnum.DEVICE_STATE_UPDATE,
                productId: undefined,
                deviceId: undefined,
                identifier: undefined,
                operator: IotRuleSceneTriggerConditionParameterOperatorEnum.EQUALS.value,
                value: undefined,
                cronExpression: undefined,
                conditionGroups: [] // 空的条件组数组
            };
            triggers.value.push(newTrigger);
        };
        /**
         * 删除触发器
         * @param index 触发器索引
         */
        const removeTrigger = (index) => {
            if (triggers.value.length > 1) {
                triggers.value.splice(index, 1);
            }
        };
        /**
         * 更新触发器类型
         * @param index 触发器索引
         * @param type 触发器类型
         */
        const updateTriggerType = (index, type) => {
            triggers.value[index].type = type;
            onTriggerTypeChange(index, type);
        };
        /**
         * 更新触发器设备配置
         * @param index 触发器索引
         * @param newTrigger 新的触发器对象
         */
        const updateTriggerDeviceConfig = (index, newTrigger) => {
            triggers.value[index] = newTrigger;
        };
        /**
         * 更新触发器 CRON 配置
         * @param index 触发器索引
         * @param cronExpression CRON 表达式
         */
        const updateTriggerCronConfig = (index, cronExpression) => {
            triggers.value[index].cronExpression = cronExpression;
        };
        /**
         * 更新触发器条件组配置
         * @param index 触发器索引
         * @param conditionGroups 条件组数组
         */
        const updateTriggerConditionGroups = (index, conditionGroups) => {
            triggers.value[index].conditionGroups = conditionGroups;
        };
        /**
         * 处理触发器类型变化事件
         * @param index 触发器索引
         * @param _ 触发器类型（未使用）
         */
        const onTriggerTypeChange = (index, type) => {
            const triggerItem = triggers.value[index];
            triggerItem.productId = undefined;
            triggerItem.deviceId = undefined;
            triggerItem.identifier = undefined;
            triggerItem.operator = undefined;
            triggerItem.value = undefined;
            triggerItem.cronExpression = undefined;
            triggerItem.conditionGroups = [];
            if (type === IotRuleSceneTriggerTypeEnum.DEVICE_STATE_UPDATE) {
                triggerItem.operator = IotRuleSceneTriggerConditionParameterOperatorEnum.EQUALS.value;
            }
            nextTick(() => deviceTriggerRefs.value[index]?.clearValidate?.());
        };
        /** 初始化：确保至少有一个触发器 */
        onMounted(() => {
            if (triggers.value.length === 0) {
                addTrigger();
            }
        });
        const __returned__ = { Icon: IotIcon, props, emit, triggers, deviceTriggerRefs, timerConditionRefs, setDeviceTriggerRef, setTimerConditionRef, validateAllTriggers, clearAllTriggerValidate, getTriggerTagType, addTrigger, removeTrigger, updateTriggerType, updateTriggerDeviceConfig, updateTriggerCronConfig, updateTriggerConditionGroups, onTriggerTypeChange, DeviceTriggerConfig, TimerConditionGroupConfig, get Crontab() { return Crontab; }, get getTriggerTypeLabel() { return getTriggerTypeLabel; }, get IotRuleSceneTriggerTypeEnum() { return IotRuleSceneTriggerTypeEnum; }, get isDeviceTrigger() { return isDeviceTrigger; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
