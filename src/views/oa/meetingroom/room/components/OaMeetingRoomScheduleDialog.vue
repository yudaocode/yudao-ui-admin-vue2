<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1150px">
    <div v-loading="loading" class="oa-meeting-room-schedule">
      <!-- 最近五天 -->
      <div class="date-bar">
        <button
          v-for="date in dates"
          :key="date"
          type="button"
          class="date-btn"
          :class="{ active: selectedDate === date }"
          @click="selectedDate = date"
        >
          <div>{{ formatDate(date, 'MM-DD') }}</div>
          <div class="date-btn__week">{{ OA_WEEKDAY_NAMES[new Date(date).getDay()] }}</div>
        </button>
      </div>
      <div class="schedule-body">
        <!-- 半小时占用格 -->
        <div class="schedule-main">
          <div class="schedule-head">
            <div class="schedule-title">
              {{ formatDate(selectedDate, 'YYYY年MM月DD日') }} 预约情况
            </div>
            <!-- 预约状态说明 -->
            <div class="schedule-legend">
              <span class="legend-item">
                <i class="legend-block legend-block--free"></i>
                可预约
              </span>
              <span class="legend-item">
                <i class="legend-block legend-block--booked"></i>
                已预约
              </span>
              <span class="legend-item">
                <i class="legend-block legend-block--expired"></i>
                已过期
              </span>
            </div>
          </div>
          <div class="schedule-grid">
            <div v-for="period in [0, 1]" :key="period" class="period-row">
              <div class="period-label">{{ period === 0 ? '上午' : '下午' }}</div>
              <div class="period-content">
                <!-- 整点时间表头 -->
                <div class="hour-header">
                  <span v-for="hour in 12" :key="hour">
                    {{ String(period * 12 + hour - 1).padStart(2, '0') }}:00
                  </span>
                </div>
                <!-- 每格表示半小时 -->
                <div class="slot-row">
                  <el-tooltip
                    v-for="slot in slots.slice(period * 24, (period + 1) * 24)"
                    :key="slot.startTime"
                    :content="slot.title"
                    placement="top"
                  >
                    <div
                      class="slot-cell"
                      :class="{
                        expired: slot.expired,
                        booked: !slot.expired && slot.booking,
                        free: !slot.expired && !slot.booking
                      }"
                    ></div>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 当日预定信息 -->
        <div v-if="showBookings" class="booking-panel">
          <div class="booking-panel__title">{{ formatDate(selectedDate, 'MM 月 DD 日') }}已预约</div>
          <el-empty v-if="!dayBookings.length" description="暂无预约记录" :image-size="70" />
          <div class="booking-list">
            <div v-for="booking in dayBookings" :key="booking.id" class="booking-item">
              <div class="booking-item__head">
                <div class="booking-item__title">{{ booking.title }}</div>
                <dict-tag
                  v-if="booking.status !== undefined"
                  :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
                  :value="booking.status"
                />
              </div>
              <div class="booking-item__time">
                {{ formatDate(booking.startTime, 'HH:mm') }} -
                {{ formatDate(booking.endTime, 'HH:mm') }}
              </div>
              <div class="booking-item__meta">
                主持人：{{ booking.moderatorName }}　申请人：{{ booking.creatorName }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import * as MeetingRoomBookingApi from '@/api/oa/meetingroom/booking'
import Dialog from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { OA_WEEKDAY_NAMES } from '@/views/oa/utils/constants'

export default {
  name: 'OaMeetingRoomScheduleDialog',
  components: { Dialog },
  props: {
    showBookings: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      DICT_TYPE,
      OA_WEEKDAY_NAMES,
      dialogVisible: false,
      dialogTitle: '',
      loading: false,
      list: [],
      dates: [],
      selectedDate: 0
    }
  },
  computed: {
    // 当前日期的预定，包含跨日会议
    dayBookings() {
      const endTime = this.selectedDate + 24 * 60 * 60 * 1000
      return this.list.filter(
        booking => Number(booking.startTime) < endTime && Number(booking.endTime) > this.selectedDate
      )
    },
    // 生成半小时占用格，审批中的预定也占用时段
    slots() {
      const result = []
      for (let index = 0; index < 48; index++) {
        const startTime = this.selectedDate + index * 30 * 60 * 1000
        const endTime = startTime + 30 * 60 * 1000
        const booking = this.dayBookings.find(
          item => Number(item.startTime) < endTime && Number(item.endTime) > startTime
        )
        const expired = endTime <= Date.now()
        const title =
          formatDate(startTime, 'HH:mm') +
          '-' +
          formatDate(endTime, 'HH:mm') +
          ' - ' +
          (expired
            ? '已过期'
            : booking
              ? booking.title + '（' + booking.moderatorName + '）'
              : '可预约')
        result.push({ startTime: startTime, booking: booking, expired: expired, title: title })
      }
      return result
    }
  },
  methods: {
    formatDate,
    // 打开预定信息
    open(roomId, roomName) {
      // 1. 打开弹窗，初始化最近五天及当前选中日期
      this.dialogVisible = true
      this.dialogTitle = roomName + ' - 预约信息'
      const startTime = new Date()
      startTime.setHours(0, 0, 0, 0)
      this.dates = Array.from(
        { length: 5 },
        (_, index) => startTime.getTime() + index * 24 * 60 * 60 * 1000
      )
      this.selectedDate = this.dates[0]
      this.list = []
      // 2. 查询五天内的有效预定，供时段占用和当日列表展示
      this.loading = true
      MeetingRoomBookingApi.getMeetingRoomBookingSchedule(
        roomId,
        formatDate(startTime),
        formatDate(startTime.getTime() + 5 * 24 * 60 * 60 * 1000)
      ).then(response => {
        this.list = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.oa-meeting-room-schedule {
  .date-bar {
    display: flex;
    gap: 8px;
    padding-bottom: 12px;
    margin-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;

    .date-btn {
      padding: 8px 20px;
      text-align: center;
      cursor: pointer;
      background: #f5f7fa;
      border: 0;
      border-radius: 4px;

      &.active {
        color: #fff;
        background: #409eff;
      }

      .date-btn__week {
        margin-top: 4px;
        font-size: 12px;
      }
    }
  }

  .schedule-body {
    display: flex;
    gap: 20px;
  }

  .schedule-main {
    flex: 1;
    min-width: 0;
  }

  .schedule-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  .schedule-title {
    font-size: 16px;
    font-weight: 600;
  }

  .schedule-legend {
    display: flex;
    flex-shrink: 0;
    gap: 16px;
    font-size: 13px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-block {
      width: 14px;
      height: 14px;
      display: inline-block;

      &--free {
        background: #fff;
        border: 1px solid #dcdfe6;
      }

      &--booked {
        background: #67c23a;
      }

      &--expired {
        background: #e4e7ed;
      }
    }
  }

  .schedule-grid {
    overflow: hidden;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }

  .period-row {
    display: flex;

    & + .period-row {
      border-top: 1px solid #e4e7ed;
    }
  }

  .period-label {
    width: 56px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    background: #fafafa;
    border-right: 1px solid #e4e7ed;
  }

  .period-content {
    flex: 1;
    min-width: 0;
  }

  .hour-header {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding: 10px 6px;
    font-size: 12px;
    font-weight: 600;
    color: #909399;
    text-align: center;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
  }

  .slot-row {
    display: grid;
    grid-template-columns: repeat(24, minmax(0, 1fr));
    gap: 2px;
    padding: 10px 6px;
  }

  .slot-cell {
    height: 36px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;

    &.free {
      background: #fff;
    }

    &.booked {
      background: #67c23a;
    }

    &.expired {
      background: #e4e7ed;
    }
  }

  .booking-panel {
    width: 280px;
    flex-shrink: 0;
    padding-left: 16px;
    border-left: 1px solid #e4e7ed;

    .booking-panel__title {
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .booking-list {
    max-height: 400px;
    overflow-y: auto;

    .booking-item {
      padding: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;

      & + .booking-item {
        margin-top: 12px;
      }

      .booking-item__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }

      .booking-item__title {
        min-width: 0;
        font-weight: 500;
        color: #409eff;
        word-break: break-all;
      }

      .booking-item__time {
        margin-bottom: 8px;
      }

      .booking-item__meta {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
