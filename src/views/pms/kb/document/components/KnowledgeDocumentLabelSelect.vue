<template>
  <el-select
    :value="value"
    class="knowledge-label-select"
    clearable
    multiple
    :loading="loading"
    placeholder="请选择标签"
    @input="$emit('input', $event)"
  >
    <el-option v-for="label in labelList" :key="label.id" :label="label.name" :value="label.id" />
  </el-select>
</template>

<script>
import * as KnowledgeDocumentLabelApi from '@/api/pms/kb/content/document/label'

export default {
  name: 'PmsKnowledgeDocumentLabelSelect',
  props: {
    value: { type: Array, default: () => [] }
  },
  data() {
    return { loading: false, labelList: [] }
  },
  created() {
    this.getLabelList()
  },
  methods: {
    async getLabelList() {
      this.loading = true
      try {
        const response = await KnowledgeDocumentLabelApi.getKnowledgeDocumentLabelList()
        this.labelList = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.knowledge-label-select {
  width: 100%;
}
</style>
