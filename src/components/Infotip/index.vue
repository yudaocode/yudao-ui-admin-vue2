<template>
  <div class="infotip">
    <div v-if="title" class="infotip__header">
      <i class="el-icon-warning infotip__icon" />
      <span class="infotip__title">{{ title }}</span>
    </div>
    <div class="infotip__content">
      <p v-for="(item, $index) in schema" :key="$index" class="infotip__item">
        <template v-if="typeof item === 'string'">{{ showIndex ? `${$index + 1}、` : '' }}{{ item }}</template>
        <template v-else>
          {{ showIndex ? `${$index + 1}、` : '' }}<span
            v-for="(segment, segmentIndex) in splitSegments(item)"
            :key="segmentIndex"
            :class="{ 'infotip__highlight': segment.highlight }"
            :style="segment.highlight ? highlightStyle : null"
            @click="segment.highlight && $emit('click', segment.text)"
          >{{ segment.text }}</span>
        </template>
      </p>
    </div>
  </div>
</template>

<script>
/**
 * 提示条组件（Vue3 src/components/Infotip/src/Infotip.vue 的 Vue2 等价实现）
 * 属性与插槽与 Vue3 版本对齐：title / schema（string 或 { label, keys }）/ showIndex / highlightColor，click 事件
 * Vue3 版使用 ep:warning-filled 图标与 Highlight 组件；Vue2 版使用 element-ui 内置图标并内置高亮切分逻辑
 */
export default {
  name: 'Infotip',
  props: {
    title: {
      type: String,
      default: ''
    },
    schema: {
      type: Array,
      default: () => []
    },
    showIndex: {
      type: Boolean,
      default: true
    },
    highlightColor: {
      type: String,
      default: '#1890ff'
    }
  },
  computed: {
    highlightStyle() {
      return {
        color: this.highlightColor,
        cursor: 'pointer'
      }
    }
  },
  methods: {
    // 将 label 按 keys 切分为普通片段与高亮片段（等价 Vue3 Highlight 组件行为）
    splitSegments(item) {
      const label = item.label || ''
      const keys = (item.keys || []).filter(Boolean).sort((a, b) => b.length - a.length)
      if (!keys.length) {
        return [{ text: label, highlight: false }]
      }
      const segments = []
      let rest = label
      while (rest) {
        const matchIndex = keys.map((key) => rest.indexOf(key)).filter((index) => index !== -1)
        if (!matchIndex.length) {
          segments.push({ text: rest, highlight: false })
          break
        }
        const firstIndex = Math.min(...matchIndex)
        const key = keys.find((key) => rest.indexOf(key) === firstIndex)
        if (firstIndex > 0) {
          segments.push({ text: rest.slice(0, firstIndex), highlight: false })
        }
        segments.push({ text: key, highlight: true })
        rest = rest.slice(firstIndex + key.length)
      }
      return segments
    }
  }
}
</script>

<style scoped>
.infotip {
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #1890ff;
  background: #e8f4ff;
  border-radius: 4px;
}

.infotip__header {
  display: flex;
  align-items: center;
}

.infotip__icon {
  font-size: 22px;
  color: #1890ff;
}

.infotip__title {
  padding-left: 5px;
  font-size: 16px;
  font-weight: bold;
}

.infotip__item {
  margin: 15px 0 0;
  font-size: 14px;
  line-height: 1.5;
}

.infotip__highlight {
  color: #1890ff;
  cursor: pointer;
}
</style>
