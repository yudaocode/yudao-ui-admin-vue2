<template>
  <div class="voucher-template-category-select">
    <div class="category-select-row">
      <el-select
        :disabled="disabled"
        :placeholder="placeholder"
        :value="selectedValue"
        @input="handleInput"
      >
        <el-option
          v-for="item in categories"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button :disabled="disabled" @click="$refs.categoryManage.open()">管理分类</el-button>
    </div>
    <fms-voucher-template-category-manage
      ref="categoryManage"
      :account-set-id="accountSetId"
      @change="$emit('change', $event)"
      @select="handleInput"
    />
  </div>
</template>

<script>
import FmsVoucherTemplateCategoryManage from './FmsVoucherTemplateCategoryManage.vue'

export default {
  name: 'FmsVoucherTemplateCategorySelect',
  components: { FmsVoucherTemplateCategoryManage },
  model: { prop: 'value', event: 'input' },
  props: {
    accountSetId: { type: [Number, String], default: undefined },
    categories: { type: Array, required: true },
    value: { type: [Number, String], default: undefined },
    modelValue: { type: [Number, String], default: undefined },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '请选择模板分类' }
  },
  computed: {
    selectedValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  methods: {
    handleInput(value) {
      const normalized = value === '' || value === null ? undefined : value
      this.$emit('input', normalized)
      this.$emit('update:modelValue', normalized)
    }
  }
}
</script>

<style scoped>
.voucher-template-category-select, .category-select-row { width: 100%; }
.category-select-row { display: flex; gap: 8px; }
.category-select-row .el-select { flex: 1; min-width: 0; }
</style>
