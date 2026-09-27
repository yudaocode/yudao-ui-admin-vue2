<template>
  <el-card v-if="visibleShortcuts.length > 0" class="fms-home-shortcuts" shadow="never">
    <div class="shortcut-heading">
      <div class="shortcut-title">常用功能</div>
      <div class="shortcut-subtitle">快速进入日常财务工作</div>
    </div>
    <div class="shortcut-grid">
      <button
        v-for="shortcut in visibleShortcuts"
        :key="shortcut.path"
        class="shortcut-card"
        type="button"
        @click="goTo(shortcut.path)"
      >
        <span class="shortcut-icon"><i :class="shortcut.icon" /></span>
        <span class="shortcut-copy">
          <strong>{{ shortcut.name }}</strong>
          <small>{{ shortcut.description }}</small>
        </span>
      </button>
    </div>
  </el-card>
</template>

<script>
import { checkPermi } from '@/utils/permission'

const SHORTCUTS = [
  {
    name: '录凭证',
    description: '新增会计凭证',
    icon: 'el-icon-edit-outline',
    path: '/fms/voucher/create',
    permission: 'fms:voucher:create',
    writeRequired: true
  },
  {
    name: '查凭证',
    description: '查询会计凭证',
    icon: 'el-icon-search',
    path: '/fms/voucher/list',
    permission: 'fms:voucher:query',
    writeRequired: false
  },
  {
    name: '科目余额表',
    description: '查看科目余额',
    icon: 'el-icon-data-analysis',
    path: '/fms/ledger/subject-balance',
    permission: 'fms:ledger:subject-balance:query',
    writeRequired: false
  },
  {
    name: '明细账',
    description: '查看科目明细',
    icon: 'el-icon-document',
    path: '/fms/ledger/detail',
    permission: 'fms:ledger:detail:query',
    writeRequired: false
  }
]

export default {
  name: 'FmsHomeShortcuts',
  props: {
    writable: { type: Boolean, default: false }
  },
  computed: {
    visibleShortcuts() {
      return SHORTCUTS.filter(shortcut => {
        return checkPermi([shortcut.permission]) && (!shortcut.writeRequired || this.writable)
      })
    }
  },
  methods: {
    goTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.fms-home-shortcuts { margin-bottom: 16px; }
.shortcut-title { color: #303133; font-size: 16px; font-weight: 600; }
.shortcut-subtitle { margin-top: 6px; color: #909399; font-size: 13px; }
.shortcut-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 20px; }
.shortcut-card { display: flex; min-width: 0; align-items: center; gap: 14px; padding: 18px; border: 1px solid transparent; border-radius: 8px; background: #ecf5ff; color: #303133; text-align: left; cursor: pointer; transition: transform .2s, border-color .2s; }
.shortcut-card:hover { border-color: #a0cfff; transform: translateY(-2px); }
.shortcut-icon { display: flex; width: 42px; height: 42px; flex: none; align-items: center; justify-content: center; border-radius: 8px; background: #409eff; color: #fff; font-size: 22px; box-shadow: 0 3px 8px rgba(64, 158, 255, .25); }
.shortcut-copy { min-width: 0; }
.shortcut-copy strong, .shortcut-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.shortcut-copy strong { font-size: 15px; font-weight: 500; }
.shortcut-copy small { margin-top: 5px; color: #909399; font-size: 12px; }
@media (max-width: 1200px) {
  .shortcut-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .shortcut-grid { grid-template-columns: 1fr; }
}
</style>
