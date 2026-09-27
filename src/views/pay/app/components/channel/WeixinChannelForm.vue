<template><legacy-weixin-channel-form ref="inner" @success="$emit('success')" /></template>
<script>
import LegacyWeixinChannelForm from '../weixinChannelForm.vue'

export default {
  name: 'WeixinChannelForm',
  components: { LegacyWeixinChannelForm },
  methods: {
    open(appId, code) {
      this.$refs.inner.open(appId, code)
    }
  }
}
</script>
