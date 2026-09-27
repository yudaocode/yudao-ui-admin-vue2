<template>
  <el-card shadow="never" class="calendar-panel">
    <div slot="header" class="home-card__title">日历</div>
    <div v-loading="loading">
      <el-calendar v-model="calendarDate">
        <template slot="dateCell" slot-scope="{ data }">
          <div class="calendar-cell" @click.stop="selectDate(data.day)">
            <span class="calendar-cell__day">{{ data.day.slice(8) }}</span>
            <span class="calendar-cell__lunar">{{ getHrmLunarDateInfo(data.day).dayText }}</span>
            <i v-if="calendarDateSet.has(data.day)" class="calendar-cell__dot" />
          </div>
        </template>
      </el-calendar>

      <div class="selected-date">
        <div class="selected-date__day">{{ formatDay(selectedDate) }}</div>
        <div>
          <div>{{ formatWeekday(selectedDate) }}</div>
          <div class="selected-date__lunar">{{ getHrmLunarDateInfo(selectedDate).monthDayText }}</div>
        </div>
        <el-button
          v-hasPermi="['hrm:employee:personal-note:create']"
          class="selected-date__add"
          type="text"
          icon="el-icon-plus"
          @click="openPersonalNote"
        >添加备忘录</el-button>
      </div>

      <div class="events-title">当天事项</div>
      <div class="events-list">
        <div
          v-for="item in visibleDayItems"
          :key="`${item.type}-${item.personalNoteId || item.typeId || item.content}`"
          class="event-row"
        >
          <el-tag size="small" :type="eventTagType(item.type)" effect="light">{{ item.typeName }}</el-tag>
          <span v-if="shouldShowItemTime(item)" class="event-row__time">{{ formatTime(item.eventTime) }}</span>
          <button
            :class="['event-row__content', { 'event-row__content--clickable': canOpenItem(item) }]"
            type="button"
            @click="handleItemClick(item)"
          >{{ item.content }}</button>
          <el-button
            v-if="item.personalNoteId"
            v-hasPermi="['hrm:employee:personal-note:delete']"
            type="text"
            class="event-row__delete"
            @click="handleDeletePersonalNote(item.personalNoteId)"
          >删除</el-button>
        </div>
        <el-button
          v-if="dayItems.length > 4 && !showAllEvents"
          type="text"
          @click="showAllEvents = true"
        >查看更多事项</el-button>
        <el-empty v-if="dayItems.length === 0" :image-size="72" description="暂无数据" />
      </div>
    </div>
    <personal-note-form ref="personalNoteForm" @success="refresh" />
  </el-card>
</template>

<script>
import { deleteEmployeePersonalNote } from '@/api/hrm/employee/personal-note'
import { HrmHomeCalendarItemType } from '@/views/hrm/utils/constants'
import { getHrmLunarDateInfo } from '@/views/hrm/utils/format'
import PersonalNoteForm from './PersonalNoteForm.vue'

function pad(value) {
  return String(value).padStart(2, '0')
}

function toDate(value) {
  if (value instanceof Date) return value
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split('-').map(Number)
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date(value)
}

