<!-- MES 产品 BOM 子物料选择器 -->
<template>
  <div class="md-product-bom-select">
    <div
      v-bind="$attrs"
      :class="disabled ? 'is-disabled' : 'is-clickable'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip
        :disabled="!selectedBom"
        placement="top"
        :open-delay="500"
      >
        <div
          v-if="selectedBom"
          slot="content"
          class="bom-tooltip"
        >
          <div>编码：{{ selectedBom.bomItemCode }}</div>
          <div>名称：{{ selectedBom.bomItemName }}</div>
          <div>规格：{{ selectedBom.bomItemSpecification || '-' }}</div>
          <div>单位：{{ selectedBom.unitMeasureName || '-' }}</div>
          <div>用量比例：{{ selectedBom.quantity }}</div>
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
    <md-product-bom-select-dialog
      ref="dialog"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import { MdProductBomApi } from '@/api/mes/md/item/productBom'
import MdProductBomSelectDialog from './MdProductBomSelectDialog.vue'

export default {
  name: 'MdProductBomSelect',
  components: { MdProductBomSelectDialog },
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    itemId: Number,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择 BOM 物料' }
  },
  data() {
    return { hovering: false, selectedBom: undefined }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    displayLabel() {
      return this.selectedBom ? this.selectedBom.bomItemName : ''
    },
    showClear() {
      return this.clearable && !this.disabled && this.hovering && this.currentValue != null
    }
  },
  watch: {
    currentValue: { immediate: true, handler(value) { this.resolveBomById(value) } },
    itemId() {
      this.selectedBom = undefined
      this.emitValue(undefined)
    }
  },
  methods: {
    emitValue(value, row) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
      this.$emit('change', row)
    },
    async resolveBomById(bomItemId) {
      if (bomItemId == null || this.itemId == null) {
        this.selectedBom = undefined
        return
      }
      if (this.selectedBom && this.selectedBom.bomItemId === bomItemId) return
      try {
        const response = await MdProductBomApi.getProductBomListByItemId(this.itemId)
        const match = response.data.find(item => item.bomItemId === bomItemId)
        this.selectedBom = match
      } catch (error) {
        console.error('[MdProductBomSelect] resolveBomById failed:', error)
      }
    },
    handleClick(event) {
      if (this.disabled || this.itemId == null) return
      if (this.showClear && event.target.closest('.el-input__suffix')) {
        event.stopPropagation()
        this.selectedBom = undefined
        this.emitValue(undefined, undefined)
        return
      }
      this.$refs.dialog.open(this.itemId, this.currentValue)
    },
    handleSelected(row) {
      this.selectedBom = row
      this.emitValue(row.bomItemId, row)
    }
  }
}
</script>

<style scoped>
.md-product-bom-select { width: 100%; }
.is-clickable { cursor: pointer; }
.is-disabled { cursor: not-allowed; }
.bom-tooltip { line-height: 24px; }
</style>
