<template>
<div class="iot-vue2-root">

  <el-form-item label="请求地址" prop="config.url">
    <el-input v-model="urlPath" placeholder="请输入请求地址">
      <template #prepend>
        <el-select v-model="urlPrefix" placeholder="Select" style="width: 115px">
          <!--suppress HttpUrlsUsage -->
          <el-option label="http://" value="http://" />
          <el-option label="https://" value="https://" />
        </el-select>
      </template>
    </el-input>
  </el-form-item>
  <el-form-item label="请求方法" prop="config.method">
    <el-select v-model="config.method" placeholder="请选择请求方法">
      <el-option label="GET" value="GET" />
      <el-option label="POST" value="POST" />
      <el-option label="PUT" value="PUT" />
      <el-option label="DELETE" value="DELETE" />
    </el-select>
  </el-form-item>
  <el-form-item label="请求头" prop="config.headers">
    <key-value-editor v-model="config.headers" add-button-text="添加请求头" />
  </el-form-item>
  <el-form-item label="请求参数" prop="config.query">
    <key-value-editor v-model="config.query" add-button-text="添加参数" />
  </el-form-item>
  <el-form-item label="请求体" prop="config.body">
    <el-input v-model="config.body" placeholder="请输入内容" type="textarea" />
  </el-form-item>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref, computed, watch, onMounted } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { IotDataSinkTypeEnum } from '@/api/iot/rule/data/sink';
import { useVModel } from '@/views/iot/utils/composables';
import { isEmpty } from '@/utils/is';
import KeyValueEditor from './components/KeyValueEditor.vue';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'HttpConfigForm' },
    __name: 'HttpConfigForm',
    props: {
        value: { type: null, required: true }
    },
    emits: ['input'],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const props = __props;
        const emit = __emit;
        const config = useVModel(props, 'value', emit);
        // noinspection HttpUrlsUsage
        /** URL处理 */
        const urlPrefix = ref('http://');
        const urlPath = ref('');
        const fullUrl = computed(() => {
            return urlPath.value ? urlPrefix.value + urlPath.value : '';
        });
        /** 监听 URL 变化 */
        watch([urlPrefix, urlPath], () => {
            config.value.url = fullUrl.value;
        });
        const syncUrlFields = (url) => {
            if (url?.startsWith('https://')) {
                urlPrefix.value = 'https://';
                urlPath.value = url.substring(8);
            }
            else if (url?.startsWith('http://')) {
                urlPrefix.value = 'http://';
                urlPath.value = url.substring(7);
            }
            else {
                urlPath.value = url ?? '';
            }
        };
        watch(() => config.value?.url, (url) => syncUrlFields(url), { immediate: true });
        /** 组件初始化 */
        onMounted(() => {
            if (!isEmpty(config.value)) {
                syncUrlFields(config.value.url);
                return;
            }
            config.value = {
                type: IotDataSinkTypeEnum.HTTP + '', // 序列化成对应类型时使用
                url: '',
                method: 'POST',
                headers: {},
                query: {},
                body: ''
            };
        });
        const __returned__ = { props, emit, config, urlPrefix, urlPath, fullUrl, syncUrlFields, KeyValueEditor };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

