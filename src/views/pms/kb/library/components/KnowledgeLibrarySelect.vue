<template>
  <el-select
    :value="value"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :loading="loading"
    :multiple="multiple"
    :placeholder="placeholder"
    collapse-tags
    @input="handleChange"
  >
    <el-option
      v-for="library in libraryList"
      :key="library.id"
      :label="library.name"
      :value="library.id"
    />
  </el-select>
</template>

<script>
import * as KnowledgeLibraryApi from '@/api/pms/kb/library'
import { getAllPageItems } from '@/utils/page'

export default {
  name: 'PmsKnowledgeLibrarySelect',
  props: {
    value: { type: [Number, Array], default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择知识库' }
  },
  data() {
    return {
      loading: false,
      libraryList: []
    }
  },
  created() {
    this.getKnowledgeLibraryList()
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)
    },
    async getKnowledgeLibraryList() {
      this.loading = true
      try {
        this.libraryList = await getAllPageItems((pageNo, pageSize) =>
          KnowledgeLibraryApi.getKnowledgeLibraryPage({ pageNo, pageSize })
        )
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
