<!--
  Canonical Vue3 route path for the form designer.

  The Vue2 designer implementation remains in formEditor.vue because older
  integrations import that file directly.  This route component forwards to
  that complete implementation, preserving both entry points without
  duplicating the form-create lifecycle.
-->
<template>
  <BpmFormEditorImpl v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import BpmFormEditorImpl from '../formEditor.vue'

export default {
  name: 'BpmFormEditor',
  components: { BpmFormEditorImpl },
  inheritAttrs: false
}
</script>
