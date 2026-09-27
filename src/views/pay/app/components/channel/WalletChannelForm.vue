<template><simple-channel-form ref="inner" config-name="wallet-conf" @success="$emit('success')" /></template>
<script>
import SimpleChannelForm from './SimpleChannelForm.vue'
export default {
  name: 'WalletChannelForm',
  components: { SimpleChannelForm },
  methods: { open(appId, code) { this.$refs.inner.open(appId, code) } }
}
</script>
