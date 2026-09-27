<template>
  <div
    v-loading="loading"
    class="home-card home-card--green"
    @click="$router.push('/oa/contact')"
  >
    <!-- 数据区与图标区分开，窄屏时优先保留数据 -->
    <div class="home-card__main">
      <div class="home-card__title">我的联系人</div>
      <div v-if="loadError" class="home-card__error" @click.stop="getList">
        加载失败，点击重试
      </div>
      <div v-else class="home-card__value">{{ count }}</div>
      <div class="home-card__desc">本人持有的联系人</div>
    </div>
    <div class="home-card__icon"><i class="el-icon-postcard" /></div>
  </div>
</template>

<script>
import * as ContactApi from '@/api/oa/contact'

export default {
  name: 'OaHomeContactCount',
  data() {
    return {
      loading: false,
      loadError: false,
      count: 0
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询当前区块数据 */
    getList() {
      if (this.loading) return Promise.resolve()
      this.loading = true
      this.loadError = false
      return ContactApi.getMyContactPage({ pageNo: 1, pageSize: 1 }).then(response => {
        this.count = response.data.total
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

.home-card--green {
  background: linear-gradient(135deg, #67c23a, #85ce61);
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
