<template>
  <div class="floating-action-button-root">
    <div class="fab" :class="property.direction === 'horizontal' ? 'horizontal' : 'vertical'">
      <template v-if="expanded">
        <div v-for="(item, index) in property.list" :key="index" class="fab-item" @click="handleActive">
          <el-image :src="item.imgUrl" fit="contain" class="fab-image">
            <template slot="error">
              <div class="image-error">
                <svg-icon icon-class="ep:picture" :color="item.textColor" />
              </div>
            </template>
          </el-image>
          <span v-if="property.showText" class="fab-text" :style="{ color: item.textColor }">
            {{ item.text }}
          </span>
        </div>
      </template>
      <el-button type="primary" size="medium" circle @click="handleToggleFab">
        <svg-icon icon-class="ep:plus" class-name="fab-icon" :class="{ active: expanded }" />
      </el-button>
    </div>
    <div v-if="expanded" class="modal-bg" @click="handleToggleFab" />
  </div>
</template>

<script>
export default {
  name: 'FloatingActionButton',
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return { expanded: false }
  },
  methods: {
    handleToggleFab() {
      this.expanded = !this.expanded
    },
    handleActive() {
      this.expanded = false
    }
  }
}
</script>

<style scoped lang="scss">
.floating-action-button-root {
  display: contents;
}

.fab {
  position: absolute;
  right: calc(50% - 375px / 2 + 32px);
  bottom: 32px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 12px;
}

.fab.horizontal {
  flex-direction: row;
}

.fab.vertical {
  flex-direction: column;
}

.fab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fab-image {
  width: 27px;
  height: 27px;
}

.image-error {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.fab-text {
  margin-top: 4px;
  font-size: 12px;
}

.modal-bg {
  position: absolute;
  top: 0;
  left: calc(50% - 375px / 2);
  z-index: 11;
  width: 375px;
  height: 100%;
  background-color: rgb(0 0 0 / 40%);
}

::v-deep .fab-icon {
  transform: rotate(0deg);
  transition: transform 0.3s;
}

::v-deep .fab-icon.active {
  transform: rotate(135deg);
}
</style>
