<template>
  <div class="title-bar" :style="{ height: property.height + 'px' }">
    <el-image v-if="property.bgImgUrl" :src="property.bgImgUrl" fit="cover" class="background-image" />
    <div class="title-content">
      <div
        v-if="property.title"
        :style="{
          fontSize: property.titleSize + 'px',
          fontWeight: property.titleWeight,
          color: property.titleColor,
          textAlign: property.textAlign,
          marginLeft: property.marginLeft + 'px',
          marginBottom: '4px'
        }"
      >
        {{ property.title }}
      </div>
      <div
        v-if="property.description"
        :style="{
          fontSize: property.descriptionSize + 'px',
          fontWeight: property.descriptionWeight,
          color: property.descriptionColor,
          textAlign: property.textAlign,
          marginLeft: property.marginLeft + 'px'
        }"
      >
        {{ property.description }}
      </div>
    </div>
    <div v-show="property.more.show" class="more" :style="{ color: property.descriptionColor }">
      <span v-if="property.more.type !== 'icon'">{{ property.more.text }}</span>
      <svg-icon v-if="property.more.type !== 'text'" icon-class="ep:arrow-right" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleBar',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.title-bar {
  position: relative;
  width: 100%;
  min-height: 20px;
  box-sizing: border-box;
}

.background-image {
  width: 100%;
}

.title-content {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
}

.more {
  position: absolute;
  top: 0;
  right: 8px;
  bottom: 0;
  display: flex;
  margin: auto;
  font-size: 10px;
  color: #969799;
  align-items: center;
  justify-content: center;
}
</style>
