<template>
  <div class="music-title">
    <div class="music-title__heading">
      <span>{{ title }}</span>
      <slot name="extra" />
    </div>
    <div class="music-title__desc">{{ desc }}</div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'AiMusicTitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.music-title {
  margin-bottom: 12px;
}

.music-title__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #303133;
}

.music-title__desc {
  min-height: 18px;
  margin: 8px 0;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}
</style>
