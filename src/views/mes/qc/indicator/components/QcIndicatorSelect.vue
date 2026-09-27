<template>
  <div class="qc-indicator-select-root">
    <div
      v-bind="attrs"
      class="qc-w-full"
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
            <div>编码：{{ selectedItem.code }}</div>
            <div>名称：{{ selectedItem.name }}</div>
            <div>类型：{{ selectedItem.type || '-' }}</div>
            <div>检测工具：{{ selectedItem.tool || '-' }}</div>
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
    <QcIndicatorSelectDialog
      ref="dialogRef"
      :multiple="false"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue'
import { QcIndicatorApi } from '@/api/mes/qc/indicator'
import QcIndicatorSelectDialog from './QcIndicatorSelectDialog.vue'
export default {
  name: 'QcIndicatorSelect',
  components: { QcIndicatorSelectDialog },
  inheritAttrs: false,
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: { 'modelValue': { type: Number }, 'disabled': { type: Boolean, default: false }, 'clearable': { type: Boolean, default: true }, 'placeholder': { type: String, default: '请选择质检指标' }},
  setup(props, { emit, attrs: contextAttrs }) {
    const Search = 'el-icon-search'
    const CircleClose = 'el-icon-circle-close'
    // 组件有两个根节点（div + Dialog），Vue 不会自动继承 attrs；
    // 手动透传到外层 div，确保父组件传入的 class / style 等生效
    const attrs = contextAttrs
    const dialogRef = ref() // 弹窗 Ref
    const hovering = ref(false) // 鼠标是否悬停
    // ==================== 名称回显 ====================
    const selectedItem = ref() // 当前选中的指标对象
    /** 输入框显示文本：只展示指标名称，保持简洁 */
    const displayLabel = computed(() => {
      var _a, _b
      return (_b = (_a = selectedItem.value) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : ''
    })
    /** 是否显示清除图标 */
    const showClear = computed(() => {
      return props.clearable && !props.disabled && hovering.value && props.modelValue != null
    })
    /** 后缀图标：悬停且有值时显示清除，否则显示搜索 */
    const suffixIcon = computed(() => {
      return showClear.value ? CircleClose : Search
    })
    /** 根据 ID 单条查询指标信息（用于编辑回显） */
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
        selectedItem.value = (await QcIndicatorApi.getIndicator(id)).data
      } catch (e) {
        console.error('[QcIndicatorSelect] resolveItemById failed:', e)
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
      // 打开弹窗，传入当前选中 ID 用于预选高亮
      const selectedIds = props.modelValue != null ? [props.modelValue] : []
      dialogRef.value.open(selectedIds)
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
    return { ...toRefs(props), CircleClose, QcIndicatorSelectDialog, Search, attrs, dialogRef, displayLabel, handleClick, handleSelected, hovering, resolveItemById, selectedItem, showClear, suffixIcon }
  }
}
</script>

<style lang="scss" scoped>
/* 穿透 Element UI 输入框内部元素，保持选择器的鼠标状态。 */
.is-select-clickable {
  ::v-deep .el-input__inner {
    cursor: pointer;
  }
}

.is-select-disabled {
  ::v-deep .el-input__inner {
    cursor: not-allowed;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.leading-6 {
  line-height: 1.5;
}
</style>

<style scoped>
.qc-content-wrap { margin-bottom: 20px; }
.qc-w-full { width: 100%; }
.qc-w-240 { width: 240px; }
.qc-w-220 { width: 220px; }
.qc-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
.mb-10px { margin-bottom: 10px; }
.mt-10px { margin-top: 10px; }
.-mb-15px { margin-bottom: -15px; }
.overflow-hidden { overflow: hidden; }
</style>
