<!-- MES 点检保养方案选择器 -->
<template>
  <div class="dv-check-plan-select">
    <div
      v-bind="$attrs"
      :class="disabled ? 'is-disabled' : 'is-clickable'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip :disabled="!selectedItem" placement="top" :open-delay="500">
        <div v-if="selectedItem" slot="content" class="plan-tooltip">
          <div>编码：{{ selectedItem.code }}</div>
          <div>名称：{{ selectedItem.name }}</div>
          <div>频度：{{ selectedItem.cycleCount || '-' }} <dict-tag :type="MES_DV_CYCLE_TYPE" :value="selectedItem.cycleType" /></div>
        </div>
        <el-input :value="displayLabel" :placeholder="placeholder" :disabled="disabled" readonly>
          <i slot="suffix" :class="showClear ? 'el-icon-circle-close' : 'el-icon-search'" />
        </el-input>
      </el-tooltip>
    </div>
    <dv-check-plan-select-dialog ref="dialog" :multiple="false" :type="type" :status="status" @selected="handleSelected" />
  </div>
</template>

<script>
import { DvCheckPlanApi } from '@/api/mes/dv/checkplan'
import DvCheckPlanSelectDialog from './DvCheckPlanSelectDialog.vue'

const MES_DV_CYCLE_TYPE = 'mes_dv_cycle_type'

export default {
  name: 'DvCheckPlanSelect',
  components: { DvCheckPlanSelectDialog },
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择保养方案' },
    type: Number,
    status: Number
  },
  data() {
    return { MES_DV_CYCLE_TYPE, hovering: false, selectedItem: undefined }
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
        const response = await DvCheckPlanApi.getCheckPlan(id)
        this.selectedItem = response.data
      } catch (error) {
        console.error('[DvCheckPlanSelect] resolveItemById failed:', error)
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
.dv-check-plan-select { width: 100%; }
.is-clickable { cursor: pointer; }
.is-disabled { cursor: not-allowed; }
.plan-tooltip { line-height: 24px; }
</style>
