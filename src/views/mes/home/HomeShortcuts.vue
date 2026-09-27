<template>
  <el-card
    shadow="hover"
    class="mes-shortcuts"
  >
    <div
      slot="header"
      class="mes-shortcuts__header"
    >快捷入口</div>
    <el-row :gutter="16">
      <el-col
        v-for="item in shortcuts"
        :key="item.name"
        :span="8"
        class="mes-shortcuts__column"
      >
        <div
          class="mes-shortcuts__item"
          @click="handleNavigate(item.routeName)"
        >
          <div
            class="mes-shortcuts__icon"
            :style="{ backgroundColor: item.bgColor }"
          ><i :class="item.icon" /></div>
          <span>{{ item.name }}</span>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  name: 'HomeShortcuts',
  data() {
    return {
      shortcuts: [
        { name: '生产工单', icon: 'el-icon-document', routeName: 'MesProWorkOrder', bgColor: '#409eff' },
        { name: '生产报工', icon: 'el-icon-edit', routeName: 'MesProFeedback', bgColor: '#67c23a' },
        { name: '质量检验', icon: 'el-icon-search', routeName: 'MesQcIqc', bgColor: '#e6a23c' },
        { name: '库存查询', icon: 'el-icon-box', routeName: 'MesWmMaterialStock', bgColor: '#f56c6c' },
        { name: '设备管理', icon: 'el-icon-cpu', routeName: 'MesDvMachinery', bgColor: '#7c3aed' },
        { name: '生产任务', icon: 'el-icon-s-order', routeName: 'MesProTask', bgColor: '#0ea5e9' },
        { name: '到货通知', icon: 'el-icon-truck', routeName: 'MesWmArrivalNotice', bgColor: '#14b8a6' },
        { name: '设备维修', icon: 'el-icon-set-up', routeName: 'MesDvRepair', bgColor: '#f59e0b' },
        { name: '流转卡', icon: 'el-icon-tickets', routeName: 'MesProCard', bgColor: '#ec4899' }
      ]
    }
  },
  methods: {
    handleNavigate(name) {
      this.$emit('navigate', name)
    }
  }
}
</script>

<style scoped>
.mes-shortcuts { height: 100%; }
.mes-shortcuts__header { color: #303133; font-size: 16px; font-weight: 600; }
.mes-shortcuts__column { margin-bottom: 16px; }
.mes-shortcuts__item { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 12px 0; border-radius: 8px; color: #606266; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.mes-shortcuts__item:hover { background: #f5f7fa; transform: translateY(-2px); }
.mes-shortcuts__icon { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; color: #fff; font-size: 24px; }
</style>
