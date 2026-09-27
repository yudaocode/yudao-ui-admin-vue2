<template>
  <el-select
    :value="value"
    clearable
    filterable
    placeholder="请选择用户等级"
    class="member-level-select"
    @input="$emit('input', $event)"
  >
    <el-option v-for="level in levels" :key="level.id" :label="level.name" :value="level.id">
      <span class="level-option">
        <el-avatar v-if="level.icon" :src="level.icon" :size="24" />
        <span>{{ level.name }}</span>
      </span>
    </el-option>
  </el-select>
</template>

<script>
import * as LevelApi from '@/api/member/level'

export default {
  name: 'MemberLevelSelect',
  props: {
    value: { type: [Number, String], default: undefined }
  },
  data() {
    return { levels: [] }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      const response = await LevelApi.getSimpleLevelList()
      this.levels = response.data
    }
  }
}
</script>

<style scoped>
.member-level-select { width: 240px; }
.level-option { display: inline-flex; align-items: center; gap: 8px; }
</style>
