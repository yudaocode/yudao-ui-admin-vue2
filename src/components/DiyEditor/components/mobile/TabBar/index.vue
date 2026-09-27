<template>
  <div class="tab-bar">
    <div class="tab-bar-bg" :style="backgroundStyle">
      <div v-for="(item, index) in property.items" :key="index" class="tab-bar-item">
        <el-image :src="index === 0 ? item.activeIconUrl : item.iconUrl">
          <template slot="error">
            <div class="image-error"><svg-icon icon-class="ep:picture" /></div>
          </template>
        </el-image>
        <span :style="{ color: index === 0 ? property.style.activeColor : property.style.color }">
          {{ item.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    property: { type: Object, required: true }
  },
  computed: {
    backgroundStyle() {
      return {
        background:
          this.property.style.bgType === 'color'
            ? this.property.style.bgColor
            : `url(${this.property.style.bgImg})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  z-index: 2;
  width: 100%;
}

.tab-bar-bg {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
}

.tab-bar-item {
  display: flex;
  width: 100%;
  font-size: 12px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tab-bar-item ::v-deep img,
.tab-bar-item .el-icon {
  width: 26px;
  height: 26px;
  border-radius: 4px;
}

.image-error {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}
</style>
