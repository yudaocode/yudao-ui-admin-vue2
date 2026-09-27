<template>
  <oa-home-panel title="行事历" v-loading="loading">
    <template slot="actions">
      <el-button type="text" @click="$router.push('/oa/schedule/calendar')">日程管理</el-button>
    </template>

    <div v-if="loadError" class="load-error">
      加载失败，
      <el-button type="text" @click="getList">重新加载</el-button>
    </div>
    <el-calendar v-model="selectedDate" class="home-calendar">
      <template slot="dateCell" slot-scope="{ data }">
        <div class="calendar-cell">
          <span>{{ Number(data.day.slice(8)) }}</span>
          <i v-if="hasSchedule(data.day)" class="schedule-dot" />
        </div>
      </template>
    </el-calendar>

    <!-- 选中日期的日程 -->
    <div class="selected-panel">
      <div class="selected-title">{{ selectedDateTitle }}</div>
      <el-empty v-if="selectedSchedules.length === 0" :image-size="48" description="暂无日程" />
      <div
        v-for="item in selectedSchedules"
        v-else
        :key="item.id"
        class="schedule-row"
      >
        <span class="schedule-time">
          {{
            dayjs(item.startTime).isSame(selectedDate, 'day')
              ? formatDate(item.startTime, 'HH:mm')
              : '持续'
          }}
        </span>
        <span class="schedule-title">{{ item.title }}</span>
      </div>
    </div>
  </oa-home-panel>
</template>

<script>
import OaHomePanel from './OaHomePanel.vue'
import * as ScheduleApi from '@/api/oa/schedule'
import dayjs from 'dayjs'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaHomeCalendar',
  components: { OaHomePanel },
  data() {
    return {
      dayjs,
      loading: false,
      loadError: false,
      schedules: [],
      selectedDate: new Date()
    }
  },
  computed: {
    /** 选中月份标识，跨月时重新查询 */
    selectedMonth() {
      return dayjs(this.selectedDate).format('YYYY-MM')
    },
    /** 选中日期标识 */
    selectedDateKey() {
      return dayjs(this.selectedDate).format('YYYY-MM-DD')
    },
    /** 选中日期标题 */
    selectedDateTitle() {
      return dayjs(this.selectedDate).format('MM 月 DD 日日程')
    },
    /** 选中日期的日程列表 */
    selectedSchedules() {
      return this.schedules.filter(
        item => dayjs(item.startTime).format('YYYY-MM-DD') === this.selectedDateKey
      )
    }
  },
  watch: {
    selectedMonth() {
      this.getList()
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatDate,
    /** 判断日期是否存在日程 */
    hasSchedule(date) {
      const dateKey = typeof date === 'string' ? date : dayjs(date).format('YYYY-MM-DD')
      return this.schedules.some(item => dayjs(item.startTime).format('YYYY-MM-DD') === dateKey)
    },
    /** 查询选中月份的全部日程，避免只展示第一页 */
    getList() {
      this.loading = true
      this.loadError = false
      const queryParams = { pageNo: 1, pageSize: 200 }
      const list = []
      const fetchPage = () => {
        return ScheduleApi.getMySchedulePage(queryParams).then(response => {
          const data = response.data
          list.push(...data.list)
          queryParams.pageNo++
          if (data.list.length !== 0 && list.length < data.total) {
            return fetchPage()
          }
          this.schedules = list
        })
      }
      return fetchPage().catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.load-error {
  margin-bottom: 12px;
  font-size: 13px;
  color: #f56c6c;
}

.calendar-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.schedule-dot {
  position: absolute;
  right: 3px;
  bottom: 2px;
  width: 5px;
  height: 5px;
  background: #409eff;
  border-radius: 50%;
}

.selected-panel {
  min-height: 90px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.selected-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 30px;
}

.schedule-time {
  font-size: 12px;
  color: #409eff;
}

.schedule-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-calendar ::v-deep .el-calendar__body {
  padding: 10px 0 0;
}

.home-calendar ::v-deep .el-calendar-table thead th {
  padding: 6px 0;
}

.home-calendar ::v-deep .el-calendar-table .el-calendar-day {
  height: 34px;
  padding: 2px;
}

.home-calendar ::v-deep .el-calendar__header {
  justify-content: center;
  padding: 0 0 10px;
  border: 0;
}
</style>
