<template>
<div class="iot-vue2-root">

  <div v-for="(item, index) in items" :key="index" class="flex mb-2 w-full">
    <el-input v-model="item.key" class="mr-2" placeholder="键" />
    <el-input v-model="item.value" placeholder="值" />
    <el-button class="ml-2" type="text" @click="removeItem(index)">
      <i class="el-icon-delete"></i>
      删除
    </el-button>
  </div>
  <el-button type="text" @click="addItem">
    <i class="el-icon-plus"></i>
    {{ addButtonText }}
  </el-button>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref, watch } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { isEmpty } from '@/utils/is';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'KeyValueEditor' },
    __name: 'KeyValueEditor',
    props: {
        value: { type: Object, required: true },
        addButtonText: { type: String, required: true }
    },
    emits: ['input'],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emit = __emit;
        const items = ref([]); // 内部 key-value 项列表
        /** 添加项目 */
        const addItem = () => {
            items.value.push({ key: '', value: '' });
            updateModelValue();
        };
        /** 移除项目 */
        const removeItem = (index) => {
            items.value.splice(index, 1);
            updateModelValue();
        };
        /** 更新 value */
        const updateModelValue = () => {
            const result = {};
            items.value.forEach((item) => {
                if (item.key) {
                    result[item.key] = item.value;
                }
            });
            emit('input', result);
        };
        /** 监听项目变化 */
        watch(items, updateModelValue, { deep: true });
        watch(() => props.value, (val) => {
            // 列表有值后以列表中的值为准
            if (isEmpty(val) || !isEmpty(items.value)) {
                return;
            }
            items.value = Object.entries(props.value).map(([key, value]) => ({ key, value }));
        });
        const __returned__ = { props, emit, items, addItem, removeItem, updateModelValue };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
