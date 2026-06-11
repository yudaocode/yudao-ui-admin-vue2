<template>
  <el-cascader
    v-model="selectedValue"
    style="width: 100%"
    :options="areaTree"
    :props="cascaderProps"
    :disabled="disabled"
    :placeholder="placeholder"
    :clearable="clearable"
    :show-all-levels="showAllLevels"
    :separator="separator"
    @change="handleChange"
  />
</template>

<script>
import { getAreaTree } from '@/api/system/area'
import { AreaLevelEnum } from '@/utils/constants'

export default {
  name: 'AreaSelect',
  props: {
    value: [String, Number, Array],
    level: {
      type: Number,
      default: AreaLevelEnum.DISTRICT
    },
    disabled: Boolean,
    placeholder: {
      type: String,
      default: '请选择省市区'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    showAllLevels: {
      type: Boolean,
      default: true
    },
    separator: {
      type: String,
      default: '/'
    }
  },
  data() {
    return {
      areaTree: [],
      selectedValue: undefined,
      cascaderProps: {
        label: 'name',
        value: 'id',
        children: 'children',
        checkStrictly: true,
        emitPath: true
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        if (value === undefined || value === null || value === '') {
          this.selectedValue = undefined
        } else {
          this.selectedValue = Array.isArray(value) ? value : [value]
        }
      }
    }
  },
  mounted() {
    this.loadAreaTree()
  },
  methods: {
    async loadAreaTree() {
      try {
        const response = await getAreaTree()
        this.areaTree = this.filterTreeByLevel(response.data || [], this.level)
      } catch (e) {
        this.areaTree = []
      }
    },
    filterTreeByLevel(tree, maxLevel) {
      if (maxLevel <= 0) {
        return []
      }
      return (tree || []).map((node) => {
        const nextNode = { ...node }
        if (maxLevel === 1) {
          delete nextNode.children
        } else if (node.children && node.children.length > 0) {
          nextNode.children = this.filterTreeByLevel(node.children, maxLevel - 1)
        }
        return nextNode
      })
    },
    handleChange(value) {
      this.$emit('input', value === undefined || value === null ? undefined : value)
      this.$emit('change', value)
    }
  }
}
</script>
