<template>
  <div
    v-loading="loading"
    class="qrcode-login"
  >
    <Qrcode
      v-if="qrcode"
      :text="qrcode.qrContent"
      :disabled="!!error"
      disabled-text="请刷新二维码"
      @disabled-click="createQrcode"
    />
    <p>{{ error || '请使用管理后台手机端扫一扫，并确认登录' }}</p>
    <el-button
      v-if="error"
      @click="createQrcode"
    >刷新二维码</el-button>
    <div>
      <el-button
        type="text"
        @click="$emit('back')"
      >返回账号登录</el-button>
    </div>
  </div>
</template>

<script>
import { createQrcode, pollQrcode, AuthQrcodeStatusEnum } from '@/api/login'
import Qrcode from '@/components/Qrcode/src/Qrcode.vue'
import { removeVisitTenantId, setToken } from '@/utils/auth'

export default {
  name: 'QrcodeLogin',
  components: { Qrcode },
  props: {
    redirect: { type: String, default: '/' }
  },
  data() {
    return { qrcode: undefined, loading: false, error: '' }
  },
  created() {
    this.createQrcode()
  },
  beforeDestroy() {
    this._stopPolling && this._stopPolling()
  },
  methods: {
    async createQrcode() {
      this._stopPolling && this._stopPolling()
      let stopped = false
      let pollTimer
      this._stopPolling = () => {
        stopped = true
        clearTimeout(pollTimer)
      }
      const fail = () => {
        if (stopped) return
        this._stopPolling()
        this.loading = false
        this.error = this.qrcode ? '二维码已失效，请刷新后重新扫码' : '二维码生成失败，请刷新后重试'
      }
      this.qrcode = undefined
      this.error = ''
      this.loading = true
      try {
        const ticket = (await createQrcode()).data
        if (stopped) return
        this.qrcode = ticket
        this.loading = false
        const poll = async() => {
          try {
            const result = (await pollQrcode({ qrcodeId: ticket.qrcodeId, secret: ticket.secret })).data
            if (stopped) return
            if (result.status === AuthQrcodeStatusEnum.WAITING) {
              pollTimer = setTimeout(poll, 2000)
              return
            }
            if (result.status !== AuthQrcodeStatusEnum.CONFIRMED || !result.login?.accessToken || !result.login?.refreshToken) {
              fail()
              return
            }
            this._stopPolling()
            removeVisitTenantId()
            setToken(result.login)
            // 重载以清除内存中的用户、权限和动态路由，目标仅允许同源站内路径。
            let target = new URL(this.$router.resolve('/').href, location.origin)
            try {
              const path = this.redirect.startsWith('/') ? this.redirect : '/'
              const candidate = new URL(this.$router.resolve(path).href, location.origin)
              if (candidate.origin === location.origin) target = candidate
            } catch {
              // 无效的跳转参数返回首页。
            }
            location.assign(target.pathname + target.search + target.hash)
          } catch {
            fail()
          }
        }
        pollTimer = setTimeout(poll, 2000)
      } catch {
        fail()
      }
    }
  }
}
</script>

<style scoped>
.qrcode-login {
  min-height: 280px;
  padding: 20px 0;
  text-align: center;
}
.qrcode-login p {
  margin: 16px 0;
  color: #606266;
  font-size: 14px;
}
</style>
