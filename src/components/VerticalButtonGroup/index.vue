<template>
  <el-button-group v-bind="$attrs">
    <slot />
  </el-button-group>
</template>

<script>
export default {
  name: 'VerticalButtonGroup',
  inheritAttrs: false
}
</script>

<style lang="scss" scoped>
.el-button-group {
  display: inline-flex;
  flex-direction: column;
}

.el-button-group > ::v-deep .el-button:first-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.el-button-group > ::v-deep .el-button:last-child {
  border-top-right-radius: 0;
  border-bottom-left-radius: 4px;
  border-top-left-radius: 0;
}

.el-button-group > ::v-deep .el-button:not(:last-child) {
  margin-right: 0;
  margin-bottom: -1px;
}
</style>
