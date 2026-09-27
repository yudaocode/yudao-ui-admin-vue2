<!-- MES 安灯配置选择器 -->
<template>
  <el-select
    :value="currentValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    filterable
    :filter-method="handleFilter"
    class="full-width"
    @input="handleInput"
    @change="handleChange"
  >
    <el-option
      v-for="item in filteredList"
      :key="item.id"
      :label="item.reason"
      :value="item.id"
    ><span>{{ item.reason }}</span><dict-tag
      :type="DICT_TYPE.MES_PRO_ANDON_LEVEL"
      :value="item.level"
    /></el-option>
  </el-select>
</template>

<script>
import { ProAndonConfigApi } from '@/api/mes/pro/andon/config'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'AndonConfigSelect',
  props: { value: Number, modelValue: Number, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择呼叫原因' }},
  data() { return { DICT_TYPE, allList: [], filteredList: [] } },
  computed: { currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value } },
  async mounted() { const response = await ProAndonConfigApi.getAndonConfigList(); this.allList = response.data; this.filteredList = this.allList },
  methods: {
    handleFilter(query) { if (!query) { this.filteredList = this.allList; return } const keyword = query.toLowerCase(); this.filteredList = this.allList.filter(item => item.reason && item.reason.toLowerCase().includes(keyword)) },
    handleInput(value) { this.$emit('input', value); this.$emit('update:modelValue', value) },
    handleChange(value) { this.$emit('change', this.allList.find(item => item.id === value)) }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
