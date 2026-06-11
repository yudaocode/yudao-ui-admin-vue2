<template>
  <div class="app-container" v-loading="true" />
</template>

<script>
export default {
  name: 'BpmModelEditor',
  created() {
    const id = this.$route.query && (this.$route.query.modelId || this.$route.query.id)
    if (id) {
      this.$router.replace({
        name: 'BpmModelUpdate',
        params: { id }
      })
      return
    }
    this.$router.replace({ name: 'BpmModel' })
  }
}
</script>
