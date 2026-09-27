<template>
  <div class="json-editor" :style="{ height }">
    <el-input
      v-model="text"
      type="textarea"
      :rows="rows"
      :readonly="!isEditable"
      :class="{ 'is-json-error': hasError }"
      resize="none"
    />
    <div v-if="hasError" class="json-editor__error">JSON 格式错误：{{ errorMessage }}</div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'

/**
 * JSON 编辑器组件（Vue2 + Element UI 版本）。
 *
 * 与 Vue3 版（基于 josdejong/jsoneditor 封装）保持一致的 props / 事件契约：
 *   - v-model（modelValue / update:modelValue）
 *   - change / error 事件
 * 由于目标仓库未引入 jsoneditor 依赖，这里用 el-input textarea 实现等价能力：
 *   - view 等模式下只读回显（格式化后的 JSON）
 *   - code / text 模式下可编辑，实时校验；非法 JSON 触发 error 事件且不更新 v-model
 */
export default {
  name: 'JsonEditor',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  props: {
    // JSON 数据，支持双向绑定
    modelValue: {
      type: null,
      default: null
    },
    // 编辑器模式：view / preview / tree / form 为只读；code / text 可编辑
    mode: {
      type: String,
      default: 'view'
    },
    // 编辑器高度
    height: {
      type: String,
      default: '400px'
    },
    // 是否显示模式选择下拉菜单（占位，与 Vue3 版契约保持一致）
    showModeSelection: {
      type: Boolean,
      default: false
    },
    // 是否显示导航栏（占位，与 Vue3 版契约保持一致）
    showNavigationBar: {
      type: Boolean,
      default: false
    },
    // 是否显示状态栏（占位，与 Vue3 版契约保持一致）
    showStatusBar: {
      type: Boolean,
      default: false
    },
    // 是否显示主菜单栏（占位，与 Vue3 版契约保持一致）
    showMainMenuBar: {
      type: Boolean,
      default: true
    },
    // 额外配置（占位，与 Vue3 版契约保持一致）
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'change', 'error'],
  setup(props, { emit, expose }) {
    const text = ref('')
    const hasError = ref(false)
    const errorMessage = ref('')
    const lastValid = ref(props.modelValue)

    // code / text 模式下允许编辑原始 JSON，其余模式只读展示
    const isEditable = computed(() => props.mode === 'code' || props.mode === 'tree' || props.mode === 'form' || props.mode === 'text')
    const rows = computed(() => {
      const match = /^(\d+)px$/.exec(props.height || '')
      const px = match ? Number(match[1]) : 400
      return Math.max(4, Math.floor(px / 24))
    })

    /** 将值格式化为 2 空格缩进的 JSON 文本 */
    const formatValue = value => {
      if (value === null || value === undefined) {
        return ''
      }
      try {
        return JSON.stringify(value, null, 2)
      } catch (error) {
        return String(value)
      }
    }

    /** 外部值变化时回显（与编辑器当前内容一致则不刷新，避免打断输入） */
    watch(
      () => props.modelValue,
      newValue => {
        const current = (() => {
          try {
            return JSON.stringify(JSON.parse(text.value))
          } catch (error) {
            return undefined
          }
        })()
        if (current !== JSON.stringify(newValue)) {
          text.value = formatValue(newValue)
          lastValid.value = newValue
          hasError.value = false
          emit('error', [])
        }
      },
      { deep: true, immediate: true }
    )

    /** 模式切换为只读时，重新格式化回显内容 */
    watch(isEditable, editable => {
      if (!editable) {
        text.value = formatValue(lastValid.value)
        hasError.value = false
        emit('error', [])
      }
    })

    /** 编辑内容：合法 JSON 时更新 v-model 并触发 change；非法时触发 error 且不传播 */
    watch(text, newText => {
      if (!isEditable.value) {
        return
      }
      try {
        const parsed = JSON.parse(newText)
        lastValid.value = parsed
        hasError.value = false
        emit('update:modelValue', parsed)
        emit('change', parsed)
        emit('error', [])
      } catch (error) {
        hasError.value = true
        errorMessage.value = error.message
        emit('error', [{ message: error.message }])
      }
    })

    // 暴露方法，与 Vue3 版契约保持一致
    expose({
      getEditor: () => ({
        get: () => lastValid.value,
        update: value => {
          lastValid.value = value
          text.value = formatValue(value)
        }
      })
    })

    return { text, hasError, errorMessage, isEditable, rows }
  }
}
</script>

<style lang="scss" scoped>
.json-editor {
  ::v-deep textarea {
    font-family: Consolas, Menlo, Monaco, 'Courier New', monospace;
    height: 100%;
  }

  .is-json-error ::v-deep textarea {
    border-color: #f56c6c;
  }

  &__error {
    margin-top: 4px;
    line-height: 1.2;
    font-size: 12px;
    color: #f56c6c;
  }
}
</style>
