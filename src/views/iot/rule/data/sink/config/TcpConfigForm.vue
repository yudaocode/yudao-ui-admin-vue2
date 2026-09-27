<template>
<div class="iot-vue2-root">

  <el-form-item label="服务器地址" prop="config.host">
    <el-input v-model="config.host" placeholder="请输入 TCP 服务器地址，如：localhost" />
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
  <el-form-item label="连接超时(ms)" prop="config.connectTimeoutMs">
    <el-input-number
      v-model="config.connectTimeoutMs"
      :min="1000"
      :step="1000"
      controls-position="right"
      placeholder="请输入连接超时时间"
    />
  </el-form-item>
  <el-form-item label="读取超时(ms)" prop="config.readTimeoutMs">
    <el-input-number
      v-model="config.readTimeoutMs"
      :min="1000"
      :step="1000"
      controls-position="right"
      placeholder="请输入读取超时时间"
    />
  </el-form-item>
  <el-form-item label="启用 SSL" prop="config.ssl">
    <el-switch v-model="config.ssl" />
  </el-form-item>
  <el-form-item v-if="config.ssl" label="SSL 证书路径" prop="config.sslCertPath">
    <el-input v-model="config.sslCertPath" placeholder="请输入 SSL 证书路径" />
  </el-form-item>
  <el-form-item label="数据格式" prop="config.dataFormat">
    <el-select v-model="config.dataFormat" placeholder="请选择数据格式">
      <el-option label="JSON" value="JSON" />
      <el-option label="BINARY" value="BINARY" />
    </el-select>
  </el-form-item>
  <el-form-item label="心跳间隔(ms)" prop="config.heartbeatIntervalMs">
    <el-input-number
      v-model="config.heartbeatIntervalMs"
      :min="0"
      :step="1000"
      controls-position="right"
      placeholder="0 表示不启用心跳"
    />
  </el-form-item>
  <el-form-item label="重连间隔(ms)" prop="config.reconnectIntervalMs">
    <el-input-number
      v-model="config.reconnectIntervalMs"
      :min="1000"
      :step="1000"
      controls-position="right"
      placeholder="请输入重连间隔时间"
    />
  </el-form-item>
  <el-form-item label="最大重连次数" prop="config.maxReconnectAttempts">
    <el-input-number
      v-model="config.maxReconnectAttempts"
      :min="0"
      controls-position="right"
      placeholder="请输入最大重连次数"
    />
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
    ...{ name: 'TcpConfigForm' },
    __name: 'TcpConfigForm',
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
                type: IotDataSinkTypeEnum.TCP + '',
                host: '',
                port: 8080,
                connectTimeoutMs: 5000,
                readTimeoutMs: 10000,
                ssl: false,
                sslCertPath: '',
                dataFormat: 'JSON',
                heartbeatIntervalMs: 30000,
                reconnectIntervalMs: 5000,
                maxReconnectAttempts: 3
            };
        });
        const __returned__ = { props, emit, config };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

