<template>
  <div class="divider" :style="{ height: property.height + 'px' }">
    <div
      class="divider-line"
      :style="{
        borderTopStyle: property.borderType,
        borderTopColor: property.lineColor,
        borderTopWidth: property.lineWidth + 'px',
        margin: property.paddingType === 'none' ? '0' : '0 16px'
      }"
    />
  </div>
</template>

<script>
/* eslint-disable vue/multi-word-component-names */
export default {
  name: 'Divider',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.divider {
  display: flex;
  align-items: center;
}

.divider-line {
  width: 100%;
}
</style>
