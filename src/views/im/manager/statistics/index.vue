<template>
  <div class="im-statistics">
    <div class="im-statistics__hero"><div class="im-statistics__hero-title">IM 数据看板</div><div class="im-statistics__hero-desc">用户、群组与消息的整体运营概览</div></div>
    <OverviewCards
      :overview="overview"
      :loading="overviewLoading"
    />
    <el-row :gutter="16"><el-col
      :xl="12"
      :lg="12"
      :md="24"
      :sm="24"
      :xs="24"
    ><MessageTrendChart /></el-col><el-col
      :xl="12"
      :lg="12"
      :md="24"
      :sm="24"
      :xs="24"
    ><UserTrendChart /></el-col></el-row>
    <el-row :gutter="16"><el-col
      :xl="8"
      :lg="8"
      :md="24"
      :sm="24"
      :xs="24"
    ><MessageTypeChart /></el-col><el-col
      :xl="8"
      :lg="8"
      :md="24"
      :sm="24"
      :xs="24"
    ><GroupSizeChart /></el-col><el-col
      :xl="8"
      :lg="8"
      :md="24"
      :sm="24"
      :xs="24"
    ><TopSendersChart /></el-col></el-row>
  </div>
</template>

<script>
import { getStatisticsOverview } from '@/api/im/manager/statistics'
import OverviewCards from './components/OverviewCards.vue'
import MessageTrendChart from './components/MessageTrendChart.vue'
import UserTrendChart from './components/UserTrendChart.vue'
import MessageTypeChart from './components/MessageTypeChart.vue'
import GroupSizeChart from './components/GroupSizeChart.vue'
import TopSendersChart from './components/TopSendersChart.vue'

export default {
  name: 'ImStatistics',
  components: { OverviewCards, MessageTrendChart, UserTrendChart, MessageTypeChart, GroupSizeChart, TopSendersChart },
  data() {
    return { overview: undefined, overviewLoading: false }
  },
  async mounted() {
    this.overviewLoading = true
    try {
      const response = await getStatisticsOverview()
      this.overview = response.data
    } finally {
      this.overviewLoading = false
    }
  }
}
</script>

<style scoped>
.im-statistics { padding: 16px; }
.im-statistics__hero { padding: 4px 2px; margin-bottom: 16px; }
.im-statistics__hero-title { color: #303133; font-size: 18px; font-weight: 600; line-height: 1.3; }
.im-statistics__hero-desc { margin-top: 6px; color: #909399; font-size: 13px; }
</style>
