<!-- WMS 库存选择器共享入口 -->
<template>
  <inventory-selector-base
    ref="selector"
    :warehouse-id="warehouseId"
    @change="$emit('change', $event)"
  />
</template>

<script>
// The order screens and the standalone inventory pages use the same Vue2
// table/selection behavior. Keep one implementation and expose the canonical
// Vue3 path so callers do not need to know which order first consumed it.
import InventorySelectorBase from '@/views/wms/order/movement/components/InventorySelect.vue'

export default {
  name: 'WmsInventorySelect',
  components: { InventorySelectorBase },
  props: {
    warehouseId: {
      type: [Number, String],
      default: undefined
    }
  },
  methods: {
    open(selectedInventoryKeys) {
      if (!this.$refs.selector) return Promise.resolve()
      return this.$refs.selector.open(selectedInventoryKeys)
    }
  }
}
</script>
