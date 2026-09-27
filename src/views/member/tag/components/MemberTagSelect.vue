<template>
  <span class="member-select member-tag-select">
    <el-select
      :value="value"
      multiple
      collapse-tags
      clearable
      filterable
      placeholder="请选择用户标签"
      class="member-select-control"
      @input="$emit('input', $event)"
    >
      <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
    </el-select>
    <el-button
      v-if="showAdd"
      v-hasPermi="['member:tag:create']"
      type="text"
      class="member-select-add"
      @click="openForm('create')"
    >新增标签</el-button>
    <tag-form ref="form" @success="getList" />
  </span>
</template>

<script>
import * as TagApi from '@/api/member/tag'
import TagForm from '@/views/member/tag/TagForm.vue'

export default {
  name: 'MemberTagSelect',
  components: { TagForm },
  props: {
    value: { type: Array, default: () => [] },
    showAdd: { type: Boolean, default: false }
  },
  data() {
    return { tags: [] }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      const response = await TagApi.getSimpleTagList()
      this.tags = response.data
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    }
  }
}
</script>

<style scoped>
.member-select { display: inline-flex; align-items: center; }
.member-select-control { width: 240px; }
.member-select-add { margin-left: 8px; }
</style>
