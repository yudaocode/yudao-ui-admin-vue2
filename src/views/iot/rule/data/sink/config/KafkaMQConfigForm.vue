<template>
<div class="iot-vue2-root">

  <el-form-item label="服务地址" prop="config.bootstrapServers">
    <el-input v-model="config.bootstrapServers" placeholder="请输入服务地址，如：localhost:9092" />
  </el-form-item>
  <el-form-item label="用户名" prop="config.username">
    <el-input v-model="config.username" placeholder="请输入用户名" />
  </el-form-item>
  <el-form-item label="密码" prop="config.password">
    <el-input v-model="config.password" placeholder="请输入密码" show-password type="password" />
  </el-form-item>
  <el-form-item label="启用 SSL" prop="config.ssl">
    <el-switch v-model="config.ssl" />
  </el-form-item>
  <el-form-item label="主题" prop="config.topic">
    <el-input v-model="config.topic" placeholder="请输入主题" />
  </el-form-item>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { onMounted } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { IotDataSinkTypeEnum } from '@/api/iot/rule/data/sink';
import { useVModel } from '@/views/iot/utils/composables';
import { isEmpty } from '@/utils/is';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'KafkaMQConfigForm' },
    __name: 'KafkaMQConfigForm',
    props: {
        value: { type: null, required: true }
    },
    emits: ['input'],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emit = __emit;
        const config = useVModel(props, 'value', emit);
        /** 组件初始化 */
        onMounted(() => {
            if (!isEmpty(config.value)) {
                return;
            }
            config.value = {
                type: IotDataSinkTypeEnum.KAFKA + '', // 序列化成对应类型时使用
                bootstrapServers: '',
                username: '',
                password: '',
                ssl: false,
                topic: ''
            };
        });
        const __returned__ = { props, emit, config };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

