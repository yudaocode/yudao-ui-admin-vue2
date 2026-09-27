<!-- MES 到货通知单选择器 -->
<template>
  <div>
    <div
      v-bind="$attrs"
      class="notice-select"
      :class="disabled ? 'is-disabled' : 'is-clickable'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip
        :disabled="!selectedItem"
        placement="top"
        :open-delay="500"
      ><div
        v-if="selectedItem"
        slot="content"
        class="tooltip"
      ><div>编号：{{ selectedItem.code }}</div><div>名称：{{ selectedItem.name || '-' }}</div><div>供应商：{{ selectedItem.vendorName || '-' }}</div><div>采购订单：{{ selectedItem.purchaseOrderCode || '-' }}</div></div><el-input
        :value="displayLabel"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        :suffix-icon="suffixIcon"
      /></el-tooltip>
    </div>
    <wm-arrival-notice-select-dialog
      ref="dialog"
      :multiple="false"
      :status="status"
      @selected="handleSelected"
    />
  </div>
</template>
<script>
import { WmArrivalNoticeApi } from '@/api/mes/wm/arrivalnotice'
import WmArrivalNoticeSelectDialog from './WmArrivalNoticeSelectDialog.vue'
export default {
  name: 'WmArrivalNoticeSelect', components: { WmArrivalNoticeSelectDialog }, inheritAttrs: false,
  props: { value: Number, modelValue: Number, status: Number, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择到货通知单' }},
  data() { return { hovering: false, selectedItem: undefined } },
  computed: { currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value }, displayLabel() { return this.selectedItem ? this.selectedItem.code : '' }, showClear() { return this.clearable && !this.disabled && this.hovering && this.currentValue != null }, suffixIcon() { return this.showClear ? 'el-icon-circle-close' : 'el-icon-search' } },
  watch: { currentValue: { immediate: true, handler(value) { this.resolveItemById(value) } }},
  methods: {
    async resolveItemById(id) { if (id == null) { this.selectedItem = undefined; return } if (this.selectedItem && this.selectedItem.id === id) return; try { this.selectedItem = (await WmArrivalNoticeApi.getArrivalNotice(id)).data } catch (error) { console.error('[WmArrivalNoticeSelect] resolveItemById failed:', error) } },
    handleClick(event) { if (this.disabled) return; if (this.showClear && event.target.closest('.el-input__suffix')) { event.stopPropagation(); this.selectedItem = undefined; this.$emit('input', undefined); this.$emit('update:modelValue', undefined); this.$emit('change', undefined); return } this.$refs.dialog.open(this.currentValue != null ? [this.currentValue] : []) },
    handleSelected(rows) { if (!rows || rows.length === 0) return; const item = rows[0]; this.selectedItem = item; this.$emit('input', item.id); this.$emit('update:modelValue', item.id); this.$emit('change', item) }
  }
}
</script>
<style scoped>.notice-select { width: 100%; }.notice-select.is-clickable, .notice-select.is-clickable /deep/ .el-input__inner { cursor: pointer; }.notice-select.is-disabled, .notice-select.is-disabled /deep/ .el-input__inner { cursor: not-allowed; }.tooltip { line-height: 24px; }</style>
