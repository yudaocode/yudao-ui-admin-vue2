<template>
  <div
    v-loading="loading"
    :style="'height:' + height"
    element-loading-text="正在加载页面，请稍候！"
  >
    <iframe
      :id="iframeId"
      style="width: 100%; height: 100%"
      :src="src"
      frameborder="no"
    />
  </div>
</template>

<script>
export default {
  name: 'InnerLink',
  props: {
    src: {
      type: String,
      default: '/'
    },
    iframeId: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      loading: false,
      height: document.documentElement.clientHeight - 94.5 + 'px;'
    }
  },
  mounted() {
    var _this = this
    const iframeId = ('#' + this.iframeId).replace(/\//g, '\\/')
    const iframe = document.querySelector(iframeId)
    // iframe页面loading控制
    if (iframe.attachEvent) {
      this.loading = true
      iframe.attachEvent('onload', function() {
        _this.loading = false
      })
    } else {
      this.loading = true
      iframe.onload = function() {
        _this.loading = false
      }
    }
  }
}
</script>
