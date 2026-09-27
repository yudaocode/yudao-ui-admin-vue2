<template>
  <el-select
    :value="value"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :placeholder="placeholder"
    :loading="loading"
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="category in categoriesOption"
      :key="category.id"
      :label="category.name"
      :value="category.id"
    />
  </el-select>
</template>

<script>
import * as NoteCategoryApi from '@/api/oa/note/category'

export default {
  name: 'OaNoteCategorySelect',
  props: {
    value: {
      type: Number,
      default: undefined
    },
    categories: {
      type: Array,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请选择分类'
    }
  },
  data() {
    return {
      categoryList: [],
      loading: false
    }
  },
  computed: {
    categoriesOption() {
      return this.categories !== undefined ? this.categories : this.categoryList
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    /** 选中变化 */
    handleChange(value) {
      this.$emit('input', typeof value === 'number' ? value : undefined)
    },
    /** 查询分类列表 */
    getCategoryList() {
      // 已有分类列表时直接复用，避免重复请求
      if (this.categories !== undefined) return Promise.resolve()
      this.loading = true
      return NoteCategoryApi.getSimpleNoteCategoryList().then(response => {
        this.categoryList = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
