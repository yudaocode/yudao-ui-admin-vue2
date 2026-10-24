<!-- 百度地图 BD09 单点预览，进入视口时加载，离开时移除独立 iframe -->
<template>
  <div
    ref="container"
    class="map-preview"
  >
    <iframe
      v-if="visible && previewHtml"
      :key="previewHtml"
      ref="frame"
      :srcdoc="previewHtml"
      class="map-preview-frame"
      tabindex="-1"
      title="地图预览"
    />
    <div
      v-if="!previewHtml || frameFailed"
      class="map-preview-error"
    >地图加载失败</div>
  </div>
</template>

<script>
import { BAIDU_MAP_PREVIEW_ERROR, buildBaiduMapPreviewHtml } from './utils'

export default {
  name: 'MapView',
  props: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    zoom: { type: Number, default: 15 }
  },
  data() {
    return { visible: false, frameFailed: false }
  },
  computed: {
    previewHtml() {
      return buildBaiduMapPreviewHtml(this.longitude, this.latitude, this.zoom)
    }
  },
  watch: {
    visible() { this.frameFailed = false },
    previewHtml() { this.frameFailed = false }
  },
  mounted() {
    window.addEventListener('message', this.handleMessage)
    if (typeof IntersectionObserver === 'undefined') {
      this.visible = true
      return
    }
    this._observer = new IntersectionObserver(entries => {
      for (const entry of entries) this.visible = entry.isIntersecting
    }, { rootMargin: '100px' })
    this._observer.observe(this.$refs.container)
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleMessage)
    this._observer?.disconnect()
  },
  methods: {
    handleMessage(event) {
      const frameWindow = this.$refs.frame && this.$refs.frame.contentWindow
      if (frameWindow && event.source === frameWindow && event.data?.type === BAIDU_MAP_PREVIEW_ERROR) {
        this.frameFailed = true
      }
    }
  }
}
</script>

<style scoped>
.map-preview { position: relative; overflow: hidden; }
.map-preview-frame { display: block; width: 100%; height: 100%; border: 0; pointer-events: none; }
.map-preview-error { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: #909399; font-size: 12px; }
</style>
