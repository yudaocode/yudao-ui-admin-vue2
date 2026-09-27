<!-- MES 车间选择器：纯下拉，前端按名称和编码过滤 -->
<template>
  <el-tooltip
    :disabled="!selectedItem"
    placement="top"
    :open-delay="500"
  >
    <div
      v-if="selectedItem"
      slot="content"
      class="workshop-tooltip"
    >
      <div>编码：{{ selectedItem.code || '-' }}</div>
      <div>名称：{{ selectedItem.name || '-' }}</div>
      <div>面积：{{ selectedItem.area != null ? selectedItem.area + ' ㎡' : '-' }}</div>
      <div>负责人：{{ selectedItem.chargeUserName || '-' }}</div>
    </div>
    <el-select
      v-bind="$attrs"
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
        :label="item.name"
        :value="item.id"
      >
        <span>{{ item.name }}</span>
        <el-tag
          v-if="item.code"
          size="mini"
          type="info"
          class="workshop-code"
        >编号: {{ item.code }}</el-tag>
      </el-option>
    </el-select>
  </el-tooltip>
</template>

<script>
import { MdWorkshopApi } from '@/api/mes/md/workstation/workshop'

export default {
  name: 'MdWorkshopSelect',
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined },
    modelValue: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择车间' }
  },
  data() {
    return { allList: [], filteredList: [], selectedItem: undefined }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  watch: {
    currentValue(value) {
      if (value == null) {
        this.selectedItem = undefined
      } else if ((!this.selectedItem || this.selectedItem.id !== value) && this.allList.length > 0) {
        this.selectedItem = this.allList.find(item => item.id === value)
      }
    }
  },
  async mounted() {
    const response = await MdWorkshopApi.getWorkshopSimpleList()
    this.allList = response.data
    this.filteredList = this.allList
    if (this.currentValue != null) this.selectedItem = this.allList.find(item => item.id === this.currentValue)
  },
  methods: {
    handleFilter(query) {
      if (!query) {
        this.filteredList = this.allList
        return
      }
      const keyword = query.toLowerCase()
      this.filteredList = this.allList.filter(item =>
        (item.name && item.name.toLowerCase().includes(keyword)) ||
        (item.code && item.code.toLowerCase().includes(keyword))
      )
    },
    handleInput(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleChange(value) {
      const item = this.allList.find(option => option.id === value)
      this.selectedItem = item
      this.$emit('change', item)
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.workshop-tooltip { line-height: 24px; }
.workshop-code { margin-left: 8px; }
</style>
