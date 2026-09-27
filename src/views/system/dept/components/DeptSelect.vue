<template>
  <el-select v-model="innerValue" :multiple="multiple" :disabled="disabled" :clearable="clearable" filterable
             :loading="loading" :placeholder="placeholder" @change="handleChange">
    <el-option v-for="item in deptList" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script>
import { getSimpleDeptList } from '@/api/system/dept'

export default {
  name: 'DeptSelect',
  props: { value: { type: [Number, Array], default: undefined }, modelValue: { type: [Number, Array], default: undefined }, multiple: { type: Boolean, default: false }, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择部门' } },
  data() { return { loading: false, deptList: [], innerValue: this.value !== undefined ? this.value : this.modelValue } },
  created() { this.loading = true; getSimpleDeptList().then(response => { this.deptList = this.flatten(response.data) }).finally(() => { this.loading = false }) },
  watch: { value(value) { this.innerValue = value }, modelValue(value) { if (this.value === undefined) this.innerValue = value } },
  methods: { flatten(nodes) { const result = []; (nodes || []).forEach(node => { result.push(node); if (node.children) result.push(...this.flatten(node.children)) }); return result }, handleChange(value) { this.$emit('input', value); this.$emit('update:modelValue', value); this.$emit('change', value) } }
}
</script>
