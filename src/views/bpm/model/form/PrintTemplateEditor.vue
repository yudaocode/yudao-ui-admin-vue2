<template>
  <el-dialog
    title="自定义打印模板"
    :visible.sync="dialogVisible"
    fullscreen
    append-to-body
    custom-class="bpm-print-template-editor-dialog"
    @closed="clearEditor"
  >
    <div class="print-template-editor">
      <el-alert
        title="可直接编辑模板，使用工具栏插入流程字段或流程记录；模板会在保存前过滤脚本和危险链接。"
        type="info"
        :closable="false"
        show-icon
      />

      <div class="print-template-editor__toolbar" role="toolbar" aria-label="打印模板工具栏">
        <el-button-group>
          <el-button
            size="mini"
            title="加粗"
            aria-label="加粗"
            @mousedown.native.prevent="rememberSelection"
            @click="execCommand('bold')"
          ><strong>B</strong></el-button>
          <el-button
            size="mini"
            title="斜体"
            aria-label="斜体"
            @mousedown.native.prevent="rememberSelection"
            @click="execCommand('italic')"
          ><em>I</em></el-button>
          <el-button
            size="mini"
            title="下划线"
            aria-label="下划线"
            @mousedown.native.prevent="rememberSelection"
            @click="execCommand('underline')"
          ><u>U</u></el-button>
          <el-button
            size="mini"
            title="无序列表"
            aria-label="无序列表"
            @mousedown.native.prevent="rememberSelection"
            @click="execCommand('insertUnorderedList')"
          >列表</el-button>
          <el-button
            size="mini"
            title="清除格式"
            aria-label="清除格式"
            @mousedown.native.prevent="rememberSelection"
            @click="execCommand('removeFormat')"
          >清除格式</el-button>
        </el-button-group>

        <el-dropdown
          class="print-template-editor__dropdown"
          trigger="click"
          @command="insertMention"
          @mousedown.native.prevent="rememberSelection"
        >
          <el-button size="mini" type="primary">
            插入流程字段<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="item in mentionOptions"
              :key="item.id"
              :command="item.id"
            >
              {{ item.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button
          size="mini"
          class="print-template-editor__action"
          @mousedown.native.prevent="rememberSelection"
          @click="insertProcessRecord"
        >
          插入流程记录
        </el-button>
        <el-button
          size="mini"
          class="print-template-editor__action"
          @mousedown.native.prevent="rememberSelection"
          @click="insertTable"
        >
          插入表格
        </el-button>
      </div>

      <div
        ref="editor"
        class="print-template-editor__canvas"
        contenteditable="true"
        spellcheck="false"
        role="textbox"
        aria-multiline="true"
        aria-label="打印模板内容"
        @input="handleInput"
        @keyup="handleEditorKeyup"
        @mouseup="rememberSelection"
        @focus="rememberSelection"
        @paste="handlePaste"
      ></div>
      <MentionModal
        v-if="mentionVisible"
        :form-fields="formFields"
        @hide-mention-modal="hideMentionModal"
        @insert-mention="insertMentionFromModal"
      />
      <div class="print-template-editor__status">
        <span>流程字段会以占位标记保存，打印时自动替换为实际值。</span>
        <span>{{ textLength }} 字</span>
      </div>
    </div>

    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  DEFAULT_PRINT_TEMPLATE,
  PRINT_TEMPLATE_VARIABLES,
  createMentionHtml,
  createProcessRecordHtml,
  escapeHtml,
  sanitizePrintTemplate
} from './print-template'
import MentionModal from './PrintTemplate/MentionModal.vue'

export default {
  name: 'BpmPrintTemplateEditor',
  components: { MentionModal },
  props: {
    formFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      lastSelection: null,
      textLength: 0,
      mentionVisible: false
    }
  },
  computed: {
    mentionOptions() {
      const options = PRINT_TEMPLATE_VARIABLES.slice()
      const seen = new Set(options.map((item) => item.id))
      ;(this.formFields || []).forEach((field) => {
        let source = field
        if (typeof field === 'string') {
          try { source = JSON.parse(field) } catch (e) { source = null }
        }
        const id = source && (source.field || source.id)
        if (!id || seen.has(String(id))) return
        seen.add(String(id))
        options.push({
          id: String(id),
          name: `[表单]${source.title || source.name || id}`
        })
      })
      return options
    }
  },
  methods: {
    /** Open is intentionally imperative to match the Vue 3 component API. */
    open(template) {
      this.dialogVisible = true
      this.lastSelection = null
      this.$nextTick(() => {
        const editor = this.$refs.editor
        if (!editor) return
        const source = String(template || '').trim() || DEFAULT_PRINT_TEMPLATE
        editor.innerHTML = sanitizePrintTemplate(source, this.formFields)
        this.updateTextLength()
        this.rememberSelection()
      })
    },
    handleConfirm() {
      const editor = this.$refs.editor
      const template = editor ? sanitizePrintTemplate(editor.innerHTML, this.formFields) : ''
      if (!template || !this.hasVisibleContent(template)) {
        this.$message.warning('打印模板不能为空')
        return
      }
      this.$emit('confirm', template)
      this.dialogVisible = false
    },
    clearEditor() {
      this.lastSelection = null
      this.textLength = 0
      this.mentionVisible = false
      const editor = this.$refs.editor
      if (editor) editor.innerHTML = ''
    },
    handleInput() {
      this.updateTextLength()
      this.rememberSelection()
    },
    handleEditorKeyup(event) {
      this.rememberSelection()
      if (event && event.key === '@') {
        this.mentionVisible = true
      }
    },
    hideMentionModal() {
      this.mentionVisible = false
      this.restoreSelection()
    },
    insertMentionFromModal(id) {
      // The trigger character is part of the current selection. Remove it
      // before inserting the non-editable marker used by the print renderer.
      if (this.restoreSelection() && document.execCommand) {
        document.execCommand('delete', false)
      }
      this.mentionVisible = false
      this.insertMention(id)
    },
    updateTextLength() {
      const editor = this.$refs.editor
      this.textLength = editor ? String(editor.innerText || '').replace(/\s/g, '').length : 0
    },
    hasVisibleContent(template) {
      if (/<(?:table|img|svg)\b/i.test(template)) return true
      return String(template.replace(/<[^>]+>/g, '')).replace(/\s|&nbsp;/g, '').length > 0
    },
    editorContains(node) {
      const editor = this.$refs.editor
      if (!editor || !node) return false
      return node === editor || editor.contains(node)
    },
    rememberSelection() {
      const editor = this.$refs.editor
      const selection = window.getSelection ? window.getSelection() : null
      if (!editor || !selection || selection.rangeCount === 0) return
      const range = selection.getRangeAt(0)
      if (this.editorContains(range.startContainer) && this.editorContains(range.endContainer)) {
        this.lastSelection = range.cloneRange()
      }
    },
    restoreSelection() {
      const editor = this.$refs.editor
      if (!editor) return false
      editor.focus()
      const selection = window.getSelection ? window.getSelection() : null
      if (!selection) return false
      selection.removeAllRanges()
      if (this.lastSelection && this.editorContains(this.lastSelection.startContainer)) {
        selection.addRange(this.lastSelection)
      } else {
        const range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
        selection.addRange(range)
      }
      return true
    },
    execCommand(command, value) {
      if (!this.restoreSelection()) return
      if (document.execCommand) document.execCommand(command, false, value || null)
      this.handleInput()
    },
    insertMention(id) {
      const item = this.mentionOptions.find((option) => option.id === String(id))
      if (!item) return
      this.insertHtmlAtSelection(createMentionHtml(item.id, item.name))
    },
    insertProcessRecord() {
      this.insertHtmlAtSelection(createProcessRecordHtml())
    },
    insertTable() {
      const table = '<table style="width: 100%; border-collapse: collapse;" border="1"><tbody><tr><td>字段</td><td>内容</td></tr><tr><td>请编辑</td><td>请编辑</td></tr></tbody></table><p><br></p>'
      this.insertHtmlAtSelection(table)
    },
    insertHtmlAtSelection(html) {
      if (!this.restoreSelection()) return
      const safeHtml = sanitizePrintTemplate(html, this.formFields)
      if (document.execCommand) {
        document.execCommand('insertHTML', false, safeHtml)
      } else {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          const wrapper = document.createElement('div')
          wrapper.innerHTML = safeHtml
          const fragment = document.createDocumentFragment()
          while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild)
          range.insertNode(fragment)
        }
      }
      this.handleInput()
    },
    handlePaste(event) {
      this.mentionVisible = false
      const clipboard = event.clipboardData || window.clipboardData
      if (!clipboard) return
      const html = clipboard.getData('text/html')
      const text = clipboard.getData('text/plain')
      event.preventDefault()
      const safeHtml = html
        ? sanitizePrintTemplate(html, this.formFields)
        : escapeHtml(text || '').replace(/\r?\n/g, '<br>')
      this.insertHtmlAtSelection(safeHtml)
    }
  }
}
</script>

<style scoped>
.print-template-editor {
  min-height: calc(100vh - 180px);
}

.print-template-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.print-template-editor__dropdown,
.print-template-editor__action {
  margin-left: 0;
}

.print-template-editor__canvas {
  min-height: 520px;
  padding: 16px;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  outline: none;
  line-height: 1.6;
}

.print-template-editor__canvas:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
}

.print-template-editor__canvas [data-w-e-type='mention'],
.print-template-editor__canvas [data-w-e-type='process-record'] {
  display: inline-block;
  padding: 0 4px;
  border-radius: 3px;
  background: #ecf5ff;
  color: #409eff;
  cursor: default;
}

.print-template-editor__canvas [data-w-e-type='process-record'] {
  background: #f0f9eb;
  color: #67c23a;
}

.print-template-editor__status {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
