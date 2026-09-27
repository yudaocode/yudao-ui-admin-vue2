<!-- MES 物料产品选择器：只读输入框 + 弹窗单选 -->
<template>
  <div>
    <div
      v-bind="$attrs"
      class="item-select"
      :class="disabled ? 'is-disabled' : 'is-clickable'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip
        :disabled="!selectedItem"
        placement="top"
        :open-delay="500"
      >
        <div
          v-if="selectedItem"
          slot="content"
          class="tooltip"
        ><div>编码：{{ selectedItem.code }}</div><div>名称：{{ selectedItem.name }}</div><div>规格：{{ selectedItem.specification || '-' }}</div><div>单位：{{ selectedItem.unitMeasureName || '-' }}</div></div>
        <el-input
          :value="displayLabel"
          :placeholder="placeholder"
          :disabled="disabled"
          readonly
          :suffix-icon="suffixIcon"
        />
      </el-tooltip>
    </div>
    <md-item-select-dialog
      ref="dialog"
      :multiple="false"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import { MdItemApi } from '@/api/mes/md/item'
import MdItemSelectDialog from './MdItemSelectDialog.vue'

export default {
  name: 'MdItemSelect',
  components: { MdItemSelectDialog },
  inheritAttrs: false,
  props: { value: Number, modelValue: Number, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择产品物料' }},
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
    },
    suffixIcon() {
      return this.showClear ? 'el-icon-circle-close' : 'el-icon-search'
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
        this.selectedItem = (await MdItemApi.getItem(id)).data
      } catch (error) {
        console.error('[MdItemSelect] resolveItemById failed:', error)
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
.item-select { width: 100%; }
.item-select.is-clickable, .item-select.is-clickable /deep/ .el-input__inner { cursor: pointer; }
.item-select.is-disabled, .item-select.is-disabled /deep/ .el-input__inner { cursor: not-allowed; }
.tooltip { line-height: 24px; }
</style>
