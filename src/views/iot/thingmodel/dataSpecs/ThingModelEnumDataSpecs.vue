<template>
<div class="iot-vue2-root">

  <el-form-item
    :rules="[{ required: true, validator: validateEnumList, trigger: 'change' }]"
    label="枚举项"
  >
    <div class="flex flex-col">
      <div class="flex items-center">
        <span class="flex-1"> 参数值 </span>
        <span class="flex-1"> 参数描述 </span>
      </div>
      <div
        v-for="(item, index) in dataSpecsList"
        :key="index"
        class="flex items-center justify-between mb-5px"
      >
        <el-form-item
          :prop="`property.dataSpecsList[${index}].value`"
          :rules="[
            { required: true, message: '枚举值不能为空' },
            { validator: validateEnumValue, trigger: 'blur' }
          ]"
          class="flex-1 mb-0"
        >
          <el-input v-model="item.value" placeholder="请输入枚举值,如'0'" />
        </el-form-item>
        <span class="mx-2">~</span>
        <el-form-item
          :prop="`property.dataSpecsList[${index}].name`"
          :rules="[
            { required: true, message: '枚举描述不能为空' },
            { validator: validateEnumName, trigger: 'blur' }
          ]"
          class="flex-1 mb-0"
        >
          <el-input v-model="item.name" placeholder="对该枚举项的描述" />
        </el-form-item>
        <el-button class="ml-10px" type="text" @click="deleteEnum(index)">删除</el-button>
      </div>
      <el-button type="text" @click="addEnum">+添加枚举项</el-button>
    </div>
  </el-form-item>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { defineComponent as _defineComponent } from 'vue';
import { useVModel } from '@/views/iot/utils/composables';
import { isEmpty } from '@/utils/is';
import { IoTDataSpecsDataTypeEnum } from '@/views/iot/utils/constants';
/** 枚举型的 dataSpecs 配置组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ThingModelEnumDataSpecs' },
    __name: 'ThingModelEnumDataSpecs',
    props: {
        value: { type: null, required: true }
    },
    emits: ['input'],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emits = __emit;
        const dataSpecsList = useVModel(props, 'value', emits);
        const message = createIotMessage();
        /** 添加枚举项 */
        const addEnum = () => {
            dataSpecsList.value.push({
                dataType: IoTDataSpecsDataTypeEnum.ENUM,
                name: '', // 枚举项的名称
                value: undefined // 枚举值
            });
        };
        /** 删除枚举项 */
        const deleteEnum = (index) => {
            if (dataSpecsList.value.length === 1) {
                message.warning('至少需要一个枚举项');
                return;
            }
            dataSpecsList.value.splice(index, 1);
        };
        /** 校验枚举值 */
        const validateEnumValue = (_, value) => {
            if (isEmpty(value)) {
                return Promise.reject(new Error('枚举值不能为空'));
            }
            if (isNaN(Number(value))) {
                return Promise.reject(new Error('枚举值必须是数字'));
            }
            // 检查枚举值是否重复
            const values = dataSpecsList.value.map((item) => item.value);
            if (values.filter((v) => v === value).length > 1) {
                return Promise.reject(new Error('枚举值不能重复'));
            }
            return Promise.resolve();
        };
        /** 校验枚举描述 */
        const validateEnumName = (_, value) => {
            if (isEmpty(value)) {
                return Promise.reject(new Error('枚举描述不能为空'));
            }
            // 检查开头字符
            if (!/^[\u4e00-\u9fa5a-zA-Z0-9]/.test(value)) {
                return Promise.reject(new Error('枚举描述必须以中文、英文字母或数字开头'));
            }
            // 检查整体格式
            if (!/^[\u4e00-\u9fa5a-zA-Z0-9][a-zA-Z0-9\u4e00-\u9fa5_-]*$/.test(value)) {
                return Promise.reject(new Error('枚举描述只能包含中文、英文字母、数字、下划线和短划线'));
            }
            // 检查长度（一个中文算一个字符）
            if (value.length > 20) {
                return Promise.reject(new Error('枚举描述长度不能超过20个字符'));
            }
            return Promise.resolve();
        };
        /** 校验整个枚举列表 */
        const validateEnumList = (_, __) => {
            if (isEmpty(dataSpecsList.value)) {
                return Promise.reject(new Error('请至少添加一个枚举项'));
            }
            // 检查是否存在空值
            const hasEmptyValue = dataSpecsList.value.some((item) => isEmpty(item.value) || isEmpty(item.name));
            if (hasEmptyValue) {
                return Promise.reject(new Error('存在未填写的枚举值或描述'));
            }
            // 检查枚举值是否都是数字
            const hasInvalidNumber = dataSpecsList.value.some((item) => isNaN(Number(item.value)));
            if (hasInvalidNumber) {
                return Promise.reject(new Error('存在非数字的枚举值'));
            }
            // 检查是否有重复的枚举值
            const values = dataSpecsList.value.map((item) => item.value);
            const uniqueValues = new Set(values);
            if (values.length !== uniqueValues.size) {
                return Promise.reject(new Error('存在重复的枚举值'));
            }
            return Promise.resolve();
        };
        const __returned__ = { props, emits, dataSpecsList, message, addEnum, deleteEnum, validateEnumValue, validateEnumName, validateEnumList };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
<style scoped lang="scss">

:deep(.el-form-item) {
  .el-form-item {
    margin-bottom: 0;
  }
}

</style>
