<template>
<div class="iot-vue2-root">

  <el-form-item label="主机地址" prop="config.host">
    <el-input v-model="config.host" placeholder="请输入主机地址，如：localhost" />
  </el-form-item>
  <el-form-item label="端口" prop="config.port">
    <el-input-number
      v-model="config.port"
      :max="65535"
      :min="1"
      controls-position="right"
      placeholder="请输入端口"
    />
  </el-form-item>
  <el-form-item label="密码" prop="config.password">
    <el-input v-model="config.password" placeholder="请输入密码" show-password type="password" />
  </el-form-item>
  <el-form-item label="数据库" prop="config.database">
    <el-input-number
      v-model="config.database"
      :max="15"
      :min="0"
      controls-position="right"
      placeholder="请输入数据库索引"
    />
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
    ...{ name: 'RedisStreamMQConfigForm' },
    __name: 'RedisStreamConfigForm',
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
            // EUI2 el-input-number 挂载即回写 undefined 占位键，键全为空视为未初始化（对齐 Vue3 源行为）
            if (config.value && Object.keys(config.value).some((key) => config.value[key] !== undefined)) {
                return;
            }
            config.value = {
                type: IotDataSinkTypeEnum.REDIS_STREAM + '', // 序列化成对应类型时使用
                host: '',
                port: 6379,
                password: '',
                database: 0,
                topic: ''
            };
        });
        const __returned__ = { props, emit, config };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

