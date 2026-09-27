<template>
<div class="iot-vue2-root">

  <div class="iot-content-wrap">
    <el-descriptions :column="3" title="产品信息" border>
      <el-descriptions-item label="产品名称">{{ product.name }}</el-descriptions-item>
      <el-descriptions-item label="所属分类">{{ product.categoryName }}</el-descriptions-item>
      <el-descriptions-item label="设备类型">
        <dict-tag :type="DICT_TYPE.IOT_PRODUCT_DEVICE_TYPE" :value="product.deviceType" />
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(product.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="协议类型">
        <dict-tag :type="DICT_TYPE.IOT_PROTOCOL_TYPE" :value="product.protocolType" />
      </el-descriptions-item>
      <el-descriptions-item label="序列化类型">
        <dict-tag :type="DICT_TYPE.IOT_SERIALIZE_TYPE" :value="product.serializeType" />
      </el-descriptions-item>
      <el-descriptions-item label="产品状态">
        <dict-tag :type="DICT_TYPE.IOT_PRODUCT_STATUS" :value="product.status" />
      </el-descriptions-item>
      <el-descriptions-item
        label="联网方式"
        v-if="[DeviceTypeEnum.DEVICE, DeviceTypeEnum.GATEWAY].includes(product.deviceType)"
      >
        <dict-tag :type="DICT_TYPE.IOT_NET_TYPE" :value="product.netType" />
      </el-descriptions-item>
      <el-descriptions-item label="动态注册">
        <el-tag :type="product.registerEnabled ? 'success' : 'info'">
          {{ product.registerEnabled ? '已开启' : '已关闭' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="产品密钥">
        <div class="flex items-center">
          <span>{{ secretVisible ? product.productSecret : '******' }}</span>
          <el-button type="text" class="ml-2" @click="secretVisible = !secretVisible">
            <Icon :icon="secretVisible ? 'ep:hide' : 'ep:view'" />
          </el-button>
          <el-button
            v-if="secretVisible && product.productSecret"
           
            type="text"
            class="ml-1"
            @click="copySecret"
          >
            <Icon icon="ep:document-copy" />
          </el-button>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="产品描述">{{ product.description }}</el-descriptions-item>
    </el-descriptions>
  </div>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { ref } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { DICT_TYPE } from '@/utils/dict';
import { DeviceTypeEnum } from '@/api/iot/product/product';
import { formatDate } from '@/utils/formatTime';
import { useClipboard } from '@/views/iot/utils/composables';
export default /*@__PURE__*/ _defineComponent({
    __name: 'ProductDetailsInfo',
    components: {
        Icon: IotIcon,
    },
    props: {
        product: { type: null, required: true }
    },
    setup(__props, { expose: __expose }) {
        __expose();
        const message = createIotMessage();
        const secretVisible = ref(false);
        const { copy } = useClipboard();
        /** 复制产品密钥 */
        const copySecret = async () => {
            if (__props.product.productSecret) {
                await copy(__props.product.productSecret);
                message.success('复制成功');
            }
        };
        const __returned__ = { Icon: IotIcon, message, secretVisible, copy, copySecret, get DICT_TYPE() { return DICT_TYPE; }, get DeviceTypeEnum() { return DeviceTypeEnum; }, get formatDate() { return formatDate; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
