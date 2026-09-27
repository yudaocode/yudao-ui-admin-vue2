<template>
  <!-- 邮箱账号选择 -->
  <el-select
    :value="value"
    placeholder="请选择邮箱账号"
    :disabled="disabled"
    filterable
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="account in accounts"
      :key="account.id"
      :value="account.id"
      :label="account.mail"
    />
  </el-select>
</template>

<script>
export default {
  name: 'OaMailAccountSelect',
  props: {
    value: {
      type: Number,
      default: undefined
    },
    accounts: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change')
    }
  }
}
</script>
