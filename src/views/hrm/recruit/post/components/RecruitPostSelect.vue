<template>
  <el-select
    :value="value"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :loading="loading"
    :placeholder="placeholder"
    class="full-width"
    @input="$emit('input', $event)"
    @change="handleChange"
  >
    <el-option
      v-for="post in postOptions"
      :key="post.id"
      :label="formatPostLabel(post)"
      :value="post.id"
    />
  </el-select>
</template>

<script>
import { getRecruitPost, getRecruitPostSimpleList } from '@/api/hrm/recruit/post'

export default {
  name: 'HrmRecruitPostSelect',
  props: {
    value: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择招聘职位' }
  },
  data() {
    return { postList: [], selectedPost: undefined, loading: false }
  },
  computed: {
    postOptions() {
      const options = this.postList.filter(post => post.id !== undefined)
      const current = this.selectedPost
      if (!current || current.id === undefined || options.some(post => post.id === current.id)) return options
      return [current, ...options]
    }
  },
  watch: {
    value() { this.ensureSelectedPost() }
  },
  created() { this.getPostList() },
  methods: {
    formatPostLabel(post) {
      return post.deptName ? `${post.postName}（${post.deptName}）` : post.postName
    },
    async ensureSelectedPost() {
      const postId = this.value
      this.selectedPost = undefined
      if (postId === undefined || this.postList.some(post => post.id === postId)) return
      const response = await getRecruitPost(postId)
      if (this.value === postId && response.data && response.data.id === postId) {
        this.selectedPost = response.data
      }
    },
    handleChange(value) {
      this.$emit('change', this.postOptions.find(post => post.id === value))
    },
    async getPostList() {
      this.loading = true
      try {
        const response = await getRecruitPostSimpleList()
        this.postList = response.data
        await this.ensureSelectedPost()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
