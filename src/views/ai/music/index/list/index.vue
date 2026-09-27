<template>
  <div class="music-list">
    <div class="music-list__body">
      <el-tabs v-model="currentType" class="music-list__tabs">
        <el-tab-pane v-loading="loading" label="我的创作" name="mine">
          <el-row v-if="mySongList.length" :gutter="12">
            <el-col v-for="song in mySongList" :key="song.id" :span="24">
              <MusicSongCard :song-info="song" :active="currentSong.id === song.id" @play="setCurrentSong(song)" />
            </el-col>
          </el-row>
          <el-empty v-else description="暂无音乐" />
        </el-tab-pane>

        <el-tab-pane v-loading="loading" label="试听广场" name="square">
          <el-row v-if="squareSongList.length" :gutter="12">
            <el-col v-for="song in squareSongList" :key="song.id" :span="24">
              <MusicSongCard :song-info="song" :active="currentSong.id === song.id" @play="setCurrentSong(song)" />
            </el-col>
          </el-row>
          <el-empty v-else description="暂无音乐" />
        </el-tab-pane>
      </el-tabs>

      <MusicSongInfo class="music-list__info" :song-info="currentSong" />
    </div>

    <MusicAudioBar class="music-list__bar" :song-info="currentSong" />
  </div>
</template>

<script>
import MusicAudioBar from './audioBar/index.vue'
import MusicSongCard from './songCard/index.vue'
import MusicSongInfo from './songInfo/index.vue'
import { createMusicSongList } from './types'

export default {
  name: 'AiMusicList',
  components: {
    MusicAudioBar,
    MusicSongCard,
    MusicSongInfo
  },
  data() {
    return {
      currentType: 'mine',
      loading: false,
      currentSong: {},
      mySongList: [],
      squareSongList: []
    }
  },
  methods: {
    generateMusic(formData) {
      this.loading = true
      setTimeout(() => {
        this.mySongList = createMusicSongList(20, formData)
        this.loading = false
      }, 3000)
    },
    setCurrentSong(song) {
      this.currentSong = song || {}
    }
  }
}
</script>

<style scoped>
.music-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.music-list__body {
  display: flex;
  min-height: 0;
  flex: 1;
}

.music-list__tabs {
  flex: 1;
  min-width: 0;
}

.music-list__info {
  flex: none;
  margin-left: 12px;
}

.music-list__bar {
  flex: none;
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-tabs__content) {
  padding: 0 7px;
  overflow: auto;
  min-height: 0;
  flex: 1;
}
</style>
