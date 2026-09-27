<template>
  <el-card
    shadow="never"
    class="music-mode"
  >
    <el-radio-group
      v-model="generateMode"
      class="music-mode__switch"
    >
      <el-radio-button label="desc">描述模式</el-radio-button>
      <el-radio-button label="lyric">歌词模式</el-radio-button>
    </el-radio-group>

    <component
      :is="generateMode === 'desc' ? 'MusicDesc' : 'MusicLyric'"
      ref="modeRef"
    />

    <el-button
      type="primary"
      round
      class="music-mode__generate"
      @click="generateMusic"
    >
      创作音乐
    </el-button>
  </el-card>
</template>

<script>
import MusicDesc from './desc.vue'
import MusicLyric from './lyric.vue'

export default {
  name: 'AiMusicMode',
  components: {
    MusicDesc,
    MusicLyric
  },
  data() {
    return {
      generateMode: 'lyric'
    }
  },
  methods: {
    generateMusic() {
      const modeRef = this.$refs.modeRef
      this.$emit('generate-music', { formData: modeRef && modeRef.formData })
    }
  }
}
</script>

<style scoped>
.music-mode {
  height: 100%;
  width: 300px;
  margin-bottom: 0;
  box-sizing: border-box;
  overflow-y: auto;
}

.music-mode__switch {
  margin-bottom: 15px;
}

.music-mode__generate {
  width: 100%;
}
</style>
