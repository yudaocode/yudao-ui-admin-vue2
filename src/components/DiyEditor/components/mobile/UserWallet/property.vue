<template>
  <ComponentContainerProperty v-model="formData.style" />
</template>

<script>
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'

export default {
  name: 'UserWalletProperty',
  components: { ComponentContainerProperty },
  props: {
    value: { type: Object, required: true }
  },
  computed: {
    formData() {
      return this.value
    }
  }
}
</script>

