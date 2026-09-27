<template>
  <div class="app-container oa-schedule-calendar">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="日程范围">
        <el-checkbox v-model="queryParams.includeMine" @change="handleQuery">我的日程</el-checkbox>
        <el-checkbox v-model="queryParams.includeReceived" @change="handleQuery">共享给我</el-checkbox>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入日程标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日程类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择日程类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select
          v-model="queryParams.priority"
          placeholder="请选择优先级"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in priorityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:schedule:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 日程日历 -->
    <div class="calendar-toolbar">
      <div class="calendar-toolbar__left">
        <el-button size="small" @click="changePeriod(-1)">上一{{ viewLabel }}</el-button>
        <el-button size="small" @click="calendarDate = new Date()">今天</el-button>
        <el-button size="small" @click="changePeriod(1)">下一{{ viewLabel }}</el-button>
        <span class="calendar-title">{{ calendarTitle }}</span>
      </div>
      <el-radio-group v-model="calendarView" size="small">
        <el-radio-button label="month">月</el-radio-button>
        <el-radio-button label="week">周</el-radio-button>
        <el-radio-button label="day">日</el-radio-button>
      </el-radio-group>
    </div>
    <el-calendar
      v-if="calendarView === 'month'"
      v-model="calendarDate"
      v-loading="calendarLoading"
      class="oa-schedule-calendar__month"
    >
      <template slot="dateCell" slot-scope="{ data }">
        <div class="calendar-cell" @click.stop="handleCalendarDateChange(data.day)">
          <div class="calendar-cell__day">{{ data.day.slice(8) }}</div>
          <button
            v-for="schedule in getCalendarDaySchedules(data.day).slice(0, 3)"
            :key="schedule.id"
            type="button"
            class="calendar-schedule"
            :style="getPriorityStyle(schedule.priority)"
            @click.stop="openDetail(schedule.id)"
          >
            {{
              dayjs(schedule.startTime).isSame(data.day, 'day')
                ? formatDate(schedule.startTime, 'HH:mm')
                : '持续'
            }}
            {{ schedule.title }}
          </button>
          <el-button
            v-if="getCalendarDaySchedules(data.day).length > 3"
            type="text"
            @click.stop="openDay(data.day)"
          >还有 {{ getCalendarDaySchedules(data.day).length - 3 }} 项</el-button>
        </div>
      </template>
    </el-calendar>
    <div v-else v-loading="calendarLoading" class="calendar-week">
      <div
        class="calendar-week__grid"
        :style="{ gridTemplateColumns: 'repeat(' + visibleDates.length + ', minmax(140px, 1fr))' }"
      >
        <div
          v-for="date in visibleDates"
          :key="date"
          class="calendar-week__column"
        >
          <el-button type="text" class="calendar-week__date" @click="openDay(date)">
            {{ dayjs(date).format('MM-DD') }} {{ OA_WEEKDAY_NAMES[dayjs(date).day()] }}
          </el-button>
          <el-empty
            v-if="!getCalendarDaySchedules(date).length"
            description="暂无日程"
            :image-size="40"
          />
          <el-button
            v-for="schedule in getCalendarDaySchedules(date)"
            :key="schedule.id"
            type="text"
            class="calendar-schedule calendar-schedule--block"
            :style="getPriorityStyle(schedule.priority)"
            @click="openDetail(schedule.id)"
          >
            {{
              dayjs(schedule.startTime).isSame(date, 'day')
                ? formatDate(schedule.startTime, 'HH:mm')
                : '持续'
            }}
            {{ schedule.title }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加或修改日程对话框 -->
    <oa-schedule-form ref="formRef" @success="getCalendarList" />
    <!-- 日程详情对话框 -->
    <oa-schedule-detail ref="detailRef" @edit="openForm('update', $event)" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import * as ScheduleApi from '@/api/oa/schedule'
import { DICT_TYPE, getDictObj, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { getAllPageItems } from '@/utils/page'
import { OA_WEEKDAY_NAMES } from '@/views/oa/utils/constants-collab'
import OaScheduleForm from '../list/components/OaScheduleForm.vue'
import OaScheduleDetail from '../list/components/OaScheduleDetail.vue'

/** Element UI 标签色与优先级字典 colorType 的对应颜色 */
const PRIORITY_COLORS = {
  primary: '#409eff',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  info: '#909399'
}

export default {
  name: 'OaScheduleCalendar',
  components: { OaScheduleForm, OaScheduleDetail },
  data() {
    return {
      DICT_TYPE,
      OA_WEEKDAY_NAMES,
      dayjs,
      queryParams: {
        includeMine: true,
        includeReceived: true,
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        type: undefined,
        priority: undefined
      },
      calendarLoading: false,
      calendarDate: new Date(),
      calendarView: 'month',
      calendarList: []
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SCHEDULE_TYPE)
    },
    priorityOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PRIORITY)
    },
    viewLabel() {
      return { month: '月', week: '周', day: '日' }[this.calendarView]
    },
    calendarRange() {
      const date = dayjs(this.calendarDate)
      let beginTime = date.startOf('day')
      let endTime = date.endOf('day')
      if (this.calendarView === 'month') {
        // 月历会补齐相邻月份的日期；预留首尾一周，兼容不同的周起始日
        beginTime = date.startOf('month').subtract(7, 'day')
        endTime = date.endOf('month').add(7, 'day')
      }
      if (this.calendarView === 'week') {
        beginTime = beginTime.subtract((beginTime.day() + 6) % 7, 'day')
        endTime = endTime.add(6 - ((endTime.day() + 6) % 7), 'day')
      }
      return [beginTime.format('YYYY-MM-DD HH:mm:ss'), endTime.format('YYYY-MM-DD HH:mm:ss')]
    },
    visibleDates() {
      return Array.from({ length: this.calendarView === 'week' ? 7 : 1 }, (_, index) =>
        dayjs(this.calendarRange[0]).add(index, 'day').format('YYYY-MM-DD')
      )
    },
    calendarTitle() {
      return this.calendarView === 'month'
        ? dayjs(this.calendarDate).format('YYYY 年 MM 月')
        : this.calendarRange[0].slice(0, 10) + ' ~ ' + this.calendarRange[1].slice(0, 10)
    },
    calendarScheduleMap() {
      const result = new Map()
      // 跨天日程分别归入覆盖的每个自然日
      this.calendarList.forEach(schedule => {
        let currentDate = dayjs(schedule.startTime).startOf('day')
        let endDate = dayjs(schedule.endTime).startOf('day')
        // 跨天日程限制在当前显示范围内
        if (currentDate.isBefore(this.calendarRange[0], 'day')) {
          currentDate = dayjs(this.calendarRange[0])
        }
        if (endDate.isAfter(this.calendarRange[1], 'day')) {
          endDate = dayjs(this.calendarRange[1]).startOf('day')
        }
        while (!currentDate.isAfter(endDate)) {
          const date = currentDate.format('YYYY-MM-DD')
          result.set(date, [...(result.get(date) || []), schedule])
          currentDate = currentDate.add(1, 'day')
        }
      })
      return result
    }
  },
  watch: {
    calendarDate() {
      this.handleCalendarRangeChange()
    },
    calendarView() {
      this.handleCalendarRangeChange()
    }
  },
  created() {
    this.lastCalendarRangeKey = this.calendarRange.join(',')
    this.getCalendarList()
  },
  methods: {
    formatDate,
    /** 视图或显示区间变化时重新查询（同一周期内去重） */
    handleCalendarRangeChange() {
      const key = this.calendarRange.join(',')
      if (key === this.lastCalendarRangeKey) return
      this.lastCalendarRangeKey = key
      this.getCalendarList()
    },
    /** 查询与当前视图时间范围相交的日程 */
    getCalendarList() {
      const params = Object.assign({}, this.queryParams, { overlapTime: [...this.calendarRange] })
      this.calendarLoading = true
      return getAllPageItems((pageNo, pageSize) =>
        ScheduleApi.getSchedulePage(Object.assign({}, params, { pageNo, pageSize }))
      ).then(list => {
        this.calendarList = list
      }).finally(() => {
        this.calendarLoading = false
      })
    },
    /** 切换上一个或下一个显示周期 */
    changePeriod(direction) {
      this.calendarDate = dayjs(this.calendarDate).add(direction, this.calendarView).toDate()
    },
    /** 展开指定日期的全部日程 */
    openDay(date) {
      this.calendarDate = dayjs(date).toDate()
      this.calendarView = 'day'
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getCalendarList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.includeMine = true
      this.queryParams.includeReceived = true
      return this.handleQuery()
    },
    /** 日历优先级颜色与列表字典标签保持一致 */
    getPriorityStyle(priority) {
      const dict = getDictObj(DICT_TYPE.OA_PRIORITY, priority)
      if (dict && dict.cssClass && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(dict.cssClass)) {
        return { backgroundColor: dict.cssClass, color: '#fff' }
      }
      const color = PRIORITY_COLORS[(dict && dict.colorType) || 'primary'] || PRIORITY_COLORS.primary
      return {
        backgroundColor: color + '1a',
        color: color
      }
    },
    /** 获得指定日期的日程 */
    getCalendarDaySchedules(date) {
      return this.calendarScheduleMap.get(date) || []
    },
    handleCalendarDateChange(date) {
      this.calendarDate = dayjs(date).toDate()
    },
    openDetail(id) {
      this.$refs.detailRef.open(id)
    },
    openForm(type, id) {
      this.$refs.formRef.open(type, id)
    }
  }
}
</script>

<style scoped>
.calendar-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.calendar-toolbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calendar-title {
  margin-left: 4px;
}

.oa-schedule-calendar__month >>> .el-calendar__header {
  display: none;
}

.oa-schedule-calendar__month >>> .el-calendar-day {
  height: 110px;
  padding: 6px;
}

.calendar-cell {
  height: 100%;
  overflow: hidden;
}

.calendar-cell__day {
  margin-bottom: 4px;
}

.calendar-schedule {
  display: block;
  width: 100%;
  margin-bottom: 3px;
  padding: 2px 4px;
  border: 0;
  border-radius: 3px;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-week {
  overflow-x: auto;
}

.calendar-week__grid {
  display: grid;
}

.calendar-week__column {
  min-height: 240px;
  padding: 12px;
  border: 1px solid #ebeef5;
}

.calendar-week__date {
  margin-bottom: 12px;
}

.calendar-schedule--block {
  margin-left: 0;
  margin-bottom: 8px;
  padding: 4px;
  white-space: normal;
}
</style>
