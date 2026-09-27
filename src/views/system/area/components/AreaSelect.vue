<template>
  <el-cascader
    v-model="innerValue"
    v-loading="loading"
    :options="areaTree"
    :props="cascaderProps"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :placeholder="placeholder"
    :show-all-levels="showAllLevels"
    @change="handleChange"
  />
</template>

<script>
import { getAreaTree } from '@/api/system/area'
import { defaultProps } from '@/utils/tree'

export default {
  name: 'AreaSelect',
  props: {
    value: { type: [Number, String], default: undefined },
    modelValue: { type: [Number, String], default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    checkStrictly: { type: Boolean, default: false },
    showAllLevels: { type: Boolean, default: true },
    selectableLevels: { type: Array, default: undefined },
    placeholder: { type: String, default: '请选择地区' }
  },
  data() {
    return { loading: false, areaTree: [], innerValue: this.value !== undefined ? this.value : this.modelValue }
  },
  computed: {
    cascaderProps() {
      return {
        ...defaultProps,
        checkStrictly: this.checkStrictly,
        ...(this.selectableLevels
          ? { disabled: (data, node) => !this.selectableLevels.includes(node.level) }
          : {}),
        emitPath: false
      }
    }
  },
  watch: {
    value(value) { this.innerValue = value },
    modelValue(value) { if (this.value === undefined) this.innerValue = value }
  },
  created() { this.getAreaTree() },
  methods: {
    async getAreaTree() {
      this.loading = true
      try {
        const response = await getAreaTree()
        this.areaTree = response.data
      } finally {
        this.loading = false
      }
    },
    handleChange(value) {
      const next = typeof value === 'number' ? value : (Array.isArray(value) ? value[value.length - 1] : value)
      this.$emit('input', next)
      this.$emit('update:modelValue', next)
      this.$emit('change', next)
    }
  }
}
</script>
