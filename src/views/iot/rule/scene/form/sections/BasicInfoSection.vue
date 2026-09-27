<template>
<div class="iot-vue2-root">

  <el-card class="border border-[var(--el-border-color-light)] rounded-8px mb-10px" shadow="never">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-8px">
          <Icon icon="ep:info-filled" class="text-[var(--el-color-primary)] text-18px" />
          <span class="text-16px font-600 text-[var(--el-text-color-primary)]">基础信息</span>
        </div>
        <div class="flex items-center gap-8px">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="formData.status" />
        </div>
      </div>
    </template>

    <div class="p-0">
      <el-row :gutter="24" class="mb-24px">
        <el-col :span="12">
          <el-form-item label="场景名称" prop="name" required>
            <el-input
              v-model="formData.name"
              placeholder="请输入场景名称"
              maxlength="50"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="场景状态" prop="status" required>
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="场景描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入场景描述（可选）"
          :rows="3"
          maxlength="200"
          show-word-limit
          resize="none"
        />
      </el-form-item>
    </div>
  </el-card>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { defineComponent as _defineComponent } from 'vue';
import { useVModel } from '@/views/iot/utils/composables';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
/** 基础信息配置组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'BasicInfoSection' },
    components: {
        Icon: IotIcon,
    },
    __name: 'BasicInfoSection',
    props: {
        value: { type: null, required: true },
        rules: { type: null, required: false }
    },
    emits: ["input"],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emit = __emit;
        const formData = useVModel(props, 'value', emit); // 表单数据
        const __returned__ = { Icon: IotIcon, props, emit, formData, get DICT_TYPE() { return DICT_TYPE; }, get getIntDictOptions() { return getIntDictOptions; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
<style scoped>

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

</style>
