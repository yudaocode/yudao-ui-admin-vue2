<template><legacy-basic-info v-bind="$attrs" v-on="$listeners" /></template>
<script>
import LegacyBasicInfo from '@/views/system/user/profile/userInfo.vue'
export default { name: 'BasicInfo', components: { LegacyBasicInfo } }
</script>
