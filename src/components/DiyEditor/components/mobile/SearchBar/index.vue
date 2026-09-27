<template>
  <div class="search-bar" :style="{ color: property.textColor }">
    <div
      class="inner"
      :style="{
        height: property.height + 'px',
        background: property.backgroundColor,
        borderRadius: property.borderRadius + 'px'
      }"
    >
      <div class="placeholder" :style="{ justifyContent: property.placeholderPosition }">
        <svg-icon icon-class="ep:search" />
        <span>{{ property.placeholder || '搜索商品' }}</span>
      </div>
      <div class="right">
        <span v-for="(keyword, index) in property.hotKeywords" :key="index">{{ keyword }}</span>
        <svg-icon v-show="property.showScan" icon-class="ant-design:scan-outlined" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.inner {
  position: relative;
  display: flex;
  min-height: 28px;
  font-size: 14px;
  align-items: center;
}

.placeholder {
  display: flex;
  width: 100%;
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
  align-items: center;
  gap: 2px;
  box-sizing: border-box;
}

.right {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
