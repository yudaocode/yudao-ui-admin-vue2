<template>
  <div
    v-loading="loading"
    class="home-card home-card--blue"
    @click="$router.push('/oa/attendance/my')"
  >
    <!-- 打卡入口随标题布局，避免绝对定位与说明文字重叠 -->
    <div class="home-card__main">
      <div class="home-card__title">
        <span>今日考勤</span>
        <el-button
          :loading="clockLoading"
          class="clock-button"
          type="text"
          @click.stop="handleClock"
        >立即打卡</el-button>
      </div>
      <div v-if="loadError" class="home-card__error" @click.stop="getList">
        加载失败，点击重试
      </div>
      <div v-else class="home-card__value">{{ attendanceText }}</div>
      <div class="home-card__desc">{{ attendanceDescription }}</div>
    </div>
    <div class="home-card__icon"><i class="el-icon-date" /></div>
  </div>
</template>

<script>
import * as AttendanceApi from '@/api/oa/attendance'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaHomeAttendance',
  data() {
    return {
      loading: false,
      loadError: false,
      clockLoading: false,
      attendance: undefined
    }
  },
  computed: {
    /** 今日最近打卡类型 */
    attendanceText() {
      if (!this.attendance || !this.attendance.type) {
        return '未打卡'
      }
      return getDictLabel(DICT_TYPE.OA_ATTENDANCE_TYPE, this.attendance.type)
    },
    /** 今日最近打卡说明 */
    attendanceDescription() {
      if (!this.attendance || !this.attendance.attendanceTime) {
        return '今天还没有考勤记录'
      }
      const status = getDictLabel(DICT_TYPE.OA_ATTENDANCE_STATUS, this.attendance.status)
      return formatDate(this.attendance.attendanceTime, 'HH:mm:ss') + ' · ' + status
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatDate,
    /** 查询当前区块数据 */
    getList() {
      if (this.loading) return Promise.resolve()
      this.loading = true
      this.loadError = false
      return AttendanceApi.getMyTodayAttendanceList().then(response => {
        const list = response.data || []
        this.attendance = list.slice(-1)[0]
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
      })
    },
    /** 打卡后只刷新考勤卡片 */
    handleClock() {
      if (this.clockLoading) return Promise.resolve()
      this.clockLoading = true
      return AttendanceApi.clockAttendance().then(() => {
        this.$modal.msgSuccess('打卡成功')
        return this.getList()
      }).finally(() => {
        this.clockLoading = false
      })
    }
  }
}
</script>

<style scoped>
.home-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 116px;
  padding: 20px;
  overflow: hidden;
  color: #fff;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  transition: transform 0.2s;
}

.home-card:hover {
  transform: translateY(-2px);
}

.home-card--blue {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.home-card__main {
  flex: 1;
  min-width: 0;
}

.home-card__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 12px;
  margin-bottom: 4px;
  font-size: 14px;
  opacity: 0.9;
}

.clock-button {
  padding: 0;
  font-size: 12px;
  color: #fff;
}

.home-card__value {
  overflow: hidden;
  font-size: 28px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-card__desc {
  margin-top: 4px;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.85;
}

.home-card__error {
  margin-top: 4px;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  opacity: 0.85;
}

.home-card__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  font-size: 30px;
  background: rgb(255 255 255 / 20%);
  border-radius: 16px;
}
</style>
