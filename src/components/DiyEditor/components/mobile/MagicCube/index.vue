<template>
  <div
    class="magic-cube"
    :style="{
      height: rowCount * CUBE_SIZE + 'px',
      width: 4 * CUBE_SIZE + 'px',
      padding: property.space + 'px'
    }"
  >
    <div
      v-for="(item, index) in property.list"
      :key="index"
      class="magic-cube-item"
      :style="{
        width: item.width * CUBE_SIZE - property.space + 'px',
        height: item.height * CUBE_SIZE - property.space + 'px',
        top: item.top * CUBE_SIZE + 'px',
        left: item.left * CUBE_SIZE + 'px'
      }"
    >
      <el-image class="magic-cube-image" fit="cover" :src="item.imgUrl" :style="imageStyle">
        <template slot="error">
          <div class="image-slot">
            <div
              class="image-error"
              :style="{ width: item.width * CUBE_SIZE + 'px', height: item.height * CUBE_SIZE + 'px' }"
            >
              <svg-icon icon-class="ep:picture" color="gray" :size="CUBE_SIZE" />
            </div>
          </div>
        </template>
      </el-image>
    </div>
  </div>
</template>

<script>
const CUBE_SIZE = 93.75

export default {
  name: 'MagicCube',
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return { CUBE_SIZE }
  },
  computed: {
    rowCount() {
      let count = 0
      if (this.property.list.length > 0) {
        count = Math.max(...this.property.list.map(item => item.top + item.height))
      }
      return count === 0 ? 1 : count
    },
    imageStyle() {
      return {
        borderTopLeftRadius: this.property.borderRadiusTop + 'px',
        borderTopRightRadius: this.property.borderRadiusTop + 'px',
        borderBottomLeftRadius: this.property.borderRadiusBottom + 'px',
        borderBottomRightRadius: this.property.borderRadiusBottom + 'px'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.magic-cube {
  position: relative;
  box-sizing: border-box;
}

.magic-cube-item {
  position: absolute;
}

.magic-cube-image,
.image-error {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
