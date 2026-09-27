<template>
<div class="iot-vue2-root">

  <div>
    <div class="flex items-start justify-between">
      <div>
        <el-col>
          <el-row>
            <span class="text-xl font-bold">{{ device.deviceName }}</span>
          </el-row>
        </el-col>
      </div>
      <div>
        <!-- 右上：按钮 -->
        <el-button
          @click="openForm('update', device.id)"
          v-hasPermi="['iot:device:update']"
          v-if="product.status === 0"
        >
          编辑
        </el-button>
      </div>
    </div>
  </div>
  <div class="iot-content-wrap">
    <el-descriptions :column="5" direction="horizontal">
      <el-descriptions-item label="产品">
        <el-link @click="goToProductDetail(product.id)">{{ product.name }}</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="ProductKey">
        {{ product.productKey }}
        <el-button @click="copyToClipboard(product.productKey)">复制</el-button>
      </el-descriptions-item>
    </el-descriptions>
  </div>
  <!-- 表单弹窗：添加/修改 -->
  <DeviceForm ref="formRef" @success="$emit('refresh')" />

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { useIotI18n } from '@/views/iot/utils/ui';
import { useRouter } from '@/views/iot/utils/composables';
import { ref, unref } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import DeviceForm from '@/views/iot/device/device/DeviceForm.vue';
import { useClipboard } from '@/views/iot/utils/composables';
export default /*@__PURE__*/ _defineComponent({
    __name: 'DeviceDetailsHeader',
    components: {
        DeviceForm,
    },
    props: {
        product: { type: null, required: true },
        device: { type: null, required: true }
    },
    emits: ['refresh'],
    setup(__props, { expose: __expose, emit: __emit }) {
        __expose();
        const message = createIotMessage();
        const { t } = useIotI18n(); // 国际化
        const router = useRouter();
        const emit = __emit;
        /** 操作修改 */
        const formRef = ref();
        const openForm = (type, id) => {
            formRef.value.open(type, id);
        };
        /** 复制到剪贴板方法 */
        const copyToClipboard = async (text) => {
            const { copy, copied, isSupported } = useClipboard({ legacy: true, source: text });
            if (!isSupported) {
                message.error(t('common.copyError'));
                return;
            }
            await copy();
            if (unref(copied)) {
                message.success(t('common.copySuccess'));
            }
        };
        /** 跳转到产品详情页面 */
        const goToProductDetail = (productId) => {
            router.push({ name: 'IoTProductDetail', params: { id: productId } });
        };
        const __returned__ = { message, t, router, emit, formRef, openForm, copyToClipboard, goToProductDetail, DeviceForm };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
