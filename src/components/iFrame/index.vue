<template>
  <div v-loading="loading" style="height: calc(100vh - 94.5px)">
    <iframe
      ref="frameRef"
      :src="src"
      frameborder="no"
      style="width: 100%; height: 100%"
      scrolling="auto"
      allowfullscreen="true"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
    />
  </div>
</template>
<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      loading: true
    };
  },
  watch: {
    src() {
      this.init();
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    const frame = this.$refs.frameRef;
    if (!frame) return;
    frame.onload = null;
    frame.src = 'about:blank';
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.loading = true;
        const frame = this.$refs.frameRef;
        if (!frame) return;
        frame.onload = () => {
          this.loading = false;
        };
      });
    }
  }
};
</script>
