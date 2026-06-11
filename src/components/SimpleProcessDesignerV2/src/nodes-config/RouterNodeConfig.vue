<template>
  <GenericNodeConfig ref="generic" :flow-node="flowNode" />
</template>

<script>
import GenericNodeConfig from './GenericNodeConfig.vue'

export default {
  name: 'RouterNodeConfig',
  components: { GenericNodeConfig },
  props: {
    flowNode: {
      type: Object,
      required: true
    }
  },
  methods: {
    openDrawer() {
      this.$refs.generic.openDrawer()
    },
    showRouteNodeConfig() {
      this.openDrawer()
    }
  }
}
</script>
