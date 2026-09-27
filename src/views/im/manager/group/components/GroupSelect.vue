<template>
  <div class="group-select-root">
    <div
      v-bind="$attrs"
      class="group-select"
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
          <div>群名称：{{ selectedItem.name }}</div>
          <div>群主：{{ selectedItem.ownerNickname || '-' }}</div>
          <div>成员数：{{ selectedItem.memberCount == null ? '-' : selectedItem.memberCount }}</div>
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
    <GroupSelectDialog
      ref="dialog"
      :multiple="false"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import { getManagerGroup } from '@/api/im/manager/group'
import GroupSelectDialog from './GroupSelectDialog.vue'

export default {
  name: 'GroupSelect',
  components: { GroupSelectDialog },
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择群' }
  },
  data() {
    return { hovering: false, selectedItem: undefined }
  },
  computed: {
    displayLabel() {
      return this.selectedItem ? this.selectedItem.name : ''
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
        this.resolveItemById(value)
      }
    }
  },
  methods: {
    async resolveItemById(id) {
      if (id == null) {
        this.selectedItem = undefined
        return
      }
      if (this.selectedItem && this.selectedItem.id === id) return
      try {
        const response = await getManagerGroup(id)
        this.selectedItem = response.data
      } catch (error) {
        console.error('[GroupSelect] resolveItemById failed:', error)
      }
    },
    handleClick(event) {
      if (this.disabled) return
      const target = event.target
      if (this.showClear && target && target.closest && target.closest('.el-input__suffix')) {
        event.stopPropagation()
        this.selectedItem = undefined
        this.$emit('input', undefined)
        this.$emit('change', undefined)
        return
      }
      this.$refs.dialog.open(this.value != null ? [this.value] : [])
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
.group-select-root, .group-select { width: 100%; }
.is-clickable { cursor: pointer; }
.is-disabled { cursor: not-allowed; }
.tooltip-content { line-height: 24px; }
</style>
