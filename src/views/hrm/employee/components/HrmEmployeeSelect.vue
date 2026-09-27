<template>
  <div class="hrm-employee-select-root">
    <div
      v-bind="$attrs"
      class="hrm-employee-select"
      :class="disabled ? 'is-disabled' : 'is-clickable'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip :content="displayLabel" :disabled="!displayLabel" placement="top" :open-delay="500">
        <el-input
          :disabled="disabled"
          :value="displayLabel"
          :placeholder="placeholder"
          :suffix-icon="suffixIcon"
          readonly
        />
      </el-tooltip>
    </div>
    <HrmEmployeeSelectDialog
      ref="dialog"
      :entry-status="entryStatus"
      :multiple="multiple"
      :selectable="selectable"
      :title="title"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import { getEmployeeSimpleList } from '@/api/hrm/employee'
import HrmEmployeeSelectDialog from './HrmEmployeeSelectDialog.vue'

export default {
  name: 'HrmEmployeeSelect',
  inheritAttrs: false,
  components: { HrmEmployeeSelectDialog },
  model: { prop: 'value', event: 'input' },
  props: {
    value: { type: [Number, Array], default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    disabledIds: { type: Array, default: () => [] },
    entryStatus: { type: Number, default: undefined },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择员工' },
    selectable: { type: Function, default: undefined },
    title: { type: String, default: '选择员工' }
  },
  data() {
    return {
      hovering: false,
      selectedItems: []
    }
  },
  computed: {
    displayLabel() {
      return this.selectedItems.map((item) => item.name).join('、')
    },
    showClear() {
      return Boolean(
        this.clearable && !this.disabled && this.hovering && this.normalizeIds(this.value).length
      )
    },
    suffixIcon() {
      return this.showClear ? 'el-icon-circle-close' : 'el-icon-search'
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(value) {
        this.resolveItems(value)
      }
    }
  },
  methods: {
    normalizeIds(value) {
      return Array.isArray(value) ? value : value == null ? [] : [value]
    },
    async resolveItems(value) {
      const ids = this.normalizeIds(value)
      if (!ids.length) {
        this.selectedItems = []
        return
      }
      if (
        this.selectedItems.length === ids.length &&
        this.selectedItems.every((item, index) => item.id === ids[index])
      ) {
        return
      }
      try {
        const response = await getEmployeeSimpleList(ids)
        const itemMap = new Map(response.data.map((item) => [item.id, item]))
        this.selectedItems = ids.map((id) => itemMap.get(id)).filter((item) => item && item.id != null)
      } catch (error) {
        this.selectedItems = []
      }
    },
    handleClick(event) {
      if (this.disabled) {
        return
      }
      if (this.showClear && event.target.closest('.el-input__suffix')) {
        event.stopPropagation()
        this.selectedItems = []
        const value = this.multiple ? [] : undefined
        this.$emit('input', value)
        this.$emit('change', value)
        return
      }
      this.$refs.dialog.open(this.normalizeIds(this.value), this.disabledIds)
    },
    handleSelected(rows) {
      const selectedRows = rows.filter((item) => item.id != null)
      this.selectedItems = selectedRows
      if (this.multiple) {
        const value = selectedRows.map((item) => item.id)
        this.$emit('input', value)
        this.$emit('change', selectedRows)
        return
      }
      const value = selectedRows[0] ? selectedRows[0].id : undefined
      this.$emit('input', value)
      this.$emit('change', selectedRows[0])
    }
  }
}
</script>

<style lang="scss" scoped>
.hrm-employee-select-root,
.hrm-employee-select {
  width: 100%;
}

.is-clickable,
.is-clickable ::v-deep .el-input__inner {
  cursor: pointer;
}

.is-disabled,
.is-disabled ::v-deep .el-input__inner {
  cursor: not-allowed;
}
</style>
