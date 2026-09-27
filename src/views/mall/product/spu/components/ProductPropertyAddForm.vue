<template>
  <CanonicalProductPropertyAddForm
    ref="canonicalForm"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
import CanonicalProductPropertyAddForm from '../form/ProductPropertyAddForm.vue'

export default {
  name: 'ProductPropertyForm',
  components: { CanonicalProductPropertyAddForm },
  inheritAttrs: false,
  methods: {
    open() {
      return this.$refs.canonicalForm.open()
    }
  }
}
</script>
