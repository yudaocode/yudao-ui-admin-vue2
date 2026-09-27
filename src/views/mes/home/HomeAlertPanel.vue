<template>
  <el-card
    shadow="hover"
    class="mes-alert"
  >
    <div
      slot="header"
      class="mes-alert__header"
    >待办与异常</div>
    <div
      v-for="item in alertItems"
      :key="item.label"
      class="mes-alert__item"
      @click="handleNavigate(item.routeName)"
    >
      <div
        class="mes-alert__icon"
        :style="{ color: item.color, backgroundColor: item.backgroundColor }"
      ><i :class="item.icon" /></div>
      <div class="mes-alert__content">
        <div class="mes-alert__label">{{ item.label }}</div>
        <div class="mes-alert__desc">{{ item.desc }}</div>
      </div>
      <el-badge
        :value="item.count"
        :hidden="!item.count"
      />
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'HomeAlertPanel',
  props: {
    summary: { type: Object, required: true }
  },
  computed: {
    alertItems() {
      return [
        {
          label: '安灯报警',
          desc: '未处置的安灯呼叫',
          icon: 'el-icon-warning',
          routeName: 'MesProAndon',
          count: this.summary.andonActiveCount,
          color: '#f56c6c',
          backgroundColor: 'rgba(245, 108, 108, 0.1)'
        },
        {
          label: '设备维修',
          desc: '待处理的维修工单',
          icon: 'el-icon-set-up',
          routeName: 'MesDvRepair',
          count: this.summary.repairActiveCount,
          color: '#e6a23c',
          backgroundColor: 'rgba(230, 162, 60, 0.1)'
        },
        {
          label: '待排产工单',
          desc: '草稿状态的生产工单',
          icon: 'el-icon-document-checked',
          routeName: 'MesProWorkOrder',
          count: this.summary.workOrderPrepareCount,
          color: '#409eff',
          backgroundColor: 'rgba(64, 158, 255, 0.1)'
        }
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
.mes-alert { height: 100%; }
.mes-alert__header { color: #303133; font-size: 16px; font-weight: 600; }
.mes-alert__item { display: flex; gap: 12px; align-items: center; padding: 16px 20px; border-bottom: 1px solid #ebeef5; cursor: pointer; transition: background-color 0.2s; }
.mes-alert__item:last-child { border-bottom: 0; }
.mes-alert__item:hover { background: #f5f7fa; }
.mes-alert__icon { display: flex; flex: 0 0 40px; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; font-size: 20px; }
.mes-alert__content { flex: 1; min-width: 0; }
.mes-alert__label { color: #303133; font-size: 14px; font-weight: 500; }
.mes-alert__desc { margin-top: 2px; color: #909399; font-size: 12px; }
</style>

<style>
.mes-alert .el-card__body { padding: 0; }
</style>
