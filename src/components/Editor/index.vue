<template>
  <div class="shared-editor">
    <div
      ref="toolbar"
      class="shared-editor__toolbar"
    />
    <div
      ref="editor"
      class="editor"
      :style="editorStyle"
    />
  </div>
</template>

<script>
import { createEditor, createToolbar } from '@wangeditor-next/editor'
import { markRaw } from 'vue'
import '@wangeditor-next/editor/dist/css/style.css'
import merge from 'lodash/merge'
import { useUpload } from '@/components/UploadFile/src/useUpload'

export default {
  name: 'Editor',
  props: {
    value: { type: String, default: '' },
    editorId: { type: String, default: 'wangEditor-1' },
    height: { type: [Number, String], default: '500px' },
    minHeight: { type: Number, default: null },
    readonly: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    editorConfig: { type: Object, default: undefined },
    directory: { type: String, default: 'editor-default' }
  },
  computed: {
    editorStyle() {
      return {
        height: typeof this.height === 'number' ? this.height + 'px' : this.height,
        minHeight: this.minHeight ? this.minHeight + 'px' : undefined,
        width: '100%'
      }
    },
    effectiveReadOnly() {
      return Object.prototype.hasOwnProperty.call(this.$options.propsData || {}, 'readonly')
        ? this.readonly : this.readOnly
    }
  },
  watch: {
    value(value) {
      const editor = this.editorInstance
      if (editor && value !== this.currentValue) {
        this.currentValue = value || ''
        // External replacements can invalidate the current Slate selection.
        // Clear it before setHtml tries to restore offsets from the old text.
        editor.deselect()
        editor.blur()
        editor.setHtml(this.currentValue)
      }
    },
    effectiveReadOnly(value) {
      const editor = this.editorInstance
      if (editor) value ? editor.disable() : editor.enable()
    }
  },
  created() {
    // Keep Slate instances out of Vue2's deep reactive observer.
    this.editorInstance = null
    this.toolbarInstance = null
    this.currentValue = this.value || ''
  },
  mounted() {
    const imageUpload = useUpload(this.directory + '-image').httpRequest
    const videoUpload = useUpload(this.directory + '-video').httpRequest
    const config = merge({
      placeholder: '请输入内容...',
      readOnly: this.effectiveReadOnly,
      autoFocus: false,
      scroll: true,
      customAlert: (text, type) => {
        const level = ['success', 'info', 'warning', 'error'].includes(type) ? type : 'info'
        this.$message[level](text)
      },
      EXTEND_CONF: { mentionConfig: { showModal() {}, hideModal() {} }},
      MENU_CONF: {
        uploadImage: {
          maxFileSize: 10 * 1024 * 1024,
          maxNumberOfFiles: 100,
          allowedFileTypes: ['image/*'],
          customUpload: (file, insertFn) => this.uploadMedia(imageUpload, file, insertFn, 'image', '图片')
        },
        uploadVideo: {
          maxFileSize: 1024 * 1024 * 1024,
          maxNumberOfFiles: 10,
          allowedFileTypes: ['video/*'],
          customUpload: (file, insertFn) => this.uploadMedia(videoUpload, file, insertFn, 'mp4', '视频')
        }
      },
      uploadImgShowBase64: true
    }, this.editorConfig || {})
    // An explicit endpoint uses WangEditor's configured server transport,
    // rather than the default infra-file custom uploader.
    for (const key of ['uploadImage', 'uploadVideo']) {
      const supplied = this.editorConfig && this.editorConfig.MENU_CONF && this.editorConfig.MENU_CONF[key]
      if (supplied && supplied.server && !Object.prototype.hasOwnProperty.call(supplied, 'customUpload')) {
        delete config.MENU_CONF[key].customUpload
      }
    }
    const onChange = config.onChange
    config.onChange = editor => {
      this.currentValue = editor.getHtml()
      this.$emit('input', this.currentValue)
      this.$emit('change', editor)
      if (onChange) onChange(editor)
    }
    this.editorInstance = markRaw(createEditor({ selector: this.$refs.editor, html: this.value || '', config, mode: 'default' }))
    this.toolbarInstance = createToolbar({ selector: this.$refs.toolbar, editor: this.editorInstance, mode: 'default' })
  },
  beforeDestroy() {
    if (this.toolbarInstance) this.toolbarInstance.destroy()
    if (this.editorInstance) this.editorInstance.destroy()
    this.toolbarInstance = null
    this.editorInstance = null
  },
  methods: {
    async getEditorRef() {
      await this.$nextTick()
      return this.editorInstance
    },
    async uploadMedia(httpRequest, file, insertFn, kind, label) {
      try {
        const response = await httpRequest({ file, onProgress() {}, onSuccess() {}, onError() {} })
        insertFn(response.data, kind, response.data)
      } catch (error) {
        this.$message.error(error.msg || label + '上传失败')
      }
    }
  }
}
</script>

<style scoped>
.shared-editor { min-width: 0; border: 1px solid #dcdfe6; }
.shared-editor__toolbar { border-bottom: 1px solid #dcdfe6; }
</style>
