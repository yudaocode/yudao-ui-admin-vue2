<template>
  <ProductSalesEntitySelect
    :value="value"
    kind="stock"
    placeholder="请选择库存记录"
    :item-id="itemId"
    :batch-id="batchId"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script>
import ProductSalesEntitySelect from './ProductSalesEntitySelect.vue'

export default {
  name: 'ProductSalesMaterialStockSelect',
  components: { ProductSalesEntitySelect },
  props: {
    value: { type: Number, default: undefined },
    itemId: { type: Number, default: undefined },
    batchId: { type: Number, default: undefined }
  }
}
</script>
