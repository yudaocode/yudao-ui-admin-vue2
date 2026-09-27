<template>
<div class="iot-vue2-root">

  <el-dialog :visible.sync="dialogVisible" :title="dialogTitle">
    <JsonEditor
      v-model="thingModelTSL"
      :mode="viewMode === 'editor' ? 'code' : 'view'"
      height="600px"
    />
    <template #footer>
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button label="code">代码视图</el-radio-button>
        <el-radio-button label="editor">编辑器视图</el-radio-button>
      </el-radio-group>
    </template>
  </el-dialog>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { ref, onMounted, inject } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import hljs from 'highlight.js'; // 导入代码高亮文件
import 'highlight.js/styles/github.css'; // 导入代码高亮样式
import json from 'highlight.js/lib/languages/json';
import { ThingModelApi } from '@/api/iot/thingmodel';
import { IOT_PROVIDE_KEY } from '@/views/iot/utils/constants';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ThingModelTSL' },
    __name: 'ThingModelTSL',
    setup(__props, { expose: __expose }) {
        const dialogVisible = ref(false); // 弹窗的是否展示
        const dialogTitle = ref('物模型 TSL'); // 弹窗的标题
        const product = inject(IOT_PROVIDE_KEY.PRODUCT); // 注入产品信息
        const viewMode = ref('code'); // 查看模式：code-代码视图，editor-编辑器视图
        /** 打开弹窗 */
        const open = () => {
            dialogVisible.value = true;
        };
        __expose({ open });
        /** 获取 TSL */
        const thingModelTSL = ref({});
        const getTsl = async () => {
            thingModelTSL.value = (await ThingModelApi.getThingModelTSLByProductId(product?.value?.id || 0)).data;
        };
        /** 初始化 **/
        onMounted(async () => {
            // 注册代码高亮的各种语言
            hljs.registerLanguage('json', json);
            await getTsl();
        });
        const __returned__ = { dialogVisible, dialogTitle, product, viewMode, open, thingModelTSL, getTsl };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

