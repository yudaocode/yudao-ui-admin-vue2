<template>
  <div class="menu-grid">
    <div
      v-for="(item, index) in property.list"
      :key="index"
      class="menu-grid-item"
      :style="{ width: `${100 * (1 / property.column)}%` }"
    >
      <span
        v-if="item.badge && item.badge.show"
        class="menu-grid-badge"
        :style="{ color: item.badge.textColor, backgroundColor: item.badge.bgColor }"
      >
        {{ item.badge.text }}
      </span>
      <el-image v-if="item.iconUrl" class="menu-grid-icon" :src="item.iconUrl" />
      <span class="menu-grid-title" :style="{ color: item.titleColor }">{{ item.title }}</span>
      <span class="menu-grid-subtitle" :style="{ color: item.subtitleColor }">
        {{ item.subtitle }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuGrid',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.menu-grid {
  display: flex;
  flex-flow: row wrap;
}

.menu-grid-item {
  position: relative;
  display: flex;
  padding-top: 20px;
  padding-bottom: 14px;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.menu-grid-badge {
  position: absolute;
  top: 10px;
  left: 50%;
  z-index: 1;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}

.menu-grid-icon {
  width: 28px;
  height: 28px;
}

.menu-grid-title {
  height: 16px;
  margin-top: 8px;
  font-size: 12px;
  line-height: 16px;
}

.menu-grid-subtitle {
  height: 12px;
  margin-top: 6px;
  font-size: 10px;
  line-height: 12px;
}
</style>
