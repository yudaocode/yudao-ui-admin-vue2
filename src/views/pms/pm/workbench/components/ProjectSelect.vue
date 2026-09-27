<template>
  <el-select
    :value="modelValue"
    class="project-select"
    clearable
    filterable
    placeholder="项目筛选"
    @change="handleChange"
  >
    <el-option
      v-for="project in projectList"
      :key="project.id"
      :label="project.name"
      :value="project.id"
    />
  </el-select>
</template>

<script>
import * as ProjectApi from '@/api/pms/pm/project'
import { getAllPageItems } from '@/utils/page'

export default {
  name: 'PmsProjectSelect',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Number, default: undefined }
  },
  data() {
    return { projectList: [] }
  },
  mounted() {
    this.getProjectList()
  },
  methods: {
    handleChange(value) {
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    async getProjectList() {
      this.projectList = await getAllPageItems((pageNo, pageSize) =>
        ProjectApi.getProjectPage({ pageNo, pageSize })
      )
    }
  }
}
</script>

<style scoped>
.project-select { width: 240px; }
</style>
