<!-- MES 流转卡选择器 -->
<template>
  <div class="pro-card-select"><div
    v-bind="$attrs"
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
    class="card-tooltip"
  ><div>流转卡编号：{{ selectedItem.code }}</div><div>生产工单：{{ selectedItem.workOrderCode || '-' }}</div><div>产品：{{ selectedItem.itemName || '-' }}</div><div>批次号：{{ selectedItem.batchCode || '-' }}</div></div><el-input
    :value="displayLabel"
    :placeholder="placeholder"
    :disabled="disabled"
    readonly
  ><i
    slot="suffix"
    :class="showClear ? 'el-icon-circle-close' : 'el-icon-search'"
  /></el-input></el-tooltip></div><pro-card-select-dialog
    ref="dialog"
    :multiple="false"
    @selected="handleSelected"
  /></div>
</template>

<script>
import { ProCardApi } from '@/api/mes/pro/card'
import ProCardSelectDialog from './ProCardSelectDialog.vue'

export default {
  name: 'ProCardSelect', components: { ProCardSelectDialog }, inheritAttrs: false,
  props: { value: Number, modelValue: Number, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择流转卡' }},
  data() { return { hovering: false, selectedItem: undefined } },
  computed: { currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value }, displayLabel() { return this.selectedItem ? this.selectedItem.code : '' }, showClear() { return this.clearable && !this.disabled && this.hovering && this.currentValue != null } },
  watch: { currentValue: { immediate: true, handler(value) { this.resolveItemById(value) } }},
  methods: {
    async resolveItemById(id) { if (id == null) { this.selectedItem = undefined; return } if (this.selectedItem && this.selectedItem.id === id) return; try { const response = await ProCardApi.getCard(id); this.selectedItem = response.data } catch (error) { console.error('[ProCardSelect] resolveItemById failed:', error) } },
    emitValue(value, item) { this.$emit('input', value); this.$emit('update:modelValue', value); this.$emit('change', item) },
    handleClick(event) { if (this.disabled) return; if (this.showClear && event.target.closest('.el-input__suffix')) { event.stopPropagation(); this.selectedItem = undefined; this.emitValue(undefined, undefined); return } this.$refs.dialog.open(this.currentValue != null ? [this.currentValue] : []) },
    handleSelected(rows) { if (!rows || !rows.length) return; this.selectedItem = rows[0]; this.emitValue(rows[0].id, rows[0]) }
  }
}
</script>

<style scoped>.pro-card-select { width: 100%; }.is-clickable { cursor: pointer; }.is-disabled { cursor: not-allowed; }.card-tooltip { line-height: 24px; }</style>
