<template>
  <el-cascader
    v-bind="$attrs"
    :value="currentValue"
    :options="categoryTree"
    :props="cascaderProps"
    clearable
    filterable
    :disabled="disabled"
    :placeholder="placeholder"
    class="width-full"
    @input="updateValue"
  />
</template>

<script>
import { handleTree } from '@/utils/ruoyi'
import { ItemCategoryApi } from '@/api/wms/md/item/category'

export default {
  name: 'WmsItemCategorySelect',
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '请选择商品分类' }
  },
  data() {
    return {
      categoryTree: [],
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true,
        emitPath: false
      }
    }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  created() {
    ItemCategoryApi.getItemCategorySimpleList()
      .then((response) => {
        this.categoryTree = handleTree(response.data, 'id', 'parentId')
      })
  },
  methods: {
    updateValue(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    }
  }
}
</script>

<style scoped>
.width-full {
  width: 100%;
}
</style>
