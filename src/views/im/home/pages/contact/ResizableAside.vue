<template>
  <aside
    class="im-resizable-aside"
    :style="{ width: `${width}px` }"
  >
    <slot />
    <div
      class="im-resizable-aside__handle"
      @mousedown="startResize"
    />
  </aside>
</template>

<script>
export default {
  name: 'ImResizableAside',
  props: {
    defaultWidth: { type: Number, default: 260 },
    storageKey: { type: String, required: true }
  },
  data() {
    const stored = Number(localStorage.getItem(this.storageKey))
    return { width: stored >= 220 && stored <= 420 ? stored : this.defaultWidth }
  },
  beforeDestroy() {
    this.stopResize()
  },
  methods: {
    startResize(event) {
      this.startX = event.clientX
      this.startWidth = this.width
      window.addEventListener('mousemove', this.resize)
      window.addEventListener('mouseup', this.stopResize)
    },
    resize(event) {
      this.width = Math.min(420, Math.max(220, this.startWidth + event.clientX - this.startX))
    },
    stopResize() {
      window.removeEventListener('mousemove', this.resize)
      window.removeEventListener('mouseup', this.stopResize)
      localStorage.setItem(this.storageKey, String(this.width))
    }
  }
}
</script>

<style scoped>
.im-resizable-aside { position: relative; flex: none; display: flex; flex-direction: column; height: 100%; border-right: 1px solid #ebeef5; }
.im-resizable-aside__handle { position: absolute; top: 0; right: -2px; z-index: 2; width: 4px; height: 100%; cursor: col-resize; }
</style>
