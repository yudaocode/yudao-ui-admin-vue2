<template>
  <div class="music-song-card" :class="{ 'is-active': active }" @click="playSong">
    <div class="music-song-card__cover">
      <el-image :src="songInfo.imageUrl" class="music-song-card__image" />
      <div class="music-song-card__overlay">
        <i :class="active ? 'el-icon-video-pause' : 'el-icon-video-play'" />
      </div>
    </div>
    <div class="music-song-card__content">
      <div class="music-song-card__title">{{ songInfo.title }}</div>
      <div class="music-song-card__desc">{{ songInfo.desc }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AiMusicSongCard',
  props: {
    songInfo: {
      type: Object,
      default: () => ({})
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    playSong() {
      this.$emit('play')
    }
  }
}
</script>

<style scoped>
.music-song-card {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.music-song-card.is-active {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.15);
}

.music-song-card__cover {
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: 12px;
  border-radius: 4px;
  overflow: hidden;
}

.music-song-card__image {
  width: 80px;
  height: 80px;
}

.music-song-card__overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  font-size: 30px;
}

.music-song-card__content {
  min-width: 0;
}

.music-song-card__title {
  font-size: 16px;
  font-weight: 600;
}

.music-song-card__desc {
  margin-top: 6px;
  color: #909399;
  line-height: 1.4;
  max-height: 3em;
  overflow: hidden;
}
</style>
