<template>
  <el-input
    v-model="content"
    type="textarea"
    :rows="5"
    placeholder="请输入内容"
  />
</template>

<script>
export default {
  name: 'WxReplyTabText',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: String,
      default: null
    }
  },
  computed: {
    content: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
