<!-- MES 生产工单选择器 -->
<template>
  <div class="pro-work-order-select"><div
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
    class="work-order-tooltip"
  ><div>编码：{{ selectedItem.code }}</div><div>名称：{{ selectedItem.name }}</div><div>产品：{{ selectedItem.productName || '-' }}</div><div>数量：{{ selectedItem.quantity == null ? '-' : selectedItem.quantity }}</div></div><el-input
    :value="displayLabel"
    :placeholder="placeholder"
    :disabled="disabled"
    readonly
  ><i
    slot="suffix"
    :class="showClear ? 'el-icon-circle-close' : 'el-icon-search'"
  /></el-input></el-tooltip></div><pro-work-order-select-dialog
    ref="dialog"
    :multiple="false"
    :status="status"
    :type="type"
    @selected="handleSelected"
  /></div>
</template>

<script>
import { ProWorkOrderApi } from '@/api/mes/pro/workorder'
import ProWorkOrderSelectDialog from './ProWorkOrderSelectDialog.vue'

export default {
  name: 'ProWorkOrderSelect', components: { ProWorkOrderSelectDialog }, inheritAttrs: false,
  props: { value: Number, modelValue: Number, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择工单' }, status: Number, type: Number },
  data() { return { hovering: false, selectedItem: undefined } },
  computed: { currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value }, displayLabel() { return this.selectedItem ? this.selectedItem.code : '' }, showClear() { return this.clearable && !this.disabled && this.hovering && this.currentValue != null } },
  watch: { currentValue: { immediate: true, handler(value) { this.resolveItemById(value) } }},
  methods: {
    async resolveItemById(id) { if (id == null) { this.selectedItem = undefined; return } if (this.selectedItem && this.selectedItem.id === id) return; try { const response = await ProWorkOrderApi.getWorkOrder(id); this.selectedItem = response.data } catch (error) { console.error('[ProWorkOrderSelect] resolveItemById failed:', error) } },
    emitValue(value, item) { this.$emit('input', value); this.$emit('update:modelValue', value); this.$emit('change', item) },
    handleClick(event) { if (this.disabled) return; if (this.showClear && event.target.closest('.el-input__suffix')) { event.stopPropagation(); this.selectedItem = undefined; this.emitValue(undefined, undefined); return } this.$refs.dialog.open(this.currentValue != null ? [this.currentValue] : []) },
    handleSelected(rows) { if (!rows || !rows.length) return; this.selectedItem = rows[0]; this.emitValue(rows[0].id, rows[0]) }
  }
}
</script>

<style scoped>.pro-work-order-select { width: 100%; }.is-clickable { cursor: pointer; }.is-disabled { cursor: not-allowed; }.work-order-tooltip { line-height: 24px; }</style>
