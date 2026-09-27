<template>
  <i
    :class="iconClass"
    :style="{ fontSize: `${size}px`, color }"
    aria-hidden="true"
  />
</template>

<script>
const ICONS = {
  'ep:caret-bottom': 'el-icon-caret-bottom',
  'ep:caret-right': 'el-icon-caret-right',
  'ep:more-filled': 'el-icon-more',
  'ant-design:search-outlined': 'el-icon-search',
  'ant-design:contacts-outlined': 'el-icon-notebook-2',
  'ant-design:message-outlined': 'el-icon-chat-line-round',
  'ant-design:phone-outlined': 'el-icon-phone-outline',
  'ant-design:video-camera-outlined': 'el-icon-video-camera',
  'ant-design:man-outlined': 'el-icon-male',
  'ant-design:woman-outlined': 'el-icon-female',
  'mdi:human-male': 'el-icon-male',
  'mdi:human-female': 'el-icon-female'
}

export default {
  name: 'ImIcon',
  props: {
    icon: { type: String, required: true },
    size: { type: Number, default: 16 },
    color: { type: String, default: '' }
  },
  computed: {
    iconClass() {
      return ICONS[this.icon] || 'el-icon-info'
    }
  }
}
</script>
