<!-- MES 供应商选择器：只读输入框 + 点击弹窗选择 -->
<template>
  <div>
    <div
      v-bind="$attrs"
      class="vendor-select"
      :class="disabled ? 'is-disabled' : 'is-clickable'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip :disabled="!selectedItem" placement="top" :open-delay="500">
        <div v-if="selectedItem" slot="content" class="vendor-tooltip">
          <div>编码：{{ selectedItem.code }}</div>
          <div>名称：{{ selectedItem.name }}</div>
          <div>简称：{{ selectedItem.nickname || '-' }}</div>
          <div>电话：{{ selectedItem.telephone || '-' }}</div>
        </div>
        <el-input :value="displayLabel" :placeholder="placeholder" :disabled="disabled" readonly :suffix-icon="suffixIcon" />
      </el-tooltip>
    </div>
    <md-vendor-select-dialog ref="dialog" :multiple="false" @selected="handleSelected" />
  </div>
</template>

<script>
import { MdVendorApi } from '@/api/mes/md/vendor'
import MdVendorSelectDialog from './MdVendorSelectDialog.vue'

export default {
  name: 'MdVendorSelect',
  inheritAttrs: false,
  components: { MdVendorSelectDialog },
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择供应商' }
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
    },
    suffixIcon() {
      return this.showClear ? 'el-icon-circle-close' : 'el-icon-search'
    }
  },
  watch: {
    currentValue: {
      immediate: true,
      handler(value) {
        this.resolveItemById(value)
      }
    }
  },
  methods: {
    async resolveItemById(id) {
      if (id == null) {
        this.selectedItem = undefined
        return
      }
      if (this.selectedItem && this.selectedItem.id === id) return
      try {
        this.selectedItem = (await MdVendorApi.getVendor(id)).data
      } catch (error) {
        console.error('[MdVendorSelect] resolveItemById failed:', error)
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
.vendor-select { width: 100%; }
.vendor-select.is-clickable, .vendor-select.is-clickable /deep/ .el-input__inner { cursor: pointer; }
.vendor-select.is-disabled, .vendor-select.is-disabled /deep/ .el-input__inner { cursor: not-allowed; }
.vendor-tooltip { line-height: 24px; }
</style>
