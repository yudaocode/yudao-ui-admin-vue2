<!-- 排班日历 - 按个人视图 -->
<template>
  <div>
    <el-form :inline="true" label-width="80px" size="small" @submit.native.prevent>
      <el-form-item label="人员">
        <user-select-v2
          v-model="userId"
          placeholder="请输入人员姓名搜索"
          class="user-select"
          @change="onUserQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="onUserQuery">查询</el-button>
      </el-form-item>
    </el-form>

    <calendar-legend />
    <el-calendar v-model="currentDate" v-loading="loading">
      <template slot="dateCell" slot-scope="{ data }">
        <calendar-date-cell
          :day="data.day"
          :holiday-set="holidaySet"
          :calendar-day-map="calendarDayMap"
        />
      </template>
    </el-calendar>
  </div>
</template>

<script>
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import CalendarDateCell from './CalendarDateCell.vue'
import CalendarLegend from './CalendarLegend.vue'
import { useCalendar } from './useCalendar'

export default {
  name: 'UserView',
  components: { UserSelectV2, CalendarDateCell, CalendarLegend },
  mixins: [useCalendar()],
  data() {
    return { userId: undefined }
  },
  watch: {
    currentDate() {
      this.watchMonth(this.doFetch)
    }
  },
  mounted() {
    this.loadHolidays()
  },
  methods: {
    doFetch() {
      if (this.userId == null) return
      return this.fetchCalendar({ queryType: 'USER', userId: this.userId })
    },
    onUserQuery() {
      return this.doFetch()
    }
  }
}
</script>

<style scoped>
.user-select { width: 200px; }
</style>
