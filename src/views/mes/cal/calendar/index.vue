<!-- MES 排班日历 -->
<template>
  <div class="app-container">
    <doc-alert title="【排班】排班计划、排班日历" url="https://doc.iocoder.cn/mes/cal/calendar/" />

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="按分类" name="type">
        <type-view />
      </el-tab-pane>
      <el-tab-pane label="按班组" name="team">
        <team-view />
      </el-tab-pane>
      <el-tab-pane label="按个人" name="user">
        <user-view />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import TypeView from './TypeView.vue'
import TeamView from './TeamView.vue'
import UserView from './UserView.vue'

export default {
  name: 'MesCalCalendar',
  components: { TypeView, TeamView, UserView },
  data() {
    return { activeTab: 'type' }
  }
}
</script>
