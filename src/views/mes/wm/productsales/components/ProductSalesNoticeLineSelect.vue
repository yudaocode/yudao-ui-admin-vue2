<template>
  <ProductSalesEntitySelect
    v-bind="$attrs"
    :value="value"
    kind="notice-line"
    placeholder="请选择发货通知单行"
    :notice-id="noticeId"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script>
import ProductSalesEntitySelect from './ProductSalesEntitySelect.vue'

export default {
  name: 'ProductSalesNoticeLineSelect',
  components: { ProductSalesEntitySelect },
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined },
    noticeId: { type: Number, default: undefined }
  }
}
</script>
