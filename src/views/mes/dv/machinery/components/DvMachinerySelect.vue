<!-- MES 设备选择器 -->
<template>
  <div class="dv-machinery-select">
    <div
      v-bind="$attrs"
      :class="disabled ? 'is-disabled' : 'is-clickable'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip :disabled="!selectedItem" placement="top" :open-delay="500">
        <div v-if="selectedItem" slot="content" class="machinery-tooltip">
          <div>设备编码：{{ selectedItem.code }}</div>
          <div>设备名称：{{ selectedItem.name }}</div>
          <div v-if="selectedItem.brand">品牌：{{ selectedItem.brand }}</div>
          <div v-if="selectedItem.specification">规格型号：{{ selectedItem.specification }}</div>
        </div>
        <el-input :value="displayLabel" :placeholder="placeholder" :disabled="disabled" readonly>
          <i slot="suffix" :class="showClear ? 'el-icon-circle-close' : 'el-icon-search'" />
        </el-input>
      </el-tooltip>
    </div>
    <dv-machinery-select-dialog ref="dialog" :multiple="false" @selected="handleSelected" />
  </div>
</template>

<script>
import { DvMachineryApi } from '@/api/mes/dv/machinery'
import DvMachinerySelectDialog from './DvMachinerySelectDialog.vue'

export default {
  name: 'DvMachinerySelect',
  components: { DvMachinerySelectDialog },
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择设备' }
  },
  data() {
    return { hovering: false, selectedItem: undefined }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    displayLabel() {
      return this.selectedItem ? this.selectedItem.name : ''
    },
    showClear() {
      return this.clearable && !this.disabled && this.hovering && this.currentValue != null
    }
  },
  watch: {
    currentValue: { immediate: true, handler(value) { this.resolveItemById(value) } }
  },
  methods: {
    async resolveItemById(id) {
      if (id == null) {
        this.selectedItem = undefined
        return
      }
      if (this.selectedItem && this.selectedItem.id === id) return
      try {
        const response = await DvMachineryApi.getMachinery(id)
        this.selectedItem = response.data
      } catch (error) {
        console.error('[DvMachinerySelect] resolveItemById failed:', error)
      }
    },
    handleClick(event) {
      if (this.disabled) return
      if (this.showClear && event.target.closest('.el-input__suffix')) {
        event.stopPropagation()
        this.selectedItem = undefined
        this.$emit('input', undefined)
        this.$emit('update:modelValue', undefined)
        this.$emit('change', undefined)
        return
      }
      this.$refs.dialog.open(this.currentValue != null ? [this.currentValue] : [])
    },
    handleSelected(rows) {
      if (!rows || rows.length === 0) return
      const item = rows[0]
      this.selectedItem = item
      this.$emit('input', item.id)
      this.$emit('update:modelValue', item.id)
      this.$emit('change', item)
    }
  }
}
</script>

<style scoped>
.dv-machinery-select { width: 100%; }
.is-clickable { cursor: pointer; }
.is-disabled { cursor: not-allowed; }
.machinery-tooltip { line-height: 24px; }
</style>