function formatDateKey(value) {
  const date = toDate(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default {
  name: 'HrmHomeCalendar',
  components: { PersonalNoteForm },
  props: {
    getCalendarItems: { type: Function, required: true },
    itemFilter: { type: Function, default: undefined },
    isItemClickable: { type: Function, default: undefined },
    showItemTime: { type: Function, default: undefined }
  },
  data() {
    const now = new Date()
    return {
      loading: false,
      calendarDate: now,
      selectedDate: formatDateKey(now),
      calendarItems: [],
      showAllEvents: false
    }
  },
  computed: {
    calendarDateSet() {
      return new Set(this.calendarItems.map(item => item.date))
    },
    dayItems() {
      return this.calendarItems.filter(item => item.date === this.selectedDate)
    },
    visibleDayItems() {
      return this.showAllEvents ? this.dayItems : this.dayItems.slice(0, 4)
    }
  },
  watch: {
    async calendarDate(date, oldDate) {
      this.selectedDate = formatDateKey(date)
      this.showAllEvents = false
      if (oldDate && (date.getFullYear() !== oldDate.getFullYear() || date.getMonth() !== oldDate.getMonth())) {
        await this.refresh()
      }
    }
  },
  methods: {
    getHrmLunarDateInfo,
    /** 刷新当前月份的日历 */
    async refresh() {
      this.loading = true
      try {
        const month = this.calendarDate
        const response = await this.getCalendarItems({
          startDate: formatDateKey(new Date(month.getFullYear(), month.getMonth(), 1)),
          endDate: formatDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0))
        })
        const items = response.data
        this.calendarItems = this.itemFilter ? items.filter(this.itemFilter) : items
      } finally {
        this.loading = false
      }
    },
    /** 选择日期 */
    selectDate(date) {
      this.selectedDate = date
      this.calendarDate = toDate(date)
    },
    canOpenItem(item) {
      return !!this.isItemClickable && this.isItemClickable(item) === true
    },
    shouldShowItemTime(item) {
      return !!item.eventTime && (this.showItemTime ? this.showItemTime(item) : true)
    },
    handleItemClick(item) {
      if (this.canOpenItem(item)) this.$emit('item-click', item)
    },
    openPersonalNote() {
      if (this.$refs.personalNoteForm) this.$refs.personalNoteForm.open(this.selectedDate)
    },
    /** 删除个人备忘 */
    async handleDeletePersonalNote(id) {
      await this.$modal.confirm('是否删除所选中数据？')
      await deleteEmployeePersonalNote(id)
      this.$modal.msgSuccess('删除成功')
      await this.refresh()
    },
    formatDay(value) {
      return pad(toDate(value).getDate())
    },
    formatWeekday(value) {
      return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][toDate(value).getDay()]
    },
    formatTime(value) {
      const date = toDate(value)
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`
    },
    /** 获取日历事项标签类型 */
    eventTagType(type) {
      switch (type) {
        case HrmHomeCalendarItemType.NOTE:
        case HrmHomeCalendarItemType.RECRUIT:
          return 'primary'
        case HrmHomeCalendarItemType.BIRTHDAY:
          return 'danger'
        case HrmHomeCalendarItemType.ENTRY:
        case HrmHomeCalendarItemType.REGULAR:
          return 'success'
        case HrmHomeCalendarItemType.LEAVE:
          return 'warning'
        default:
          return 'info'
      }
    }
  }
}
</script>

<style scoped>
.home-card__title { color: #303133; font-size: 16px; font-weight: 600; }
.calendar-cell { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.calendar-cell__day { line-height: 18px; }
.calendar-cell__lunar { max-width: 100%; overflow: hidden; color: #909399; font-size: 10px; line-height: 14px; text-overflow: ellipsis; white-space: nowrap; }
.calendar-cell__dot { position: absolute; right: 3px; bottom: 3px; width: 5px; height: 5px; border-radius: 50%; background: #409eff; }
.selected-date { margin-top: 16px; display: flex; align-items: center; padding: 10px 14px; border-radius: 4px; background: #ecf5ff; }
.selected-date__day { margin-right: 10px; color: #303133; font-size: 38px; font-weight: 700; line-height: 1; }
.selected-date__lunar { margin-top: 4px; color: #909399; font-size: 12px; }
.selected-date__add { margin-left: auto; }
.events-title { margin-top: 18px; font-weight: 600; }
.events-list { min-height: 132px; margin-top: 8px; }
.event-row { min-height: 32px; display: flex; align-items: center; gap: 8px; }
.event-row__time { flex: none; color: #909399; font-size: 12px; font-variant-numeric: tabular-nums; }
.event-row__content { min-width: 0; flex: 1; overflow: hidden; padding: 0; border: 0; background: transparent; color: #606266; font: inherit; text-align: left; text-overflow: ellipsis; white-space: nowrap; cursor: default; }
.event-row__content--clickable { color: #409eff; cursor: pointer; }
.event-row__content--clickable:hover { text-decoration: underline; }
.event-row__delete { color: #f56c6c; }
.calendar-panel >>> .el-calendar__header { padding: 8px 4px 12px; }
.calendar-panel >>> .el-calendar__body { padding: 0; }
.calendar-panel >>> .el-calendar-table .el-calendar-day { height: 42px; padding: 0; }
</style>
