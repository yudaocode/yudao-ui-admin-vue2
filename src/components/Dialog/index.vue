<template>
  <el-dialog
    ref="dialog"
    v-bind="$attrs"
    class="com-dialog"
    :visible="value"
    :title="title"
    :width="typeof width === 'number' ? width + 'px' : width"
    :fullscreen="isFullscreen"
    :show-close="false"
    :close-on-click-modal="true"
    lock-scroll
    v-on="dialogListeners"
    @close="handleClose"
    @closed="handleClosed"
  >
    <div
      slot="title"
      class="com-dialog-header"
      @mousedown="startDrag"
    >
      <slot name="title">{{ title }}</slot>
      <div
        class="com-dialog-actions"
        @mousedown.stop
      >
        <button
          v-if="fullscreen"
          type="button"
          :aria-label="isFullscreen ? '退出全屏' : '全屏'"
          @click="toggleFull"
        >
          <i :class="isFullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'" />
        </button>
        <button
          type="button"
          aria-label="关闭"
          @click="$refs.dialog.handleClose()"
        ><i class="el-icon-close" /></button>
      </div>
    </div>
    <div
      v-if="contentMounted"
      v-loading="loading"
      :style="loading ? { minHeight: '120px' } : undefined"
    >
      <template v-if="!loading">
        <el-scrollbar
          v-if="scroll"
          :style="{ height: dialogHeight }"
        ><slot /></el-scrollbar>
        <slot v-else />
      </template>
    </div>
    <div
      v-if="$slots.footer && contentMounted"
      slot="footer"
      :style="{ pointerEvents: closing ? 'none' : 'auto' }"
    >
      <slot name="footer" />
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'Dialog',
  inheritAttrs: false,
  props: {
    value: { type: Boolean, default: false },
    title: { type: String, default: 'Dialog' },
    fullscreen: { type: Boolean, default: true },
    defaultFullscreen: { type: Boolean, default: false },
    width: { type: [String, Number], default: '40%' },
    scroll: { type: Boolean, default: false },
    maxHeight: { type: [String, Number], default: '400px' },
    loading: { type: Boolean, default: false }
  },
  data() {
    return { isFullscreen: this.defaultFullscreen, closing: false, contentMounted: this.value, viewportHeight: 0 }
  },
  computed: {
    dialogListeners() {
      const listeners = { ...this.$listeners }
      ;['input', 'close', 'closed', 'update:visible'].forEach(name => delete listeners[name])
      return listeners
    },
    dialogHeight() {
      if (this.isFullscreen) return `${this.viewportHeight - 55 - 60 - (this.$slots.footer ? 63 : 0)}px`
      return typeof this.maxHeight === 'number' ? `${this.maxHeight}px` : this.maxHeight
    }
  },
  watch: {
    value(visible) {
      if (visible) {
        this.contentMounted = true
        this.closing = false
        this.isFullscreen = this.defaultFullscreen
        this.resetPosition()
      }
    }
  },
  mounted() {
    this.viewportHeight = document.documentElement.clientHeight
  },
  beforeDestroy() {
    this.stopDrag()
  },
  methods: {
    handleClose() {
      this.closing = true
      this.stopDrag()
      this.$emit('input', false)
      this.$emit('close')
    },
    handleClosed() {
      this.closing = false
      if (!this.value) this.contentMounted = false
      this.$emit('closed')
    },
    toggleFull() {
      this.isFullscreen = !this.isFullscreen
      this.viewportHeight = document.documentElement.clientHeight
      this.resetPosition()
    },
    resetPosition() {
      this.stopDrag()
      const dialog = this.$refs.dialog && this.$refs.dialog.$refs.dialog
      if (dialog) dialog.style.transform = ''
    },
    startDrag(event) {
      if (event.button !== 0 || this.isFullscreen || event.target.closest('button, input, a')) return
      this.stopDrag()
      const dialog = this.$refs.dialog.$refs.dialog
      const bounds = dialog.getBoundingClientRect()
      const transform = new DOMMatrix(window.getComputedStyle(dialog).transform)
      const startX = event.clientX
      const startY = event.clientY
      this.dragMove = move => {
        const x = Math.max(-bounds.left, Math.min(move.clientX - startX, window.innerWidth - bounds.right))
        const y = Math.max(-bounds.top, Math.min(move.clientY - startY, window.innerHeight - bounds.bottom))
        dialog.style.transform = `translate(${transform.m41 + x}px, ${transform.m42 + y}px)`
      }
      document.addEventListener('mousemove', this.dragMove)
      document.addEventListener('mouseup', this.stopDrag)
      event.preventDefault()
    },
    stopDrag() {
      if (this.dragMove) document.removeEventListener('mousemove', this.dragMove)
      document.removeEventListener('mouseup', this.stopDrag)
      this.dragMove = null
    }
  }
}
</script>

<style>
.com-dialog.el-dialog__wrapper { display: flex; align-items: center; justify-content: center; }
.com-dialog > .el-dialog { margin: 0 !important; }
.com-dialog .el-dialog__header { height: 54px; padding: 0; border-bottom: 1px solid #dcdfe6; }
.com-dialog .el-dialog__body { padding: 15px; }
.com-dialog .el-dialog__footer { border-top: 1px solid #dcdfe6; }
.com-dialog .com-dialog-header { display: flex; align-items: center; height: 54px; padding: 0 15px; cursor: move; }
.com-dialog .com-dialog-actions { display: flex; margin-left: auto; gap: 10px; }
.com-dialog .com-dialog-actions button { border: 0; background: transparent; color: #909399; cursor: pointer; font-size: 16px; }
.com-dialog .com-dialog-actions button:hover { color: #409eff; }
.com-dialog .el-scrollbar__wrap { overflow-x: hidden; }
</style>
