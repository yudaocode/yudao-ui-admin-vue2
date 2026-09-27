<template><legacy-user-avatar v-bind="$attrs" v-on="$listeners" /></template>
<script>
import LegacyUserAvatar from '@/views/system/user/profile/userAvatar.vue'
export default { name: 'UserAvatar', components: { LegacyUserAvatar } }
</script>
