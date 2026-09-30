<template>
  <div class="lock-page">
    <div v-show="showDate" class="lock-page-unlock" @click="handleShowForm(false)">
      <i class="el-icon-lock" />
      <span>解锁</span>
    </div>

    <div class="lock-page-time">
      <div class="lock-page-hour">
        <span>{{ hour }}</span>
        <span v-show="showDate" class="meridiem">{{ meridiem }}</span>
      </div>
      <div class="lock-page-minute">
        <span>{{ minute }}</span>
      </div>
    </div>

    <transition name="fade-slide">
      <div v-show="!showDate" class="lock-page-entry">
        <div class="lock-page-entry-content">
          <div class="lock-page-entry-header">
            <img :src="avatar" alt="" class="lock-page-entry-img" />
            <div class="lock-page-entry-name">{{ userName }}</div>
          </div>
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入锁屏密码"
            @keyup.enter.native="unLock"
          />
          <span v-if="errMsg" class="lock-page-entry-err-msg">锁屏密码错误</span>
          <div class="lock-page-entry-footer">
            <el-button type="text" size="small" :disabled="loading" @click="handleShowForm(true)">
              返回
            </el-button>
            <el-button type="text" size="small" :disabled="loading" @click="goLogin">
              返回登录
            </el-button>
            <el-button type="text" size="small" :disabled="loading" @click="unLock">
              进入系统
            </el-button>
          </div>
        </div>
      </div>
    </transition>

    <div class="lock-page-date">
      <div v-show="!showDate" class="lock-page-date-time">
        {{ hour }}:{{ minute }} <span>{{ meridiem }}</span>
      </div>
      <div>{{ year }}/{{ month }}/{{ day }} {{ week }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPath } from '@/utils/ruoyi'

export default {
  name: 'LockPage',
  data() {
    return {
      password: '',
      loading: false,
      errMsg: false,
      showDate: true,
      now: new Date(),
      timer: null
    }
  },
  computed: {
    ...mapGetters(['avatar', 'nickname']),
    userName() {
      return this.nickname || 'Admin'
    },
    hour() {
      const h = this.now.getHours() % 12
      return String(h === 0 ? 12 : h).padStart(2, '0')
    },
    minute() {
      return String(this.now.getMinutes()).padStart(2, '0')
    },
    meridiem() {
      return this.now.getHours() < 12 ? '上午' : '下午'
    },
    year() {
      return this.now.getFullYear()
    },
    month() {
      return this.now.getMonth() + 1
    },
    day() {
      return this.now.getDate()
    },
    week() {
      return '星期' + '日一二三四五六'.charAt(this.now.getDay())
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = new Date()
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    // 解锁
    unLock() {
      if (!this.password) {
        return
      }
      this.loading = true
      this.$store.dispatch('lock/unLock', this.password).then(res => {
        this.errMsg = !res
      }).finally(() => {
        this.loading = false
      })
    },
    // 返回登录
    goLogin() {
      this.$modal.confirm('确定退出系统吗？', '提示').then(() => {
        return this.$store.dispatch('LogOut')
      }).then(() => {
        // 登出后清理
        this.$store.dispatch('tagsView/delAllViews')
        this.$store.dispatch('lock/resetLockInfo')
        location.href = getPath('/login')
      }).catch(() => {})
    },
    handleShowForm(show = true) {
      this.showDate = show
      if (show) {
        this.password = ''
        this.errMsg = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$error-color: #ed6f6f;

.lock-page {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3000;
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  align-items: center;
  justify-content: center;
}

.lock-page-unlock {
  position: absolute;
  top: 0;
  left: 50%;
  display: flex;
  height: 64px;
  padding-top: 20px;
  color: #fff;
  cursor: pointer;
  transform: translateX(-50%);
  align-items: center;
  justify-content: center;
  flex-direction: column;

  i {
    font-size: 20px;
  }

  span {
    font-size: 14px;
  }
}

.lock-page-time {
  display: flex;
  justify-content: center;
  align-items: center;
}

.lock-page-hour,
.lock-page-minute {
  position: relative;
  display: flex;
  width: 40vw;
  height: 40vh;
  font-weight: 700;
  color: #bababa;
  background-color: #141313;
  border-radius: 30px;
  justify-content: center;
  align-items: center;

  span:not(.meridiem) {
    font-size: 160px;
  }

  .meridiem {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 18px;
  }
}

.lock-page-hour {
  margin-right: 5vw;
}

.lock-page-entry {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
}

.lock-page-entry-content {
  width: 260px;
}

.lock-page-entry-header {
  text-align: center;

  .lock-page-entry-img {
    width: 70px;
    margin: 0 auto;
    border-radius: 50%;
  }

  .lock-page-entry-name {
    margin-top: 5px;
    margin-bottom: 10px;
    font-weight: 500;
    color: #bababa;
  }
}

.lock-page-entry-err-msg {
  display: inline-block;
  margin-top: 10px;
  font-size: 14px;
  color: $error-color;
}

.lock-page-entry-footer {
  display: flex;
  margin-top: 10px;
  justify-content: space-between;
}

.lock-page-date {
  position: absolute;
  bottom: 20px;
  width: 100%;
  color: #d1d5db;
  text-align: center;

  .lock-page-date-time {
    margin-bottom: 16px;
    font-size: 48px;
  }

  div:last-child {
    font-size: 24px;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s, transform 0.3s;
}

.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10%);
}
</style>
