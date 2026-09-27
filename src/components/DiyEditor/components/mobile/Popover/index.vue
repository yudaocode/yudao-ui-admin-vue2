<template>
  <div class="popover-layer">
    <div
      v-for="(item, index) in property.list"
      :key="index"
      class="popover-item"
      :style="{
        zIndex: 100 + index + (activeIndex === index ? 100 : 0),
        marginRight: `${-146 - index * 20}px`,
        marginBottom: `${-227 - index * 20}px`
      }"
      @click="handleActive(index)"
    >
      <el-image :src="item.imgUrl" fit="contain" class="popover-image">
        <template slot="error">
          <div class="image-error"><svg-icon icon-class="ep:picture" /></div>
        </template>
      </el-image>
      <div class="popover-index">{{ index + 1 }}</div>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/multi-word-component-names */
export default {
  name: 'Popover',
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return { activeIndex: 0 }
  },
  methods: {
    handleActive(index) {
      this.activeIndex = index
    }
  }
}
</script>

<style scoped lang="scss">
.popover-layer {
  display: contents;
}

.popover-item {
  position: absolute;
  right: 50%;
  bottom: 50%;
  width: 292px;
  height: 454px;
  padding: 1px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
}

.popover-image,
.image-error {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
}

.popover-index {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
}
</style>
