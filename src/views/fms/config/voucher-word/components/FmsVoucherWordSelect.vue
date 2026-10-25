<template>
  <el-select
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :placeholder="placeholder"
    :value="value"
    @input="handleChange"
  >
    <el-option
      v-for="item in options"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    />
  </el-select>
</template>

<script>
import { parseId } from '@/utils/id'
export default {
  name: 'FmsVoucherWordSelect',
  props: {
    value: { type: [Number, String], default: undefined },
    options: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    filterable: { type: Boolean, default: false },
    placeholder: { type: String, default: '请选择凭证字' }
  },
  methods: {
    handleChange(value) {
      this.$emit('input', parseId(value))
    }
  }
}
</script>
