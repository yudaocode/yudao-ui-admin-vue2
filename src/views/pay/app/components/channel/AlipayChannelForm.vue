<template><legacy-alipay-channel-form ref="inner" @success="$emit('success')" /></template>
<script>
import LegacyAlipayChannelForm from '../alipayChannelForm.vue'

export default {
  name: 'AlipayChannelForm',
  components: { LegacyAlipayChannelForm },
  methods: {
    open(appId, code) {
      this.$refs.inner.open(appId, code)
    }
  }
}
</script>
