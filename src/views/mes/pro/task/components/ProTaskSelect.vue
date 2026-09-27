<!-- MES 生产任务选择器 -->
<template><div class="pro-task-select"><div
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
  class="task-tooltip"
><div>任务编号：{{ selectedItem.code }}</div><div>任务名称：{{ selectedItem.name || '-' }}</div><div>工序：{{ selectedItem.processName || '-' }}</div><div>工作站：{{ selectedItem.workstationName || '-' }}</div><div>物料：{{ selectedItem.itemName || '-' }}</div><div>规格：{{ selectedItem.itemSpecification || '-' }}</div></div><el-input
  :value="displayLabel"
  :placeholder="placeholder"
  :disabled="disabled"
  readonly
><i
  slot="suffix"
  :class="showClear ? 'el-icon-circle-close' : 'el-icon-search'"
/></el-input></el-tooltip></div><pro-task-select-dialog
  ref="dialog"
  :multiple="false"
  :statuses="statuses"
  @selected="handleSelected"
/></div></template>

<script>
import { ProTaskApi } from '@/api/mes/pro/task'
import ProTaskSelectDialog from './ProTaskSelectDialog.vue'

export default {
  name: 'ProTaskSelect', components: { ProTaskSelectDialog }, inheritAttrs: false,
  props: { value: Number, modelValue: Number, workOrderId: Number, workstationId: Number, statuses: Array, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true }, placeholder: { type: String, default: '请选择任务' }},
  data() { return { hovering: false, selectedItem: undefined } }, computed: { currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value }, displayLabel() { return this.selectedItem ? this.selectedItem.code : '' }, showClear() { return this.clearable && !this.disabled && this.hovering && this.currentValue != null } }, watch: { currentValue: { immediate: true, handler(value) { this.resolveItemById(value) } }},
  methods: {
    async resolveItemById(id) { if (id == null) { this.selectedItem = undefined; return } if (this.selectedItem && this.selectedItem.id === id) return; try { const response = await ProTaskApi.getTask(id); this.selectedItem = response.data } catch (error) { console.error('[ProTaskSelect] resolveItemById failed:', error) } }, emitValue(value, item) { this.$emit('input', value); this.$emit('update:modelValue', value); this.$emit('change', item) },
    handleClick(event) { if (this.disabled) return; if (this.showClear && event.target.closest('.el-input__suffix')) { event.stopPropagation(); this.selectedItem = undefined; this.emitValue(undefined, undefined); return } this.$refs.dialog.open(this.currentValue != null ? [this.currentValue] : [], this.workOrderId, this.workstationId) }, handleSelected(rows) { if (!rows || !rows.length) return; this.selectedItem = rows[0]; this.emitValue(rows[0].id, rows[0]) }
  }
}
</script>

<style scoped>.pro-task-select { width: 100%; }.is-clickable { cursor: pointer; }.is-disabled { cursor: not-allowed; }.task-tooltip { line-height: 24px; }</style>
