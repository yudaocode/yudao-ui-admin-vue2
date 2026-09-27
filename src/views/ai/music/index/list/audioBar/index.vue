<template>
  <div class="music-audio-bar">
    <div class="music-audio-bar__song">
      <el-image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        class="music-audio-bar__cover"
      />
      <div>
        <div class="music-audio-bar__title">{{ songTitle }}</div>
        <div class="music-audio-bar__subtitle">{{ songSubtitle }}</div>
      </div>
    </div>

    <div class="music-audio-bar__controls">
      <i class="el-icon-back music-audio-bar__icon" />
      <i
        class="music-audio-bar__icon music-audio-bar__icon--primary"
        :class="paused ? 'el-icon-video-play' : 'el-icon-video-pause'"
        @click="toggleStatus('paused')"
      />
      <i class="el-icon-right music-audio-bar__icon" />
      <div class="music-audio-bar__progress">
        <span>{{ currentTime }}</span>
        <el-slider
          v-model="audioProgress"
          :max="audioDuration"
          class="music-audio-bar__slider"
          @change="handleProgressChange"
        />
        <span>{{ duration }}</span>
      </div>
      <audio
        ref="audioRef"
        :src="currentAudioUrl"
        :autoplay="autoplay"
        :muted="muted"
        controls
        v-show="false"
        @timeupdate="audioTimeUpdate"
        @loadedmetadata="audioLoadedMetadata"
      />
    </div>

    <div class="music-audio-bar__volume">
      <i
        class="music-audio-bar__icon"
        :class="muted ? 'el-icon-turn-off-microphone' : 'el-icon-microphone'"
        @click="toggleStatus('muted')"
      />
      <el-slider v-model="volume" class="music-audio-bar__volume-slider" />
    </div>
  </div>
</template>

<script>
import audioUrl from '@/assets/audio/response.mp3'

export default {
  name: 'AiMusicAudioBar',
  props: {
    songInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      autoplay: true,
      paused: false,
      muted: false,
      volume: 50,
      currentTime: '00:00',
      duration: '00:00',
      audioProgress: 0,
      audioDuration: 0
    }
  },
  computed: {
    currentAudioUrl() {
      return this.songInfo.audioUrl || audioUrl
    },
    songTitle() {
      return this.songInfo && this.songInfo.title ? this.songInfo.title : '暂无音乐'
    },
    songSubtitle() {
      return this.songInfo && (this.songInfo.singer || this.songInfo.desc)
    }
  },
  watch: {
    currentAudioUrl() {
      this.resetPlayer()
      this.$nextTick(() => {
        if (this.$refs.audioRef && this.currentAudioUrl) {
          this.$refs.audioRef.load()
        }
      })
    }
  },
  methods: {
    formatTime(seconds) {
      if (!Number.isFinite(seconds)) {
        return '00:00'
      }
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return [minutes, remainingSeconds].map(item => String(item).padStart(2, '0')).join(':')
    },
    resetPlayer() {
      this.paused = false
      this.audioProgress = 0
      this.audioDuration = 0
      this.currentTime = '00:00'
      this.duration = '00:00'
    },
    toggleStatus(type) {
      this[type] = !this[type]
      const audioRef = this.$refs.audioRef
      if (type === 'paused' && audioRef) {
        if (this.paused) {
          audioRef.pause()
        } else {
          audioRef.play()
        }
      }
    },
    audioTimeUpdate() {
      const audioRef = this.$refs.audioRef
      if (!audioRef) {
        return
      }
      this.audioProgress = audioRef.currentTime
      this.currentTime = this.formatTime(audioRef.currentTime)
    },
    audioLoadedMetadata() {
      const audioRef = this.$refs.audioRef
      if (!audioRef) {
        return
      }
      this.audioDuration = audioRef.duration
      this.duration = this.formatTime(audioRef.duration)
    },
    handleProgressChange(value) {
      const audioRef = this.$refs.audioRef
      if (!audioRef || Array.isArray(value)) {
        return
      }
      audioRef.currentTime = value
      this.audioProgress = value
      this.currentTime = this.formatTime(value)
    }
  }
}
</script>

<style scoped>
.music-audio-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 72px;
  padding: 0 12px;
  border: 1px solid #ebeef5;
  border-left: none;
  background: #fff;
}

.music-audio-bar__song,
.music-audio-bar__controls,
.music-audio-bar__volume {
  display: flex;
  align-items: center;
  gap: 12px;
}

.music-audio-bar__cover {
  width: 45px;
}

.music-audio-bar__title {
  font-weight: 600;
}

.music-audio-bar__subtitle {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
}

.music-audio-bar__controls {
  flex: 1;
  min-width: 0;
  justify-content: center;
}

.music-audio-bar__progress {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
}

.music-audio-bar__slider {
  width: 160px;
}

.music-audio-bar__volume-slider {
  width: 160px;
}

.music-audio-bar__icon {
  color: #c0c4cc;
  cursor: pointer;
  font-size: 20px;
}

.music-audio-bar__icon--primary {
  color: #409eff;
  font-size: 30px;
}
</style>
