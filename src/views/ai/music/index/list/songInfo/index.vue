<template>
  <el-card shadow="never" class="music-song-info">
    <el-image :src="songInfo.imageUrl" class="music-song-info__cover" />
    <div class="music-song-info__title">{{ songInfo.title }}</div>
    <div class="music-song-info__desc">{{ songInfo.desc }}</div>
    <div class="music-song-info__date">{{ songInfo.date }}</div>
    <el-button size="small" round class="music-song-info__button">信息复用</el-button>
    <div class="music-song-info__lyric" v-html="songInfo.lyric" />
  </el-card>
</template>

<script>
export default {
  name: 'AiMusicSongInfo',
  props: {
    songInfo: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
.music-song-info {
  width: 300px;
  line-height: 24px;
  flex: none;
}

.music-song-info__cover {
  width: 100%;
  margin-bottom: 12px;
}

.music-song-info__title {
  font-size: 18px;
  font-weight: 600;
}

.music-song-info__desc,
.music-song-info__date,
.music-song-info__lyric {
  margin-top: 6px;
  color: #909399;
  white-space: pre-wrap;
}

.music-song-info__button {
  margin-top: 12px;
}

.music-song-info__lyric {
  margin-top: 12px;
  color: #606266;
}
</style>
