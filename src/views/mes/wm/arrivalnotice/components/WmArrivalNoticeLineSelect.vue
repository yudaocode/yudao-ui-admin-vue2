<!-- MES 到货通知单行选择器 -->
<template><div><div
  v-bind="$attrs"
  class="line-select"
  :class="disabled ? 'is-disabled' : 'is-clickable'"
  @click="handleClick"
  @mouseenter="hovering = true"
  @mouseleave="hovering = false"
><el-tooltip
  :disabled="!selectedItem"
  placement="top"
  :open-delay="500"
><div
  v-if="selectedItem"
  slot="content"
  class="tooltip"
><div>物料编码：{{ selectedItem.itemCode }}</div><div>物料名称：{{ selectedItem.itemName }}</div><div>规格型号：{{ selectedItem.specification || '-' }}</div><div>到货数量：{{ selectedItem.arrivalQuantity == null ? '-' : selectedItem.arrivalQuantity }}</div></div><el-input
  :value="displayLabel"
  :placeholder="placeholder"
  :disabled="disabled"
  readonly
  :suffix-icon="suffixIcon"
/></el-tooltip></div><wm-arrival-notice-line-select-dialog
  ref="dialog"
  :notice-id="noticeId"
  @selected="handleSelected"
/></div></template>
<script>
import { WmArrivalNoticeLineApi } from '@/api/mes/wm/arrivalnotice/line'
import WmArrivalNoticeLineSelectDialog from './WmArrivalNoticeLineSelectDialog.vue'
export default {
  name: 'WmArrivalNoticeLineSelect', components: { WmArrivalNoticeLineSelectDialog }, inheritAttrs: false,
  props: { value: Number, modelValue: Number, noticeId: Number, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择到货通知单行' }},
  data() { return { hovering: false, selectedItem: undefined } },
  computed: { currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value }, displayLabel() { return this.selectedItem ? this.selectedItem.itemCode + ' - ' + this.selectedItem.itemName : '' }, showClear() { return this.clearable && !this.disabled && this.hovering && this.currentValue != null }, suffixIcon() { return this.showClear ? 'el-icon-circle-close' : 'el-icon-search' } },
  watch: { currentValue: { immediate: true, handler(value) { this.resolveItemById(value) } }, noticeId() { this.selectedItem = undefined; this.$emit('input', undefined); this.$emit('update:modelValue', undefined); this.$emit('change', undefined) } },
  methods: {
    async resolveItemById(id) { if (id == null) { this.selectedItem = undefined; return } if (this.selectedItem && this.selectedItem.id === id) return; try { this.selectedItem = (await WmArrivalNoticeLineApi.getArrivalNoticeLine(id)).data } catch (error) { console.error('[WmArrivalNoticeLineSelect] resolveItemById failed:', error) } },
    handleClick(event) { if (this.disabled || !this.noticeId) return; if (this.showClear && event.target.closest('.el-input__suffix')) { event.stopPropagation(); this.selectedItem = undefined; this.$emit('input', undefined); this.$emit('update:modelValue', undefined); this.$emit('change', undefined); return } this.$refs.dialog.open(this.currentValue != null ? [this.currentValue] : []) },
    handleSelected(rows) { if (!rows || !rows.length) return; const item = rows[0]; this.selectedItem = item; this.$emit('input', item.id); this.$emit('update:modelValue', item.id); this.$emit('change', item) }
  }
}
</script>
<style scoped>.line-select { width: 100%; }.line-select.is-clickable, .line-select.is-clickable /deep/ .el-input__inner { cursor: pointer; }.line-select.is-disabled, .line-select.is-disabled /deep/ .el-input__inner { cursor: not-allowed; }.tooltip { line-height: 24px; }</style>
