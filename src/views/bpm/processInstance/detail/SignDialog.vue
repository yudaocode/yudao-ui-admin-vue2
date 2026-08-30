<template>
  <el-dialog
    title="签名"
    :visible.sync="visible"
    width="935px"
    append-to-body
    @opened="handleOpened"
    @close="handleClose"
  >
    <div class="sign-dialog__canvas-wrap">
      <canvas
        ref="signatureCanvas"
        class="sign-dialog__canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        role="img"
        aria-label="签名绘制区域"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove.prevent="draw"
        @touchend.prevent="stopDrawing"
        @touchcancel.prevent="stopDrawing"
      />
      <el-button
        class="sign-dialog__clear"
        type="text"
        size="small"
        :disabled="uploading"
        @click="clearCanvas"
      >
        <i class="el-icon-delete" />
        清除
      </el-button>
    </div>
    <div
      v-if="signPicUrl"
      class="sign-dialog__current"
    >
      <span>当前签名：</span>
      <el-link
        :href="signPicUrl"
        target="_blank"
        :underline="false"
      >查看已上传签名</el-link>
    </div>
    <div class="sign-dialog__tip">请在上方区域手写签名，支持鼠标和触摸操作</div>
    <div slot="footer">
      <el-button
        :disabled="uploading"
        @click="visible = false"
      >取 消</el-button>
      <el-button
        type="primary"
        :loading="uploading"
        @click="submit"
      >提 交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { uploadFile } from '@/api/infra/file'

export default {
  name: 'SignDialog',
  data() {
    return {
      visible: false,
      signPicUrl: '',
      canvasWidth: 900,
      canvasHeight: 400,
      context: null,
      drawing: false,
      hasDrawing: false,
      uploading: false
    }
  },
  methods: {
    /**
     * Open the dialog. The optional URL is kept for callers that used the
     * old URL-only dialog; a new stroke replaces it on submit.
     */
    open(value) {
      this.signPicUrl = value || ''
      this.drawing = false
      this.hasDrawing = false
      this.uploading = false
      this.visible = true
      this.$nextTick(() => this.initCanvas())
    },
    handleOpened() {
      this.initCanvas()
    },
    handleClose() {
      this.drawing = false
      this.uploading = false
    },
    initCanvas() {
      const canvas = this.$refs.signatureCanvas
      if (!canvas || typeof canvas.getContext !== 'function') {
        return
      }

      const ratio = Math.max(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1)
      canvas.width = this.canvasWidth * ratio
      canvas.height = this.canvasHeight * ratio
      const context = canvas.getContext('2d')
      if (!context) {
        return
      }
      this.context = context
      if (typeof context.setTransform === 'function') {
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
      } else {
        context.scale(ratio, ratio)
      }
      context.lineWidth = 2.5
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = '#303133'
      context.fillStyle = '#ffffff'
      this.clearCanvas(false)
    },
    clearCanvas(resetUrl) {
      const canvas = this.$refs.signatureCanvas
      const context = this.context || (canvas && canvas.getContext && canvas.getContext('2d'))
      if (context) {
        const width = this.canvasWidth
        const height = this.canvasHeight
        context.clearRect(0, 0, width, height)
      }
      this.drawing = false
      this.hasDrawing = false
      if (resetUrl !== false) {
        this.signPicUrl = ''
      }
    },
    getCanvasPoint(event) {
      const canvas = this.$refs.signatureCanvas
      if (!canvas || !event) {
        return null
      }
      const touch = event.touches && event.touches.length
        ? event.touches[0]
        : event.changedTouches && event.changedTouches.length
          ? event.changedTouches[0]
          : null
      const source = touch || event
      if (typeof source.clientX !== 'number' || typeof source.clientY !== 'number') {
        return null
      }
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) {
        return null
      }
      return {
        x: (source.clientX - rect.left) * (this.canvasWidth / rect.width),
        y: (source.clientY - rect.top) * (this.canvasHeight / rect.height)
      }
    },
    startDrawing(event) {
      const point = this.getCanvasPoint(event)
      if (!point || !this.context) {
        return
      }
      this.drawing = true
      this.hasDrawing = true
      this.context.beginPath()
      this.context.moveTo(point.x, point.y)
    },
    draw(event) {
      if (!this.drawing || !this.context) {
        return
      }
      const point = this.getCanvasPoint(event)
      if (!point) {
        return
      }
      this.context.lineTo(point.x, point.y)
      this.context.stroke()
    },
    stopDrawing() {
      if (this.context && this.drawing) {
        this.context.closePath()
      }
      this.drawing = false
    },
    createSignFile() {
      const canvas = this.$refs.signatureCanvas
      if (!canvas || typeof canvas.toDataURL !== 'function') {
        throw new Error('签名画布不可用')
      }
      const dataUrl = canvas.toDataURL('image/png')
      const parts = dataUrl.split(',')
      if (parts.length < 2) {
        throw new Error('签名数据无效')
      }
      const mimeMatch = parts[0].match(/data:([^;]+);/)
      const mime = mimeMatch ? mimeMatch[1] : 'image/png'
      const binary = window.atob(parts[1])
      const bytes = new Uint8Array(binary.length)
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index)
      }
      const blob = new Blob([bytes], { type: mime })
      if (typeof File !== 'undefined') {
        return new File([blob], 'sign.png', { type: mime })
      }
      blob.name = 'sign.png'
      return blob
    },
    getUploadUrl(response) {
      const data = response && response.data !== undefined ? response.data : response
      if (typeof data === 'string') {
        return data
      }
      if (data && typeof data.url === 'string') {
        return data.url
      }
      if (data && typeof data.path === 'string') {
        return data.path
      }
      if (data && typeof data.data === 'string') {
        return data.data
      }
      return ''
    },
    async submit() {
      if (this.uploading) {
        return
      }
      if (!this.hasDrawing) {
        if (this.signPicUrl) {
          this.$emit('success', this.signPicUrl)
          this.visible = false
          return
        }
        this.$message.warning('请先完成签名')
        return
      }

      this.uploading = true
      this.$message.info('签名上传中请稍等。。。')
      try {
        const response = await uploadFile(this.createSignFile())
        const url = this.getUploadUrl(response)
        if (!url) {
          throw new Error('上传接口未返回文件地址')
        }
        this.signPicUrl = url
        this.$emit('success', url)
        this.visible = false
        this.$message.success('签名上传成功')
      } catch (error) {
        // Keep the dialog open so the user can retry without losing the drawing.
        console.error('签名上传失败:', error)
        this.$message.error('签名上传失败，请重试')
      } finally {
        this.uploading = false
      }
    }
  }
}
</script>

<style scoped>
.sign-dialog__canvas-wrap {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #dcdfe6;
  background: #fff;
}

.sign-dialog__canvas {
  display: block;
  width: 100%;
  height: auto;
  min-height: 260px;
  cursor: crosshair;
  touch-action: none;
}

.sign-dialog__clear {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.9);
}

.sign-dialog__current {
  margin-top: 10px;
  color: #606266;
  font-size: 12px;
}

.sign-dialog__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
