<!-- FMS 通用打印预览：在全屏弹窗中预览 HTML，并调用浏览器打印能力 -->
<template>
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    append-to-body
    class="fms-print-preview-dialog"
    fullscreen
    width="96%"
  >
    <div class="preview-toolbar">
      <el-button type="primary" @click="print">打印</el-button>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </div>
    <iframe ref="previewIframe" :srcdoc="html" class="preview-iframe" title="打印预览"></iframe>
  </el-dialog>
</template>

<script>
export default {
  name: 'FmsPrintPreview',
  data() {
    return {
      dialogVisible: false,
      title: '',
      html: ''
    }
  },
  methods: {
    open(title, html) {
      this.title = title
      this.html = html
      this.dialogVisible = true
    },
    printHtml(html) {
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.srcdoc = html
      iframe.onload = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
        }
        window.setTimeout(() => iframe.remove(), 1000)
      }
      document.body.appendChild(iframe)
    },
    print() {
      const iframe = this.$refs.previewIframe
      if (iframe && iframe.contentWindow) iframe.contentWindow.print()
    }
  }
}
</script>

<style scoped>
.preview-toolbar { display: flex; justify-content: flex-end; gap: 8px; padding-bottom: 12px; }
.preview-iframe { width: 100%; height: calc(100vh - 118px); border: 1px solid #dcdfe6; background: #eef0f3; }
</style>
