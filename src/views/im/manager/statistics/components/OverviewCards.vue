<template>
  <el-row :gutter="16">
    <el-col
      v-for="card in cards"
      :key="card.title"
      :xl="6"
      :lg="6"
      :md="12"
      :sm="24"
      :xs="24"
    ><el-card
      shadow="never"
      class="kpi-card"
    ><el-skeleton
      :loading="loading"
      :rows="2"
      animated
    ><div class="card-content"><div
      class="card-icon"
      :style="{ background: card.gradient }"
    ><i :class="card.icon" /></div><div class="card-main"><div class="card-title">{{ card.title }}</div><div class="card-value"><CountTo
      :start-val="0"
      :end-val="card.value"
      :duration="1500"
    /><span
      v-if="card.suffix"
      class="card-suffix"
    >{{ card.suffix }}</span></div><div class="card-meta"><span>{{ card.metaLabel }}</span><span
      class="meta-value"
      :class="card.metaClass"
    >{{ card.metaValue }}</span></div></div></div></el-skeleton></el-card></el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

function calcRatio(today, yesterday) {
  if (!yesterday) return { label: '无昨日数据', cls: 'muted' }
  const diff = ((today - yesterday) / yesterday) * 100
  return { label: (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%', cls: diff >= 0 ? 'positive' : 'negative' }
}

export default {
  name: 'ImStatisticsOverviewCards',
  components: { CountTo },
  props: {
    overview: { type: Object, default: undefined },
    loading: { type: Boolean, default: false }
  },
  computed: {
    cards() {
      const value = this.overview || {}
      const totalToday = (value.privateMessageToday == null ? 0 : value.privateMessageToday) + (value.groupMessageToday == null ? 0 : value.groupMessageToday)
      const totalYesterday = (value.privateMessageYesterday == null ? 0 : value.privateMessageYesterday) + (value.groupMessageYesterday == null ? 0 : value.groupMessageYesterday)
      const ratio = calcRatio(totalToday, totalYesterday)
      return [
        { title: '总用户', value: value.totalUser == null ? 0 : value.totalUser, icon: 'el-icon-user', gradient: 'linear-gradient(135deg, #5b9cff 0%, #409eff 100%)', metaLabel: '今日新增', metaValue: '+' + (value.newUserToday == null ? 0 : value.newUserToday), metaClass: 'positive' },
        { title: '总群组', value: value.totalGroup == null ? 0 : value.totalGroup, icon: 'el-icon-chat-dot-round', gradient: 'linear-gradient(135deg, #5bd6a0 0%, #67c23a 100%)', metaLabel: '今日新增', metaValue: '+' + (value.newGroupToday == null ? 0 : value.newGroupToday), metaClass: 'positive' },
        { title: '日活用户', value: value.activeUserDaily == null ? 0 : value.activeUserDaily, icon: 'el-icon-timer', gradient: 'linear-gradient(135deg, #ffc46b 0%, #e6a23c 100%)', metaLabel: '周 / 月活', metaValue: (value.activeUserWeekly == null ? 0 : value.activeUserWeekly) + ' / ' + (value.activeUserMonthly == null ? 0 : value.activeUserMonthly), metaClass: 'muted' },
        { title: '今日消息', value: totalToday, suffix: '(私 ' + (value.privateMessageToday == null ? 0 : value.privateMessageToday) + ' / 群 ' + (value.groupMessageToday == null ? 0 : value.groupMessageToday) + ')', icon: 'el-icon-message', gradient: 'linear-gradient(135deg, #b794f6 0%, #805ad5 100%)', metaLabel: '环比昨日', metaValue: ratio.label, metaClass: ratio.cls }
      ]
    }
  }
}
</script>

<style scoped>
.kpi-card { margin-bottom: 16px; border-radius: 8px; transition: box-shadow .2s ease, transform .2s ease; }
.kpi-card:hover { box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%); transform: translateY(-2px); }
.card-content { display: flex; align-items: center; }
.card-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 48px; height: 48px; margin-right: 14px; border-radius: 10px; color: #fff; font-size: 24px; }
.card-main { min-width: 0; flex: 1; }
.card-title { color: #909399; font-size: 13px; }
.card-value { margin-top: 6px; color: #303133; font-size: 24px; font-weight: 600; line-height: 1; }
.card-suffix { margin-left: 6px; color: #c0c4cc; font-size: 12px; font-weight: normal; }
.card-meta { display: flex; align-items: center; margin-top: 8px; color: #c0c4cc; font-size: 12px; }
.meta-value { margin-left: 6px; font-weight: 500; }
.positive { color: #67c23a; }
.negative { color: #f56c6c; }
.muted { color: #909399; }
</style>
