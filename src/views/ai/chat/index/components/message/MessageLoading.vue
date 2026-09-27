<template>
  <div class="message-loading">
    <el-skeleton :rows="6" animated />
  </div>
</template>

<script>
export default { name: 'MessageLoading' }
</script>

<style scoped>
.message-loading { padding: 30px; }
</style>
