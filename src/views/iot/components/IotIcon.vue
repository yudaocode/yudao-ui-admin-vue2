<template>
  <i
    :class="iconClass"
    :style="{ fontSize: `${size}px`, color }"
    aria-hidden="true"
  />
</template>

<script>
import '@/views/iot/styles/vue2.css';
const ICONS = {
  'ep:clock': 'el-icon-time',
  'ep:grid': 'el-icon-s-grid',
  'ep:histogram': 'el-icon-data-analysis',
  'ep:list': 'el-icon-tickets',
  'ep:hide': 'el-icon-view',
  'ep:edit-pen': 'el-icon-edit',
  'ep:question-filled': 'el-icon-question',
  'ep:info-filled': 'el-icon-info',
  'ep:document-copy': 'el-icon-document-copy',
  'ep:scale-to-original': 'el-icon-full-screen',
  'ph:copy': 'el-icon-document-copy',
  'ph:eye': 'el-icon-view',
  'ph:eye-slash': 'el-icon-view'
}

export default {
  name: 'IotIcon',
  props: {
    icon: { type: String, required: true },
    size: { type: Number, default: 16 },
    color: { type: String, default: '' }
  },
  computed: {
    iconClass() {
      return ICONS[this.icon] || (this.icon.startsWith('ep:') ? `el-icon-${this.icon.slice(3)}` : 'el-icon-info')
    }
  }
}
</script>
