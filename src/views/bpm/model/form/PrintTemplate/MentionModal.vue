<template>
  <div class="mention-modal" :style="{ top: top, left: left }" @mousedown.prevent>
    <input
      ref="input"
      v-model="searchVal"
      class="mention-input"
      aria-label="搜索流程字段"
      @keyup="handleKeyup"
    >
    <ul class="mention-list">
      <li
        v-for="item in searchedList"
        :key="item.id"
        @click="select(item)"
      >
        {{ item.name }}
      </li>
      <li v-if="searchedList.length === 0" class="mention-empty">暂无匹配字段</li>
    </ul>
  </div>
</template>

<script>
import { PRINT_TEMPLATE_VARIABLES } from '../print-template'

export default {
  name: 'PrintTemplateMentionModal',
  props: {
    formFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      top: '0px',
      left: '0px',
      searchVal: ''
    }
  },
  computed: {
    options() {
      const result = PRINT_TEMPLATE_VARIABLES.slice()
      const seen = new Set(result.map((item) => item.id))
      ;(this.formFields || []).forEach((field) => {
        let source = field
        if (typeof field === 'string') {
          try { source = JSON.parse(field) } catch (e) { source = null }
        }
        const id = source && (source.field || source.id)
        if (!id || seen.has(String(id))) return
        seen.add(String(id))
        result.push({ id: String(id), name: `[表单]${source.title || source.name || id}` })
      })
      return result
    },
    searchedList() {
      const query = String(this.searchVal || '').trim().toLowerCase()
      return this.options.filter((item) => !query || String(item.name).toLowerCase().indexOf(query) >= 0)
    }
  },
  mounted() {
    this.position()
    this.$nextTick(() => this.$refs.input && this.$refs.input.focus())
  },
  methods: {
    position() {
      const selection = window.getSelection && window.getSelection()
      const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null
      const rect = range && range.getBoundingClientRect ? range.getBoundingClientRect() : null
      if (rect) {
        this.top = `${Math.max(8, rect.bottom + 4)}px`
        this.left = `${Math.max(8, rect.left)}px`
      }
    },
    handleKeyup(event) {
      if (event.key === 'Escape') {
        this.$emit('hide-mention-modal')
      } else if (event.key === 'Enter') {
        const first = this.searchedList[0]
        if (first) this.select(first)
      }
    },
    select(item) {
      this.$emit('insert-mention', item.id, item.name)
      this.$emit('hide-mention-modal')
    }
  }
}
</script>

<style scoped>
.mention-modal {
  position: fixed;
  z-index: 3000;
  min-width: 180px;
  max-width: 260px;
  padding: 6px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.mention-input {
  box-sizing: border-box;
  width: 100%;
  padding: 4px 6px;
  outline: none;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
}
.mention-list {
  max-height: 220px;
  padding: 0;
  margin: 4px 0 0;
  overflow-y: auto;
  list-style: none;
}
.mention-list li {
  padding: 5px 6px;
  cursor: pointer;
}
.mention-list li:hover { background: #f5f7fa; }
.mention-list .mention-empty { color: #909399; cursor: default; }
</style>
