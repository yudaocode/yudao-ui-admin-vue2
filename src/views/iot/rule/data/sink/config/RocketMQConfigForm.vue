<template>
<div class="iot-vue2-root">

  <el-form-item label="NameServer" prop="config.nameServer">
    <el-input
      v-model="config.nameServer"
      placeholder="请输入 NameServer 地址，如：127.0.0.1:9876"
    />
  </el-form-item>
  <el-form-item label="AccessKey" prop="config.accessKey">
    <el-input v-model="config.accessKey" placeholder="请输入 AccessKey" />
  </el-form-item>
  <el-form-item label="SecretKey" prop="config.secretKey">
    <el-input
      v-model="config.secretKey"
      placeholder="请输入 SecretKey"
      show-password
      type="password"
    />
  </el-form-item>
  <el-form-item label="消费组" prop="config.group">
    <el-input v-model="config.group" placeholder="请输入消费组" />
  </el-form-item>
  <el-form-item label="主题" prop="config.topic">
    <el-input v-model="config.topic" placeholder="请输入主题" />
  </el-form-item>
  <el-form-item label="标签" prop="config.tags">
    <el-input v-model="config.tags" placeholder="请输入标签" />
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
    ...{ name: 'RocketMQConfigForm' },
    __name: 'RocketMQConfigForm',
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
                type: IotDataSinkTypeEnum.ROCKETMQ + '', // 序列化成对应类型时使用
                nameServer: '',
                accessKey: '',
                secretKey: '',
                group: '',
                topic: '',
                tags: ''
            };
        });
        const __returned__ = { props, emit, config };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

