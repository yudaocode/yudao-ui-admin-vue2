<!-- MES 点检保养项目选择器 -->
<template>
  <div class="dv-subject-select">
    <div
      v-bind="$attrs"
      :class="disabled ? 'is-disabled' : 'is-clickable'"
      @click="handleClick"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <el-tooltip :disabled="!selectedItem" placement="top" :open-delay="500">
        <div v-if="selectedItem" slot="content" class="subject-tooltip">
          <div>编码：{{ selectedItem.code }}</div>
          <div>名称：{{ selectedItem.name }}</div>
          <div>内容：{{ selectedItem.content || '-' }}</div>
          <div>标准：{{ selectedItem.standard || '-' }}</div>
        </div>
        <el-input :value="displayLabel" :placeholder="placeholder" :disabled="disabled" readonly>
          <i slot="suffix" :class="showClear ? 'el-icon-circle-close' : 'el-icon-search'" />
        </el-input>
      </el-tooltip>
    </div>
    <dv-subject-select-dialog ref="dialog" :multiple="false" :subject-type="subjectType" @selected="handleSelected" />
  </div>
</template>

<script>
import { DvSubjectApi } from '@/api/mes/dv/subject'
import DvSubjectSelectDialog from './DvSubjectSelectDialog.vue'

export default {
  name: 'DvSubjectSelect',
  components: { DvSubjectSelectDialog },
  inheritAttrs: false,
  props: {
    value: Number,
    modelValue: Number,
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '请选择项目' },
    subjectType: Number
  },
  data() {
    return { hovering: false, selectedItem: undefined }
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
    currentValue: {
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
        const response = await DvSubjectApi.getSubject(id)
        this.selectedItem = response.data
      } catch (error) {
        console.error('[DvSubjectSelect] resolveItemById failed:', error)
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
.dv-subject-select { width: 100%; }
.is-clickable { cursor: pointer; }
.is-disabled { cursor: not-allowed; }
.subject-tooltip { line-height: 24px; }
</style>
