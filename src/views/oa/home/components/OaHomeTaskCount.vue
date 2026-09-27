<template>
  <div
    v-loading="loading"
    class="home-card home-card--red"
    @click="$router.push('/oa/task/my')"
  >
    <!-- 数据区与图标区分开，窄屏时优先保留数据 -->
    <div class="home-card__main">
      <div class="home-card__title">新任务</div>
      <div v-if="loadError" class="home-card__error" @click.stop="getList">
        加载失败，点击重试
      </div>
      <div v-else class="home-card__value">{{ count }}</div>
      <div v-if="checkPermi(['oa:announcement:query'])" class="home-card__desc">
        <span v-if="unreadError" @click.stop="getUnreadCount">未读公告加载失败，点击重试</span>
        <span v-else>
          {{ unreadLoading ? '未读公告加载中' : '另有 ' + unreadCount + ' 条未读公告' }}
        </span>
      </div>
    </div>
    <div class="home-card__icon"><i class="el-icon-finished" /></div>
  </div>
</template>

<script>
import * as TaskApi from '@/api/oa/task'
import * as AnnouncementApi from '@/api/oa/announcement'
import { checkPermi } from '@/utils/permission'
import { OA_TASK_STATUS } from '@/views/oa/utils/constants-collab'

export default {
  name: 'OaHomeTaskCount',
  data() {
    return {
      loading: false,
      loadError: false,
      count: 0,
      unreadCount: 0,
      unreadLoading: false,
      unreadError: false
    }
  },
  created() {
    if (this.checkPermi(['oa:announcement:query'])) {
      this.getUnreadCount()
    }
    this.getList()
  },
  methods: {
    checkPermi,
    /** 查询未读公告数量 */
    getUnreadCount() {
      this.unreadLoading = true
      this.unreadError = false
      const queryParams = { pageNo: 1, pageSize: 1, readStatus: false }
      return AnnouncementApi.getReceivedAnnouncementPage(queryParams).then(response => {
        this.unreadCount = response.data.total
      }).catch(() => {
        this.unreadError = true
      }).finally(() => {
        this.unreadLoading = false
      })
    },
    /** 查询当前区块数据 */
    getList() {
      if (this.loading) return Promise.resolve()
      this.loading = true
      this.loadError = false
      return TaskApi.getTaskStatusCount().then(response => {
        const statusCountMap = response.data || {}
        this.count = statusCountMap[OA_TASK_STATUS.NEW] || 0
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
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

.home-card--red {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.home-card__main {
  flex: 1;
  min-width: 0;
}

.home-card__title {
  margin-bottom: 4px;
  font-size: 14px;
  opacity: 0.9;
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
