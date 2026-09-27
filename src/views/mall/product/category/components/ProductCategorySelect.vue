<template>
  <Treeselect
    v-model="selectCategoryId"
    :options="categoryList"
    :multiple="multiple"
    value-consists-of="LEAF_PRIORITY"
    :disable-branch-nodes="!multiple"
    :clearable="false"
    :show-count="multiple"
    :normalizer="normalizer"
    class="w-1/1"
    placeholder="请选择商品分类"
  />
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { handleTree } from '@/utils/ruoyi'
import { getCategoryList } from '@/api/mall/product/category'

export default {
  name: 'ProductCategorySelect',
  components: {
    Treeselect
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: [Number, Array],
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    },
    parentId: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      categoryList: []
    }
  },
  computed: {
    selectCategoryId: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  created() {
    const params = {}
    if (this.parentId !== undefined && this.parentId !== null) {
      params.parentId = this.parentId
    }
    return getCategoryList(params).then((response) => {
      this.categoryList = handleTree(response.data, 'id', 'parentId')
    })
  },
  methods: {
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    }
  }
}
</script>
