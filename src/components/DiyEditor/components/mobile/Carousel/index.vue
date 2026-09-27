<template>
  <div v-if="property.items.length === 0" class="carousel-placeholder">
    <svg-icon icon-class="tdesign:image" :size="120" color="#606266" />
  </div>
  <div v-else class="carousel-wrap">
    <el-carousel
      :height="property.height + 'px'"
      :type="property.type === 'card' ? 'card' : ''"
      :autoplay="property.autoplay"
      :interval="property.interval * 1000"
      :indicator-position="property.indicator === 'number' ? 'none' : undefined"
      @change="handleIndexChange"
    >
      <el-carousel-item v-for="(item, index) in property.items" :key="index">
        <el-image class="carousel-image" :src="item.imgUrl" />
      </el-carousel-item>
    </el-carousel>
    <div v-if="property.indicator === 'number'" class="number-indicator">
      {{ currentIndex }} / {{ property.items.length }}
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/multi-word-component-names */
export default {
  name: 'Carousel',
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return { currentIndex: 0 }
  },
  methods: {
    handleIndexChange(index) {
      this.currentIndex = index + 1
    }
  }
}
</script>

<style scoped lang="scss">
.carousel-placeholder {
  display: flex;
  height: 250px;
  background: #f2f3f5;
  align-items: center;
  justify-content: center;
}

.carousel-wrap {
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100%;
}

.number-indicator {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #000;
  color: #fff;
  font-size: 10px;
  opacity: 0.4;
}
</style>
