<template>
  <el-tooltip :disabled="!multiple || selectedNames.length < 2" :content="selectedNames.join('、')" placement="top">
    <el-select :value="modelValue" clearable :collapse-tags="multiple" filterable :loading="loading"
      :multiple="multiple" :placeholder="placeholder" @input="$emit('update:modelValue', $event)"
      @blur="$emit('blur', $event)" @keyup.esc.native.capture.stop="$emit('keyup', $event)">
      <el-option v-for="iteration in iterationList" :key="iteration.id" :label="iteration.name" :value="iteration.id" />
    </el-select>
  </el-tooltip>
</template>

<script>
import * as IterationApi from '@/api/pms/pm/iteration'
import { getAllPageItems } from '@/utils/page'

export default {
  name: 'PmsIterationSelect',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: [Number, Array], default: undefined },
    projectId: { type: Number, required: true },
    placeholder: { type: String, default: '请选择迭代' },
    multiple: { type: Boolean, default: false }
  },
  data() { return { loading: false, iterationList: [] } },
  computed: {
    selectedNames() {
      const ids = Array.isArray(this.modelValue) ? this.modelValue : [this.modelValue]
      return this.iterationList.filter(iteration => ids.includes(iteration.id)).map(iteration => iteration.name)
    }
  },
  watch: { projectId: { immediate: true, handler: 'getIterationList' } },
  methods: {
    async getIterationList() {
      this.loading = true
      try {
        this.iterationList = await getAllPageItems((pageNo, pageSize) =>
          IterationApi.getIterationPage({ pageNo, pageSize, projectId: this.projectId })
        )
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
