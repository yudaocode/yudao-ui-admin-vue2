<template>
  <div class="ai-music-create">
    <MusicMode
      class="ai-music-create__mode"
      @generate-music="generateMusic"
    />
    <MusicList
      ref="listRef"
      class="ai-music-create__list"
    />
  </div>
</template>

<script>
import MusicList from './list/index.vue'
import MusicMode from './mode/index.vue'

export default {
  name: 'AiMusicCreate',
  components: {
    MusicList,
    MusicMode
  },
  methods: {
    generateMusic(payload) {
      this.$refs.listRef.generateMusic(payload.formData)
    }
  }
}
</script>

<style scoped>
.ai-music-create {
  display: flex;
  align-items: stretch;
  height: 100%;
}

.ai-music-create__mode {
  flex: none;
}

.ai-music-create__list {
  flex: auto;
  min-width: 0;
}
</style>
