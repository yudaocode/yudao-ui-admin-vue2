<template>
<div class="iot-vue2-root">

  <el-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    size="80%"
    direction="rtl"
    :close-on-click-modal="true"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
      <!-- 基础信息配置 -->
      <BasicInfoSection v-model="formData" :rules="formRules" />
      <!-- 触发器配置 -->
      <TriggerSection ref="triggerSectionRef" :triggers.sync="formData.triggers" />
      <!-- 执行器配置 -->
      <ActionSection ref="actionSectionRef" :actions.sync="formData.actions" />
    </el-form>
    <!-- Element UI 2.x el-drawer 无 footer 插槽：页脚按钮放入默认插槽（对齐仓库 Vue2 drawer 约定） -->
    <div class="drawer-footer">
      <el-button :disabled="submitLoading" type="primary" @click="handleSubmit">
        <Icon icon="ep:check" />
        确 定
      </el-button>
      <el-button @click="handleClose">
        <Icon icon="ep:close" />
        取 消
      </el-button>
    </div>
  </el-drawer>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { useVModel } from '@/views/iot/utils/composables';
import BasicInfoSection from './sections/BasicInfoSection.vue';
import TriggerSection from './sections/TriggerSection.vue';
import ActionSection from './sections/ActionSection.vue';
import { RuleSceneApi } from '@/api/iot/rule/scene';
import { IotRuleSceneTriggerTypeEnum } from '@/views/iot/utils/constants';
import { validateActionItem, validateTriggerItem } from '@/views/iot/utils/sceneRule';
import { Message as ElMessage } from 'element-ui';
import { CommonStatusEnum } from '@/utils/constants';
/** IoT 场景联动规则表单 - 主表单组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'RuleSceneForm' },
    components: {
        BasicInfoSection,
        TriggerSection,
        ActionSection,
        Icon: IotIcon,
    },
    __name: 'RuleSceneForm',
    props: {
        value: { type: Boolean, required: true },
        ruleScene: { type: null, required: false }
    },
    emits: ["input", "success"],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        /** 组件属性定义 */
        const props = __props;
        /** 组件事件定义 */
        const emit = __emit;
        const drawerVisible = useVModel(props, 'value', emit); // 抽屉显示状态
        /**
         * 创建默认的表单数据
         * @returns 默认表单数据对象
         */
        const createDefaultFormData = () => {
            return {
                name: '',
                description: '',
                status: CommonStatusEnum.ENABLE, // 默认启用状态
                triggers: [
                    {
                        type: IotRuleSceneTriggerTypeEnum.DEVICE_PROPERTY_POST,
                        productId: undefined,
                        deviceId: undefined,
                        identifier: undefined,
                        operator: undefined,
                        value: undefined,
                        cronExpression: undefined,
                        conditionGroups: [] // 空的条件组数组
                    }
                ],
                actions: []
            };
        };
        const formRef = ref(); // 表单引用
        const triggerSectionRef = ref();
        const actionSectionRef = ref();
        const formData = ref(createDefaultFormData()); // 表单数据
        /**
         * 触发器校验器（兜底，与主条件 UI 规则一致）
         * @param _rule 校验规则（未使用）
         * @param value 校验值
         */
        const validateTriggers = (_rule, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return Promise.reject(new Error('至少需要一个触发器'));
            }
            for (let i = 0; i < value.length; i++) {
                const error = validateTriggerItem(value[i], i);
                if (error) {
                    return Promise.reject(new Error(error));
                }
            }
            return Promise.resolve();
        };
        /**
         * 执行器校验器
         * @param _rule 校验规则（未使用）
         * @param value 校验值
         */
        const validateActions = (_rule, value) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return Promise.reject(new Error('至少需要一个执行器'));
            }
            for (let i = 0; i < value.length; i++) {
                const error = validateActionItem(value[i], i);
                if (error) {
                    return Promise.reject(new Error(error));
                }
            }
            return Promise.resolve();
        };
        const formRules = reactive({
            name: [
                { required: true, message: '场景名称不能为空', trigger: 'blur' },
                { type: 'string', min: 1, max: 50, message: '场景名称长度应在1-50个字符之间', trigger: 'blur' }
            ],
            status: [
                { required: true, message: '场景状态不能为空', trigger: 'change' },
                {
                    type: 'enum',
                    enum: [CommonStatusEnum.ENABLE, CommonStatusEnum.DISABLE],
                    message: '状态值必须为启用或禁用',
                    trigger: 'change'
                }
            ],
            description: [
                { type: 'string', max: 200, message: '场景描述不能超过200个字符', trigger: 'blur' }
            ],
            triggers: [{ required: true, validator: validateTriggers, trigger: 'change' }],
            actions: [{ required: true, validator: validateActions, trigger: 'change' }]
        }); // 表单校验规则
        const submitLoading = ref(false); // 提交加载状态
        const isEdit = ref(false); // 是否为编辑模式
        const drawerTitle = computed(() => (isEdit.value ? '编辑场景联动规则' : '新增场景联动规则')); // 抽屉标题
        /** 提交表单 */
        const handleSubmit = async () => {
            if (!formRef.value)
                return;
            try {
                await formRef.value.validate();
            }
            catch {
                return;
            }
            const mainConditionValid = await triggerSectionRef.value?.validateAllTriggers?.();
            if (mainConditionValid === false) {
                return;
            }
            const actionValid = await actionSectionRef.value?.validateAllActions?.();
            if (actionValid === false) {
                return;
            }
            // 提交请求
            submitLoading.value = true;
            try {
                if (isEdit.value) {
                    // 更新场景联动规则
                    (await RuleSceneApi.updateRuleScene(formData.value)).data;
                    ElMessage.success('更新成功');
                }
                else {
                    // 创建场景联动规则
                    (await RuleSceneApi.createRuleScene(formData.value)).data;
                    ElMessage.success('创建成功');
                }
                // 关闭抽屉并触发成功事件
                drawerVisible.value = false;
                emit('success');
            }
            catch (error) {
                console.error('保存失败:', error);
                ElMessage.error(isEdit.value ? '更新失败' : '创建失败');
            }
            finally {
                submitLoading.value = false;
            }
        };
        /** 处理抽屉关闭事件 */
        const handleClose = () => {
            drawerVisible.value = false;
        };
        /** 初始化表单数据 */
        const initFormData = () => {
            if (props.ruleScene) {
                // 编辑模式：数据结构已对齐，直接使用后端数据
                isEdit.value = true;
                formData.value = {
                    ...props.ruleScene,
                    // 确保触发器数组不为空
                    triggers: props.ruleScene.triggers?.length
                        ? props.ruleScene.triggers
                        : [
                            {
                                type: IotRuleSceneTriggerTypeEnum.DEVICE_PROPERTY_POST,
                                productId: undefined,
                                deviceId: undefined,
                                identifier: undefined,
                                operator: undefined,
                                value: undefined,
                                cronExpression: undefined,
                                conditionGroups: []
                            }
                        ],
                    // 确保执行器数组不为空
                    actions: props.ruleScene.actions || []
                };
            }
            else {
                // 新增模式：使用默认数据
                isEdit.value = false;
                formData.value = createDefaultFormData();
            }
        };
        /** 监听抽屉显示 */
        watch(drawerVisible, async (visible) => {
            if (visible) {
                initFormData();
                // 重置表单验证状态
                await nextTick();
                formRef.value?.clearValidate();
                triggerSectionRef.value?.clearAllTriggerValidate?.();
                actionSectionRef.value?.clearAllActionValidate?.();
            }
        });
        /** 监听编辑数据变化 */
        watch(() => props.ruleScene, () => {
            if (drawerVisible.value) {
                initFormData();
            }
        }, { deep: true });
        const __returned__ = { Icon: IotIcon, props, emit, drawerVisible, createDefaultFormData, formRef, triggerSectionRef, actionSectionRef, formData, validateTriggers, validateActions, formRules, submitLoading, isEdit, drawerTitle, handleSubmit, handleClose, initFormData, BasicInfoSection, TriggerSection, ActionSection };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
<style scoped>
.drawer-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  background: #fff;
  text-align: right;
}
</style>
