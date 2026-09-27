<template>
  <el-input v-model="color">
    <el-color-picker slot="prepend" v-model="color" :predefine="PREDEFINE_COLORS" />
  </el-input>
</template>

<script>
import { PREDEFINE_COLORS } from '@/utils/color'

export default {
  name: 'ColorInput',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return { PREDEFINE_COLORS }
  },
  computed: {
    color: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-input-group__prepend {
  padding: 0;
}
</style>
