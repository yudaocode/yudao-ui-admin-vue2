<template>
  <el-select
    :value="value"
    clearable
    filterable
    placeholder="请选择用户分组"
    class="member-group-select"
    @input="$emit('input', $event)"
  >
    <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
  </el-select>
</template>

<script>
import * as GroupApi from '@/api/member/group'

export default {
  name: 'MemberGroupSelect',
  props: {
    value: { type: [Number, String], default: undefined }
  },
  data() {
    return { groups: [] }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      const response = await GroupApi.getSimpleGroupList()
      this.groups = response.data
    }
  }
}
</script>

<style scoped>
.member-group-select { width: 240px; }
</style>
