<template>
  <el-input v-model="inputValue" v-bind="$attrs">
    <el-color-picker slot="append" v-model="colorValue" :predefine="PREDEFINE_COLORS" />
  </el-input>
</template>

<script>
import { PREDEFINE_COLORS } from '@/utils/color'

export default {
  name: 'InputWithColor',
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    }
  },
  data() {
    return { PREDEFINE_COLORS }
  },
  computed: {
    inputValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    colorValue: {
      get() {
        return this.color
      },
      set(value) {
        this.$emit('update:color', value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-input-group__append {
  padding: 0;
}

::v-deep .el-input-group__append .el-color-picker__trigger {
  padding: 0;
  border-left: none;
  border-radius: 0 4px 4px 0;
}
</style>
