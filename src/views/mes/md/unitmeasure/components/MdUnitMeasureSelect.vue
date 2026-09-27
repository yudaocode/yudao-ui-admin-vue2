<!-- MES 计量单位选择器：纯下拉，前端按名称和编码过滤 -->
<template>
  <el-tooltip :disabled="!selectedItem" placement="top" :open-delay="500">
    <div v-if="selectedItem" slot="content" class="unit-tooltip">
      <div>编码：{{ selectedItem.code || '-' }}</div>
      <div>名称：{{ selectedItem.name || '-' }}</div>
      <div>是否主单位：{{ selectedItem.primaryFlag ? '是' : '否' }}</div>
      <div v-if="!selectedItem.primaryFlag && selectedItem.changeRate != null">
        换算比例：{{ selectedItem.changeRate }}
      </div>
      <div v-if="selectedItem.remark">备注：{{ selectedItem.remark }}</div>
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
      @input="updateValue"
      @change="handleChange"
    >
      <el-option v-for="item in filteredList" :key="item.id" :label="item.name" :value="item.id">
        <span>{{ item.name }}</span>
        <el-tag v-if="item.code" size="mini" type="info" class="code-tag">
          编号: {{ item.code }}
        </el-tag>
      </el-option>
    </el-select>
  </el-tooltip>
</template>

<script>
import { MdUnitMeasureApi } from '@/api/mes/md/unitmeasure'

export default {
  name: 'MdUnitMeasureSelect',
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择计量单位' }
  },
  data() {
    return {
      allList: [],
      filteredList: [],
      selectedItem: undefined
    }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  watch: {
    currentValue(value) {
      this.syncSelectedItem(value)
    }
  },
  mounted() {
    this.loadList()
  },
  methods: {
    async loadList() {
      const response = await MdUnitMeasureApi.getUnitMeasureSimpleList()
      this.allList = response.data
      this.filteredList = response.data
      this.syncSelectedItem(this.currentValue)
    },
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
    updateValue(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleChange(value) {
      const item = this.allList.find(unit => unit.id === value)
      this.selectedItem = item
      this.$emit('change', item)
    },
    syncSelectedItem(value) {
      if (value == null) {
        this.selectedItem = undefined
        return
      }
      if (this.allList.length && (!this.selectedItem || this.selectedItem.id !== value)) {
        this.selectedItem = this.allList.find(unit => unit.id === value)
      }
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.unit-tooltip { line-height: 24px; }
.code-tag { margin-left: 8px; }
</style>
