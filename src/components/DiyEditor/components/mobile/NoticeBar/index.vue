<template>
  <div
    class="notice-bar"
    :style="{ backgroundColor: property.backgroundColor, color: property.textColor }"
  >
    <el-image :src="property.iconUrl" class="notice-icon" />
    <el-divider direction="vertical" />
    <el-carousel height="24px" direction="vertical" :autoplay="true" class="notice-carousel">
      <el-carousel-item v-for="(item, index) in property.contents" :key="index">
        <div class="notice-content">{{ item.text }}</div>
      </el-carousel-item>
    </el-carousel>
    <svg-icon icon-class="ep:arrow-right" />
  </div>
</template>

<script>
export default {
  name: 'NoticeBar',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.notice-bar {
  display: flex;
  padding: 4px 0;
  font-size: 12px;
  align-items: center;
}

.notice-icon {
  height: 18px;
}

.notice-carousel {
  flex: 1;
  padding-right: 8px;
}

.notice-content {
  height: 24px;
  overflow: hidden;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
