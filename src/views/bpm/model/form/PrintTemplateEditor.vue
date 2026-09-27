<template>
  <el-dialog
    title="自定义模板"
    :visible.sync="dialogVisible"
    fullscreen
    append-to-body
    custom-class="bpm-print-template-editor-dialog"
    @closed="clearEditor"
  >
    <el-alert
      title="输入 @ 可选择插入流程表单选项和默认选项"
      type="info"
      show-icon
      :closable="false"
    />
    <div class="print-template-editor">
      <div
        ref="toolbar"
        class="print-template-editor__toolbar"
      />
      <div
        ref="editor"
        class="print-template-editor__canvas"
      />
      <MentionModal
        v-if="mentionVisible"
        :form-fields="formFields"
        @hide-mention-modal="hideMentionModal"
        @insert-mention="insertMention"
      />
    </div>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
      >确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createEditor, createToolbar } from '@wangeditor-next/editor'
import '@wangeditor-next/editor/dist/css/style.css'
import { setupWangEditorPlugin } from './PrintTemplate/setup'
import { sanitizePrintTemplate } from './print-template'
import MentionModal from './PrintTemplate/MentionModal.vue'

setupWangEditorPlugin()

export default {
  name: 'BpmPrintTemplateEditor',
  components: { MentionModal },
  props: { formFields: { type: Array, default: () => [] }},
  data() {
    return { dialogVisible: false, mentionVisible: false, valueHtml: '' }
  },
  created() {
    // Slate editor/toolbar instances must not enter Vue2's deep observer.
    this.editorInstance = null
    this.toolbarInstance = null
    this.openSequence = 0
  },
  beforeDestroy() { this.clearEditor() },
  methods: {
    async open(template) {
      this.clearEditor()
      const sequence = this.openSequence
      this.valueHtml = sanitizePrintTemplate(template, this.formFields)
      this.dialogVisible = true
      await this.$nextTick()
      if (sequence !== this.openSequence || !this.dialogVisible || this._isDestroyed) return
      this.editorInstance = createEditor({
        selector: this.$refs.editor,
        html: this.valueHtml,
        mode: 'default',
        config: {
          placeholder: '请输入内容...',
          onChange: editor => { this.valueHtml = editor.getHtml() },
          EXTEND_CONF: {
            mentionConfig: {
              showModal: () => { this.mentionVisible = true },
              hideModal: () => { this.mentionVisible = false }
            }
          }
        }
      })
      this.toolbarInstance = createToolbar({
        selector: this.$refs.toolbar,
        editor: this.editorInstance,
        mode: 'default',
        config: { excludeKeys: ['group-video'], insertKeys: { index: 31, keys: ['ProcessRecordMenu'] }}
      })
    },
    insertMention(id, name) {
      const editor = this.editorInstance
      if (!editor) return
      editor.restoreSelection()
      editor.deleteBackward('character')
      editor.insertNode({ type: 'mention', value: name, info: { id }, children: [{ text: '' }] })
      editor.move(1)
      this.mentionVisible = false
    },
    hideMentionModal() { this.mentionVisible = false },
    handleConfirm() {
      const editor = this.editorInstance
      this.$emit('confirm', sanitizePrintTemplate(editor ? editor.getHtml() : this.valueHtml, this.formFields))
      this.dialogVisible = false
    },
    clearEditor() {
      this.openSequence += 1
      this.mentionVisible = false
      if (this.toolbarInstance) this.toolbarInstance.destroy()
      if (this.editorInstance) this.editorInstance.destroy()
      this.toolbarInstance = null
      this.editorInstance = null
    }
  }
}
</script>

<style lang="scss">
.bpm-print-template-editor-dialog {
  .print-template-editor { margin: 10px 0; border: 1px solid #ccc; }
  .print-template-editor__toolbar { border-bottom: 1px solid #ccc; }
  .print-template-editor__canvas { height: 500px; overflow-y: hidden; }
}
</style>
