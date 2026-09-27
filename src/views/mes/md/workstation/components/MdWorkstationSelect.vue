<!-- MES 工作站选择器 -->
<template>
  <div class="md-workstation-select">
    <div
      v-bind="$attrs"
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
          class="workstation-tooltip"
        >
          <div>编码：{{ selectedItem.code }}</div><div>名称：{{ selectedItem.name }}</div>
          <div>所在车间：{{ selectedItem.workshopName || '-' }}</div><div>所属工序：{{ selectedItem.processName || '-' }}</div>
          <div>地点：{{ selectedItem.address || '-' }}</div>
        </div>
        <el-input
          :value="displayLabel"
          :placeholder="placeholder"
          :disabled="disabled"
          readonly
        >
          <i
            slot="suffix"
            :class="showClear ? 'el-icon-circle-close' : 'el-icon-search'"
          />
        </el-input>
      </el-tooltip>
    </div>
    <md-workstation-select-dialog
      ref="dialog"
      :multiple="false"
      :process-id="processId"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import { MdWorkstationApi } from '@/api/mes/md/workstation'
import MdWorkstationSelectDialog from './MdWorkstationSelectDialog.vue'

export default {
  name: 'MdWorkstationSelect',
  components: { MdWorkstationSelectDialog },
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined }, modelValue: { type: Number, default: undefined }, processId: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择工作站' }
  },
  data() { return { hovering: false, selectedItem: undefined } },
  computed: {
    currentValue() { return this.modelValue !== undefined ? this.modelValue : this.value },
    displayLabel() { return this.selectedItem ? this.selectedItem.name : '' },
    showClear() { return this.clearable && !this.disabled && this.hovering && this.currentValue != null }
  },
  watch: { currentValue: { immediate: true, handler(value) { this.resolveItemById(value) } }},
  methods: {
    async resolveItemById(id) {
      if (id == null) { this.selectedItem = undefined; return }
      if (this.selectedItem && this.selectedItem.id === id) return
      try {
        const response = await MdWorkstationApi.getWorkstation(id)
        this.selectedItem = response.data
      } catch (error) {
        console.error('[MdWorkstationSelect] resolveItemById failed:', error)
      }
    },
    emitValue(value, item) { this.$emit('input', value); this.$emit('update:modelValue', value); this.$emit('change', item) },
    handleClick(event) {
      if (this.disabled) return
      if (this.showClear && event.target.closest('.el-input__suffix')) {
        event.stopPropagation(); this.selectedItem = undefined; this.emitValue(undefined, undefined); return
      }
      this.$refs.dialog.open(this.currentValue != null ? [this.currentValue] : [])
    },
    handleSelected(rows) {
      if (!rows || rows.length === 0) return
      this.selectedItem = rows[0]
      this.emitValue(rows[0].id, rows[0])
    }
  }
}
</script>

<style scoped>
.md-workstation-select { width: 100%; }.is-clickable { cursor: pointer; }.is-disabled { cursor: not-allowed; }.workstation-tooltip { line-height: 24px; }
</style>
