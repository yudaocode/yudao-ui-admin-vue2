<template><el-button
  type="text"
  @click="handlePrint"
>{{ labelText }}</el-button></template>
<script>
// TODO @芋艿：后续实现。对接 HiPrint 打印插件 + UReport 报表模板，实现标签打印功能
export default { name: 'PrinterLabel', props: { bizId: Number, bizCode: String, bizType: String, labelText: { type: String, default: '标签打印' }}, methods: { handlePrint() { this.$modal.msgWarning('标签打印功能暂未实现，敬请期待') } }}
</script>
