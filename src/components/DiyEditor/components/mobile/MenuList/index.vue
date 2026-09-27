<template>
  <div class="menu-list">
    <div v-for="(item, index) in property.list" :key="index" class="menu-list-item">
      <div class="menu-list-main">
        <el-image v-if="item.iconUrl" class="menu-list-icon" :src="item.iconUrl" />
        <span class="menu-list-title" :style="{ color: item.titleColor }">{{ item.title }}</span>
      </div>
      <div class="menu-list-aside">
        <span class="menu-list-subtitle" :style="{ color: item.subtitleColor }">
          {{ item.subtitle }}
        </span>
        <svg-icon icon-class="ep:arrow-right" color="#000" :size="16" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuList',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.menu-list {
  display: flex;
  min-height: 42px;
  flex-direction: column;
}

.menu-list-item {
  display: flex;
  height: 42px;
  padding: 0 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.menu-list-item + .menu-list-item {
  border-top: 1px solid #eee;
}

.menu-list-main,
.menu-list-aside {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.menu-list-main {
  flex: 1;
  gap: 8px;
}

.menu-list-aside {
  justify-content: center;
  gap: 4px;
}

.menu-list-icon {
  width: 16px;
  height: 16px;
}

.menu-list-title {
  font-size: 16px;
}

.menu-list-subtitle {
  font-size: 12px;
}
</style>
