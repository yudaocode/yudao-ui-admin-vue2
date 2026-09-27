<template>
  <div v-if="!property.imgUrl" class="image-placeholder">
    <svg-icon icon-class="ep:picture" :size="30" color="#606266" />
  </div>
  <el-image v-else class="image" :src="property.imgUrl" />
</template>

<script>
export default {
  name: 'ImageBar',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.image-placeholder {
  display: flex;
  height: 50px;
  background: #f2f3f5;
  align-items: center;
  justify-content: center;
}

.image {
  min-height: 30px;
}

img {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
