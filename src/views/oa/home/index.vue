<template>
  <div class="app-container oa-home">
    <!-- 各区块独立请求，首页仅负责布局 -->
    <div class="home-cards">
      <oa-home-attendance />
      <oa-home-contact-count v-if="checkPermi(['oa:contact:query'])" />
      <oa-home-discussion-count v-if="checkPermi(['oa:discussion:query'])" />
      <oa-home-task-count />
    </div>
    <el-row :gutter="16" class="home-panels">
      <el-col :lg="16" :md="24">
        <oa-home-announcement v-if="checkPermi(['oa:announcement:query'])" class="panel-gap" />
        <oa-home-plan v-if="checkPermi(['oa:plan:query'])" />
      </el-col>
      <el-col :lg="8" :md="24">
        <oa-home-task-statistics />
        <oa-home-calendar v-if="checkPermi(['oa:schedule:query'])" class="panel-gap" />
        <oa-home-note v-if="checkPermi(['oa:note:query'])" class="panel-gap" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { checkPermi } from '@/utils/permission'
import OaHomeAttendance from './components/OaHomeAttendance.vue'
import OaHomeContactCount from './components/OaHomeContactCount.vue'
import OaHomeDiscussionCount from './components/OaHomeDiscussionCount.vue'
import OaHomeTaskCount from './components/OaHomeTaskCount.vue'
import OaHomeAnnouncement from './components/OaHomeAnnouncement.vue'
import OaHomePlan from './components/OaHomePlan.vue'
import OaHomeTaskStatistics from './components/OaHomeTaskStatistics.vue'
import OaHomeCalendar from './components/OaHomeCalendar.vue'
import OaHomeNote from './components/OaHomeNote.vue'

export default {
  name: 'OaHome',
  components: {
    OaHomeAttendance,
    OaHomeContactCount,
    OaHomeDiscussionCount,
    OaHomeTaskCount,
    OaHomeAnnouncement,
    OaHomePlan,
    OaHomeTaskStatistics,
    OaHomeCalendar,
    OaHomeNote
  },
  methods: {
    checkPermi
  }
}
</script>

<style scoped>
.home-cards {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .home-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .home-cards {
    grid-template-columns: repeat(4, 1fr);
  }
}

.home-panels {
  margin-top: 16px;
}

.panel-gap {
  margin-bottom: 16px;
}
</style>
