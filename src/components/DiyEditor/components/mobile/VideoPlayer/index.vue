<template>
  <div class="video-player" :style="{ height: property.style.height + 'px' }">
    <el-image v-if="property.posterUrl" class="media" :src="property.posterUrl" />
    <video
      v-else
      class="media"
      :src="property.videoUrl"
      :poster="property.posterUrl"
      :autoplay="property.autoplay"
      controls
    />
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.video-player,
.media {
  width: 100%;
}

img {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
