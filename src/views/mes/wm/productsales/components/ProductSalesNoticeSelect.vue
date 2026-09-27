<template>
  <ProductSalesEntitySelect
    v-bind="$attrs"
    :value="value"
    kind="notice"
    placeholder="请选择发货通知单"
    :disabled="disabled"
    :status="status"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script>
import ProductSalesEntitySelect from './ProductSalesEntitySelect.vue'

export default {
  name: 'ProductSalesNoticeSelect',
  components: { ProductSalesEntitySelect },
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined },
    status: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false }
  }
}
</script>
