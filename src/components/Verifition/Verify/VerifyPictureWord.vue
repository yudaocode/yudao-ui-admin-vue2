<template>
  <div style="position: relative">
    <div class="verify-img-out">
      <div
        class="verify-img-panel"
        :style="{
          width: setSize.imgWidth,
          height: setSize.imgHeight,
          'background-size': setSize.imgWidth + ' ' + setSize.imgHeight,
          'margin-bottom': vSpace + 'px'
        }"
      >
        <div v-show="showRefresh" class="verify-refresh" style="z-index: 3" @click="refresh">
          <i class="iconfont icon-refresh" />
        </div>
        <img
          ref="canvas"
          :src="'data:image/png;base64,' + verificationCodeImg"
          alt=""
          style="display: block; width: 100%; height: 100%"
          @click="refresh"
        />
      </div>
    </div>
    <div
      class="verify-bar-area"
      :style="{
        width: setSize.imgWidth,
        color: barAreaColor,
        'border-color': barAreaBorderColor
      }"
    >
      <div class="verify-msg">{{ text }}</div>
      <div :style="{ 'line-height': barSize.height }">
        <input class="verify-input" v-model="userCode" type="text" />
      </div>
      <button type="button" class="verify-btn" :disabled="checking" @click="submit">
        {{ checking ? '验证中' : '验 证' }}
      </button>
    </div>
  </div>
</template>
<script type="text/babel">
/**
 * VerifyPictureWord
 * @description 点选文字 / 输入文字验证码（Vue3 版本移植，依赖已有的 @/utils/ase AES 加密）
 * */
import { resetSize } from './../utils/util'
import { aesEncrypt } from '@/utils/ase'
import { reqGet, reqCheck } from '@/api/login'

export default {
  name: 'VerifyPictureWord',
  props: {
    // 弹出式 pop，固定 fixed
    mode: {
      type: String,
      default: 'fixed'
    },
    captchaType: {
      type: String
    },
    // 间隔
    vSpace: {
      type: Number,
      default: 5
    },
    imgSize: {
      type: Object,
      default() {
        return {
          width: '310px',
          height: '155px'
        }
      }
    },
    barSize: {
      type: Object,
      default() {
        return {
          width: '310px',
          height: '40px'
        }
      }
    }
  },
  data() {
    return {
      secretKey: '', // 后端返回的ase加密秘钥
      userCode: '', // 用户输入的验证码
      verificationCodeImg: '', // 后端获取到的背景图片
      backToken: '', // 后端返回的token值
      setSize: {
        imgHeight: 0,
        imgWidth: 0,
        barHeight: 0,
        barWidth: 0
      },
      text: '',
      barAreaColor: '#000',
      barAreaBorderColor: '#ddd',
      showRefresh: true,
      checking: false
    }
  },
  mounted() {
    // 禁止拖拽
    this.init()
    this.$el.onselectstart = function () {
      return false
    }
  },
  methods: {
    init() {
      // 加载页面
      this.getPicture()
      this.$nextTick(() => {
        const { imgHeight, imgWidth, barHeight, barWidth } = resetSize(this)
        this.setSize.imgHeight = imgHeight
        this.setSize.imgWidth = imgWidth
        this.setSize.barHeight = barHeight
        this.setSize.barWidth = barWidth
        this.$parent.$emit('ready', this)
      })
    },
    submit() {
      this.checking = true
      // 发送后端请求
      const captchaVerification = this.secretKey
        ? aesEncrypt(this.backToken + '---' + this.userCode, this.secretKey)
        : this.backToken + '---' + this.userCode
      const data = {
        captchaType: this.captchaType,
        pointJson: this.userCode,
        token: this.backToken
      }
      reqCheck(data).then((res) => {
        if (res.repCode === '0000') {
          this.barAreaColor = '#4cae4c'
          this.barAreaBorderColor = '#5cb85c'
          this.text = '验证成功'
          if (this.mode === 'pop') {
            setTimeout(() => {
              this.$parent.clickShow = false
              this.refresh()
            }, 1500)
          }
          this.$parent.$emit('success', { captchaVerification })
        } else {
          this.$parent.$emit('error', this)
          this.barAreaColor = '#d9534f'
          this.barAreaBorderColor = '#d9534f'
          this.text = '验证失败'
          setTimeout(() => {
            this.refresh()
          }, 700)
        }
        this.checking = false
      })
    },
    refresh() {
      this.barAreaColor = '#000'
      this.barAreaBorderColor = '#ddd'
      this.checking = false
      this.userCode = ''
      return this.getPicture().then(() => {
        this.showRefresh = true
      })
    },
    // 请求背景图片和验证图片
    getPicture() {
      const data = {
        captchaType: this.captchaType
      }
      return reqGet(data).then((res) => {
        if (res.repCode === '0000') {
          this.verificationCodeImg = res.repData.originalImageBase64
          this.backToken = res.repData.token
          this.secretKey = res.repData.secretKey
          this.text = '输入图中文字'
        } else {
          this.text = res.repMsg
        }
      })
    }
  }
}
</script>
