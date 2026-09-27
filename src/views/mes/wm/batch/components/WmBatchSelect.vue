<template>
  <div class="wm-migrated">
    <div
      v-bind="attrs"
      class="wm-w-full"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip
        :disabled="!selectedItem"
        placement="top"
        :open-delay="500"
      >
        <template slot="content">
          <div
            v-if="selectedItem"
            class="leading-6"
          >
            <div>批次编号：{{ selectedItem.code }}</div>
            <div>物料编码：{{ selectedItem.itemCode || '-' }}</div>
            <div>物料名称：{{ selectedItem.itemName || '-' }}</div>
            <div>生产批号：{{ selectedItem.lotNumber || '-' }}</div>
          </div>
        </template>
        <el-input
          :value="displayLabel"
          :placeholder="placeholder"
          :disabled="disabled"
          readonly
          :suffix-icon="suffixIcon"
          :class="disabled ? 'is-select-disabled' : 'is-select-clickable'"
        />
      </el-tooltip>
    </div>
    <!-- 弹窗必须放在 div 外部，否则弹窗内的点击事件会冒泡到 div 触发 handleClick -->
    <WmBatchSelectDialog
      ref="dialogRef"
      :multiple="false"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue'
import { BatchApi } from '@/api/mes/wm/batch'
import WmBatchSelectDialog from './WmBatchSelectDialog.vue'
export default {
  name: 'WmBatchSelect',
  components: { WmBatchSelectDialog },
  inheritAttrs: false,
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: { 'modelValue': { type: Number }, 'itemId': { type: Number }, 'clientId': { type: Number }, 'vendorId': { type: Number }, 'salesOrderCode': { type: String }, 'disabled': { type: Boolean, default: false }, 'clearable': { type: Boolean, default: true }, 'placeholder': { type: String, default: '请选择批次' }},
  setup(props, { emit, attrs: contextAttrs }) {
    const Search = 'el-icon-search'
    const CircleClose = 'el-icon-circle-close'
    // 组件有两个根节点（div + Dialog），Vue 不会自动继承 attrs；
    // 手动透传到外层 div，确保父组件传入的 class / style 等生效
    const attrs = contextAttrs
    const dialogRef = ref() // 弹窗 Ref
    const hovering = ref(false) // 鼠标是否悬停
    // ==================== 名称回显 ====================
    const selectedItem = ref() // 当前选中的批次对象
    /** 输入框显示文本：展示批次编号 */
    const displayLabel = computed(() => {
      var _a, _b
      return (_b = (_a = selectedItem.value) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : ''
    })
    /** 是否显示清除图标 */
    const showClear = computed(() => {
      return props.clearable && !props.disabled && hovering.value && props.modelValue != null
    })
    /** 后缀图标：悬停且有值时显示清除，否则显示搜索 */
    const suffixIcon = computed(() => {
      return showClear.value ? CircleClose : Search
    })
    /** 根据 ID 单条查询批次信息（用于编辑回显） */
    const resolveItemById = async(id) => {
      var _a
      if (id == null) {
        selectedItem.value = undefined
        return
      }
      if (((_a = selectedItem.value) === null || _a === void 0 ? void 0 : _a.id) === id) {
        return
      }
      try {
        selectedItem.value = (await BatchApi.getBatch(id)).data
      } catch (e) {
        console.error('[WmBatchSelect] resolveItemById failed:', e)
      }
    }
    /** 监听 modelValue 变化，触发回显 */
    watch(() => props.modelValue, (val) => {
      resolveItemById(val)
    }, { immediate: true })
    // ==================== 点击交互 ====================
    /** 点击组件：清除或打开弹窗 */
    const handleClick = (e) => {
      if (props.disabled) {
        return
      }
      // 点击清除图标：清空选中
      const target = e.target
      if (showClear.value && target.closest('.el-input__suffix')) {
        e.stopPropagation()
        selectedItem.value = undefined
        emit('update:modelValue', undefined)
        emit('change', undefined)
        return
      }
      // 打开弹窗，传入当前选中 ID 用于预选高亮，传入 itemId 用于默认过滤
      const selectedIds = props.modelValue != null ? [props.modelValue] : []
      dialogRef.value.open(selectedIds, props.itemId, props.clientId, props.vendorId, props.salesOrderCode)
    }
    /** 弹窗选中回调 */
    const handleSelected = (rows) => {
      if (!rows || rows.length === 0) {
        return
      }
      const item = rows[0]
      selectedItem.value = item
      emit('update:modelValue', item.id)
      emit('change', item)
    }
    return { ...toRefs(props), CircleClose, Search, WmBatchSelectDialog, attrs, dialogRef, displayLabel, handleClick, handleSelected, hovering, resolveItemById, selectedItem, showClear, suffixIcon }
  }
}
</script>

<style lang="scss" scoped>
/* :deep 用于穿透 el-input 内部元素的 cursor 样式，UnoCSS 无法直接处理组件内部 DOM */
.is-select-clickable {
  ::v-deep .el-input__wrapper,
  ::v-deep .el-input__inner {
    cursor: pointer;
  }
}

.is-select-disabled {
  ::v-deep .el-input__wrapper,
  ::v-deep .el-input__inner {
    cursor: not-allowed;
  }
}
</style>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
</style>
