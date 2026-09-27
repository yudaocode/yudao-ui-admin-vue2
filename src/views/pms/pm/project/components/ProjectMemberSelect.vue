<template>
  <el-tooltip :disabled="!multiple || selectedNames.length < 2" :content="selectedNames.join('、')" placement="top">
    <el-select :value="modelValue" clearable :collapse-tags="multiple" filterable :loading="loading"
      :multiple="multiple" :placeholder="placeholder" @input="$emit('update:modelValue', $event)"
      @blur="$emit('blur', $event)" @keyup.esc.native.capture.stop="$emit('keyup', $event)">
      <el-option v-for="member in memberList" :key="member.userId" :label="member.nickname" :value="member.userId" />
    </el-select>
  </el-tooltip>
</template>

<script>
import * as ProjectMemberApi from '@/api/pms/pm/project/member'

export default {
  name: 'PmsProjectMemberSelect',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: [Number, Array], default: undefined },
    projectId: { type: Number, required: true },
    placeholder: { type: String, default: '请选择项目成员' },
    multiple: { type: Boolean, default: false }
  },
  data() { return { loading: false, memberList: [] } },
  computed: {
    selectedNames() {
      const ids = Array.isArray(this.modelValue) ? this.modelValue : [this.modelValue]
      return this.memberList.filter(member => ids.includes(member.userId)).map(member => member.nickname)
    }
  },
  watch: { projectId: { immediate: true, handler: 'getProjectMemberList' } },
  methods: {
    async getProjectMemberList() {
      this.loading = true
      try {
        const response = await ProjectMemberApi.getProjectMemberList(this.projectId)
        this.memberList = response.data
        this.$emit('loaded', this.memberList)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
