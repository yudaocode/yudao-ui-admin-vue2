<template>
  <GenericNodeConfig ref="generic" :flow-node="conditionNode" />
</template>

<script>
import GenericNodeConfig from './GenericNodeConfig.vue'

export default {
  name: 'ConditionNodeConfig',
  components: { GenericNodeConfig },
  props: {
    conditionNode: {
      type: Object,
      required: true
    },
    nodeIndex: {
      type: Number,
      default: 0
    }
  },
  methods: {
    open() {
      this.openDrawer()
    },
    openDrawer() {
      this.$refs.generic.openDrawer()
    },
    showConditionNodeConfig() {
      this.openDrawer()
    }
  }
}
</script>
