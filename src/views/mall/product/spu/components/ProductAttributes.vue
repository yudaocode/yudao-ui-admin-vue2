<template>
  <CanonicalProductAttributes
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
import CanonicalProductAttributes from '../form/ProductAttributes.vue'

export default {
  name: 'ProductAttributes',
  components: { CanonicalProductAttributes },
  inheritAttrs: false
}
</script>
