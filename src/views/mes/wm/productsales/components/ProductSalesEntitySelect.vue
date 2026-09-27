<template>
  <div>
    <div
      v-bind="$attrs"
      class="entity-select"
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
          class="tooltip-content"
        >
          <template v-if="kind === 'notice'">
            <div>编号：{{ selectedItem.code }}</div>
            <div>名称：{{ selectedItem.name || '-' }}</div>
            <div>客户：{{ selectedItem.clientName || '-' }}</div>
            <div>销售订单：{{ selectedItem.salesOrderCode || '-' }}</div>
          </template>
          <template v-else-if="kind === 'notice-line'">
            <div>物料编码：{{ selectedItem.itemCode }}</div>
            <div>物料名称：{{ selectedItem.itemName }}</div>
            <div>规格型号：{{ selectedItem.specification || '-' }}</div>
            <div>发货数量：{{ selectedItem.quantity }}</div>
          </template>
          <template v-else>
            <div>物料：{{ selectedItem.itemName || '-' }}</div>
            <div>批次：{{ selectedItem.batchCode || '-' }}</div>
            <div>数量：{{ selectedItem.quantity == null ? '-' : selectedItem.quantity }}</div>
            <div>仓库：{{ selectedItem.warehouseName || '-' }}</div>
            <div>库区：{{ selectedItem.locationName || '-' }}</div>
            <div>库位：{{ selectedItem.areaName || '-' }}</div>
          </template>
        </div>
        <el-input
          :value="displayLabel"
          :placeholder="placeholder"
          :disabled="disabled"
          readonly
          :suffix-icon="suffixIcon"
        />
      </el-tooltip>
    </div>
    <ProductSalesEntitySelectDialog
      ref="dialog"
      :kind="kind"
      :status="status"
      :notice-id="noticeId"
      :item-id="itemId"
      :batch-id="batchId"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import { WmSalesNoticeApi } from '@/api/mes/wm/salesnotice'
import { WmSalesNoticeLineApi } from '@/api/mes/wm/salesnotice/line'
import { WmMaterialStockApi } from '@/api/mes/wm/materialstock'
import ProductSalesEntitySelectDialog from './ProductSalesEntitySelectDialog.vue'

export default {
  name: 'ProductSalesEntitySelect',
  components: { ProductSalesEntitySelectDialog },
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined },
    kind: { type: String, required: true },
    placeholder: { type: String, default: '请选择' },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    status: { type: Number, default: undefined },
    noticeId: { type: Number, default: undefined },
    itemId: { type: Number, default: undefined },
    batchId: { type: Number, default: undefined }
  },
  data() {
    return { hovering: false, selectedItem: undefined }
  },
  computed: {
    displayLabel() {
      if (!this.selectedItem) return ''
      if (this.kind === 'notice-line') return (this.selectedItem.itemCode || '') + ' - ' + (this.selectedItem.itemName || '')
      if (this.kind === 'stock') return (this.selectedItem.warehouseName || '-') + ' / ' + (this.selectedItem.batchCode || '-') + ' / 数量:' + this.selectedItem.quantity
      return this.selectedItem.name || ''
    },
    showClear() {
      return this.clearable && !this.disabled && this.hovering && this.value != null
    },
    suffixIcon() {
      return this.showClear ? 'el-icon-circle-close' : 'el-icon-search'
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.resolveItem(value)
      }
    },
    noticeId() {
      if (this.kind !== 'notice-line') return
      this.selectedItem = undefined
      this.$emit('input', undefined)
      this.$emit('change', undefined)
    }
  },
  methods: {
    requestDetail(id) {
      if (this.kind === 'notice') return WmSalesNoticeApi.getSalesNotice(id)
      if (this.kind === 'notice-line') return WmSalesNoticeLineApi.getSalesNoticeLine(id)
      return WmMaterialStockApi.getMaterialStock(id)
    },
    async resolveItem(id) {
      if (id == null) {
        this.selectedItem = undefined
        return
      }
      if (this.selectedItem && this.selectedItem.id === id) return
      try {
        this.selectedItem = (await this.requestDetail(id)).data
      } catch (error) {
        console.error('[ProductSalesEntitySelect] resolveItem failed:', error)
      }
    },
    handleClick(event) {
      if (this.disabled) return
      if (this.showClear && event.target.closest('.el-input__suffix')) {
        event.stopPropagation()
        this.selectedItem = undefined
        this.$emit('input', undefined)
        this.$emit('change', undefined)
        return
      }
      this.$refs.dialog.open(this.value == null ? [] : [this.value])
    },
    handleSelected(rows) {
      if (!rows || rows.length === 0) return
      const item = rows[0]
      this.selectedItem = item
      this.$emit('input', item.id)
      this.$emit('change', item)
    }
  }
}
</script>

<style scoped>
.entity-select { width: 100%; }
.entity-select.is-clickable, .entity-select.is-clickable /deep/ .el-input__inner { cursor: pointer; }
.entity-select.is-disabled, .entity-select.is-disabled /deep/ .el-input__inner { cursor: not-allowed; }
.tooltip-content { line-height: 24px; }
</style>
