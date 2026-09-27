<template>
  <div class="hot-zone-preview">
    <el-image :src="property.imgUrl" class="preview-image" />
    <div
      v-for="(item, index) in property.list"
      :key="index"
      class="hot-zone"
      :style="{
        width: item.width + 'px',
        height: item.height + 'px',
        top: item.top + 'px',
        left: item.left + 'px'
      }"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'HotZone',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.hot-zone-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 30px;
}

.preview-image {
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
}

.hot-zone {
  position: absolute;
  z-index: 10;
  display: flex;
  font-size: 14px;
  color: #409eff;
  cursor: move;
  background: #c6e2ff;
  border: 1px solid #409eff;
  opacity: 0.8;
  align-items: center;
  justify-content: center;
}
</style>
