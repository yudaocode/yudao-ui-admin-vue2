<template>
  <el-popover placement="bottom-end" trigger="hover" width="360">
    <el-button slot="reference" type="text">快捷键</el-button>
    <div class="shortcut-title">凭证录入快捷键</div>
    <div v-for="item in shortcuts" :key="item.name" class="shortcut-row">
      <span>{{ item.name }}</span>
      <kbd>{{ item.key }}</kbd>
    </div>
  </el-popover>
</template>

<script>
export default {
  name: 'FmsVoucherShortcutHelp',
  data() {
    return {
      shortcuts: [
        { name: '保存并新增', key: 'F12' },
        { name: '新增', key: 'Alt + N' },
        { name: '下一输入项', key: 'Enter' },
        { name: '切换输入项', key: '方向键' },
        { name: '自动平衡借贷方金额', key: '=' },
        { name: '保存', key: 'Ctrl / ⌘ + S' }
      ]
    }
  }
}
</script>

<style scoped>
.shortcut-title { margin-bottom: 8px; font-weight: 600; }
.shortcut-row { display: flex; min-height: 34px; align-items: center; justify-content: space-between; border-bottom: 1px solid #ebeef5; }
.shortcut-row kbd { min-width: 78px; padding: 3px 7px; border: 1px solid #dcdfe6; border-radius: 4px; background: #f5f7fa; text-align: center; }
</style>
