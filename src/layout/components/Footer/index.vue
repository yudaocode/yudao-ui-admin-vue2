<template>
  <div class="footer">
    <span class="footer-text">Copyright ©{{ currentYear }} {{ title }}</span>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    title() {
      return process.env.VUE_APP_TITLE
    },
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  height: 40px;
  overflow: hidden;
  line-height: 40px;
  text-align: center;
  color: #a8abb2;
  background: #fff;

  .footer-text {
    font-size: 14px;
  }
}
</style>
