<template>
  <div class="title-mention-input">
    <el-input
      ref="input"
      :value="value"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder"
      @input="handleInput"
      @focus.native="rememberCursor"
      @click.native="rememberCursor"
      @keyup.native="handleKeyup"
      @select.native="rememberCursor"
    />
    <div
      v-if="visible"
      class="title-mention-input__menu"
      @mousedown.prevent
    >
      <div
        v-for="option in filteredOptions"
        :key="option.value"
        class="title-mention-input__option"
        @mousedown.prevent="selectOption(option)"
      >
        <span>{{ option.label }}</span>
        <small>{{ formatToken(option.value) }}</small>
      </div>
      <div v-if="filteredOptions.length === 0" class="title-mention-input__empty">
        暂无匹配字段
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Vue2 equivalent of Element Plus' `el-mention` for process titles.
 *
 * The value written to the model is deliberately the same `{field}` text
 * consumed by the backend.  The component is intentionally small and does
 * not intercept ordinary text input; it only opens a field list while the
 * cursor is inside an unmatched pair of braces.
 */
export default {
  name: 'BpmTitleMentionInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    rows: {
      type: Number,
      default: 2
    },
    placeholder: {
      type: String,
      default: '请输入文本；输入“{”可选择流程变量或表单字段'
    }
  },
  data() {
    return {
      visible: false,
      query: '',
      cursor: 0,
      braceStart: -1
    }
  },
  computed: {
    normalizedOptions() {
      return (this.options || []).map((option) => ({
        label: option && (option.label || option.name || option.title || option.value),
        value: String(option && (option.value !== undefined ? option.value : option.id) || '')
      })).filter((option) => option.value)
    },
    filteredOptions() {
      const query = String(this.query || '').toLowerCase()
      return this.normalizedOptions.filter((option) => {
        return !query || String(option.label).toLowerCase().indexOf(query) >= 0 || option.value.toLowerCase().indexOf(query) >= 0
      })
    }
  },
  methods: {
    getTextarea() {
      const input = this.$refs.input
      return input && input.$refs ? input.$refs.textarea : null
    },
    formatToken(value) {
      return `{${value}}`
    },
    handleInput(value) {
      this.$emit('input', value)
      this.$nextTick(() => {
        this.rememberCursor()
        this.updateMentionState()
      })
    },
    rememberCursor() {
      const textarea = this.getTextarea()
      if (textarea && typeof textarea.selectionStart === 'number') {
        this.cursor = textarea.selectionStart
      }
      this.updateMentionState()
    },
    handleKeyup(event) {
      if (event && event.key === 'Escape') {
        this.visible = false
        return
      }
      if (event && event.key === 'Enter' && this.visible && this.filteredOptions.length) {
        event.preventDefault()
        this.selectOption(this.filteredOptions[0])
        return
      }
      this.rememberCursor()
    },
    updateMentionState() {
      const text = String(this.value || '')
      const cursor = Math.max(0, Math.min(this.cursor, text.length))
      const before = text.slice(0, cursor)
      const start = before.lastIndexOf('{')
      const close = before.lastIndexOf('}')
      if (start < 0 || close > start) {
        this.visible = false
        this.braceStart = -1
        this.query = ''
        return
      }
      // A newline or another opening brace starts a fresh token.  This keeps
      // malformed saved text from opening a list at an unrelated position.
      const query = before.slice(start + 1)
      if (/[\r\n{]/.test(query)) {
        this.visible = false
        this.braceStart = -1
        this.query = ''
        return
      }
      this.braceStart = start
      this.query = query
      this.visible = true
    },
    selectOption(option) {
      if (!option || this.braceStart < 0) return
      const text = String(this.value || '')
      const cursor = Math.max(this.braceStart + 1, Math.min(this.cursor, text.length))
      const nextValue = `${text.slice(0, this.braceStart)}{${option.value}}${text.slice(cursor)}`
      const nextCursor = this.braceStart + option.value.length + 2
      this.$emit('input', nextValue)
      this.visible = false
      this.braceStart = -1
      this.query = ''
      this.$nextTick(() => {
        const textarea = this.getTextarea()
        if (textarea && typeof textarea.setSelectionRange === 'function') {
          textarea.focus()
          textarea.setSelectionRange(nextCursor, nextCursor)
          this.cursor = nextCursor
        }
      })
    }
  }
}
</script>

<style scoped>
.title-mention-input {
  position: relative;
  width: 100%;
}

.title-mention-input__menu {
  position: absolute;
  z-index: 2100;
  top: calc(100% + 4px);
  left: 0;
  width: min(360px, 100%);
  max-height: 220px;
  padding: 4px 0;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.title-mention-input__option,
.title-mention-input__empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  font-size: 13px;
}

.title-mention-input__option {
  cursor: pointer;
}

.title-mention-input__option:hover {
  background: #f5f7fa;
}

.title-mention-input__option small {
  margin-left: 12px;
  color: #909399;
}

.title-mention-input__empty {
  color: #909399;
}
</style>
