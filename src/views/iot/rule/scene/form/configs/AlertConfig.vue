<template>
<div class="iot-vue2-root">

  <el-form
    ref="innerFormRef"
    :model="formModel"
    :rules="formRules"
    label-width="110px"
    class="w-full"
  >
    <el-form-item label="告警配置" prop="alertConfigId" required>
      <el-select
        :value="localValue"
        placeholder="请选择告警配置"
        filterable
        clearable
        @change="handleChange"
        class="w-full"
        :loading="loading"
      >
        <el-option
          v-for="config in alertConfigs"
          :key="config.id"
          :label="config.name"
          :value="config.id"
        >
          <div class="flex items-center justify-between">
            <span>{{ config.name }}</span>
            <el-tag :type="config.enabled ? 'success' : 'danger'" size="small">
              {{ config.enabled ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref, computed, onMounted, nextTick } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { useVModel } from '@/views/iot/utils/composables';
import { AlertConfigApi } from '@/api/iot/alert/config';
import { buildAlertConfigRules } from '@/views/iot/utils/sceneRule';
/** 告警配置组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'AlertConfig' },
    __name: 'AlertConfig',
    props: {
        value: { type: Number, required: false }
    },
    emits: ["input"],
    setup(__props, { expose: __expose, emit: __emit }) {
        const props = __props;
        const emit = __emit;
        const localValue = useVModel(props, 'value', emit);
        const innerFormRef = ref();
        const formRules = buildAlertConfigRules();
        const formModel = computed(() => ({
            alertConfigId: localValue.value
        }));
        const loading = ref(false);
        const alertConfigs = ref([]);
        /**
         * 处理选择变化事件
         * @param value 选中的值
         */
        const handleChange = (value) => {
            emit('input', value === '' ? undefined : value);
            nextTick(() => {
                innerFormRef.value?.validateField('alertConfigId', () => { });
            });
        };
        /** 加载告警配置列表 */
        const loadAlertConfigs = async () => {
            loading.value = true;
            try {
                const data = (await AlertConfigApi.getAlertConfigPage({
                    pageNo: 1,
                    pageSize: 100,
                    enabled: true
                })).data;
                alertConfigs.value = data.list;
            }
            finally {
                loading.value = false;
            }
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
        onMounted(() => {
            loadAlertConfigs();
        });
        const __returned__ = { props, emit, localValue, innerFormRef, formRules, formModel, loading, alertConfigs, handleChange, loadAlertConfigs, validate, clearValidate };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
