<template>
  <div class="container">
    <div class="logo" />
    <!-- 登录区域 -->
    <div class="content">
      <!-- 配图 -->
      <div class="pic" />
      <!-- 表单 -->
      <div class="field">
        <!-- [移动端]标题 -->
        <h2 class="mobile-title">
          <h3 class="title">芋道后台管理系统</h3>
        </h2>

        <!-- 表单 -->
        <div class="form-cont">
          <el-tabs
            v-model="loginForm.loginType"
            :before-leave="beforeLoginTabLeave"
            class="form"
            style=" float:none;"
            @tab-click="handleTabClick"
          >
            <el-tab-pane
              label="账号密码登录"
              name="uname"
            />
            <el-tab-pane
              label="短信验证码登录"
              name="sms"
            />
            <el-tab-pane
              label="注册"
              name="register"
            />
            <el-tab-pane
              label="忘记密码"
              name="forget"
            />
            <el-tab-pane
              label="扫码登录"
              name="qrcode"
            />
          </el-tabs>
          <div>
            <QrcodeLogin
              v-if="loginForm.loginType === 'qrcode'"
              :redirect="redirect || '/'"
              @back="loginForm.loginType = 'uname'"
            />
            <el-form
              v-else
              ref="loginForm"
              :model="loginForm"
              :rules="activeRules"
              class="login-form"
            >
              <el-form-item
                v-if="tenantEnable"
                prop="tenantName"
              >
                <el-input
                  v-model="loginForm.tenantName"
                  type="text"
                  auto-complete="off"
                  placeholder="租户"
                >
                  <svg-icon
                    slot="prefix"
                    icon-class="tree"
                    class="el-input__icon input-icon"
                  />
                </el-input>
              </el-form-item>
              <!-- 账号密码登录 / 注册 共用 -->
              <div v-if="loginForm.loginType === 'uname' || loginForm.loginType === 'register'">
                <el-form-item prop="username">
                  <el-input
                    v-model="loginForm.username"
                    type="text"
                    auto-complete="off"
                    placeholder="账号"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="user"
                      class="el-input__icon input-icon"
                    />
                  </el-input>
                </el-form-item>
                <el-form-item
                  v-if="loginForm.loginType === 'register'"
                  prop="nickname"
                >
                  <el-input
                    v-model="loginForm.nickname"
                    type="text"
                    auto-complete="off"
                    placeholder="昵称"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="user"
                      class="el-input__icon input-icon"
                    />
                  </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    auto-complete="off"
                    placeholder="密码"
                    @keyup.enter.native="getCode"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="password"
                      class="el-input__icon input-icon"
                    />
                  </el-input>
                </el-form-item>
                <el-form-item
                  v-if="loginForm.loginType === 'register'"
                  prop="confirmPassword"
                >
                  <el-input
                    v-model="loginForm.confirmPassword"
                    type="password"
                    auto-complete="off"
                    placeholder="确认密码"
                    @keyup.enter.native="getCode"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="password"
                      class="el-input__icon input-icon"
                    />
                  </el-input>
                </el-form-item>
                <el-checkbox
                  v-if="loginForm.loginType === 'uname'"
                  v-model="loginForm.rememberMe"
                  style="margin:0 0 25px 0;"
                >记住密码</el-checkbox>
              </div>

              <!-- 手机号：短信验证码登录 / 忘记密码 共用 -->
              <div v-if="loginForm.loginType === 'sms' || loginForm.loginType === 'forget'">
                <el-form-item prop="mobile">
                  <el-input
                    v-model="loginForm.mobile"
                    type="text"
                    auto-complete="off"
                    placeholder="请输入手机号"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="phone"
                      class="el-input__icon input-icon"
                    />
                  </el-input>
                </el-form-item>
              </div>

              <!-- 短信验证码登录 -->
              <div v-if="loginForm.loginType === 'sms'">
                <el-form-item prop="mobileCode">
                  <el-input
                    v-model="loginForm.mobileCode"
                    type="text"
                    auto-complete="off"
                    placeholder="短信验证码"
                    class="sms-login-mobile-code-prefix"
                    @keyup.enter.native="handleLogin"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="password"
                      class="el-input__icon input-icon"
                    />
                    <template slot="append">
                      <span
                        v-if="mobileCodeTimer <= 0"
                        class="getMobileCode"
                        style="cursor: pointer;"
                        @click="getSmsCode"
                      >获取验证码</span>
                      <span
                        v-if="mobileCodeTimer > 0"
                        class="getMobileCode"
                      >{{ mobileCodeTimer }}秒后可重新获取</span>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <!-- 忘记密码 -->
              <div v-if="loginForm.loginType === 'forget'">
                <el-form-item prop="resetCode">
                  <el-input
                    v-model="loginForm.resetCode"
                    type="text"
                    auto-complete="off"
                    placeholder="短信验证码"
                    class="sms-login-mobile-code-prefix"
                    @keyup.enter.native="getCode"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="password"
                      class="el-input__icon input-icon"
                    />
                    <template slot="append">
                      <span
                        v-if="mobileCodeTimer <= 0"
                        class="getMobileCode"
                        style="cursor: pointer;"
                        @click="getResetSmsCode"
                      >获取验证码</span>
                      <span
                        v-if="mobileCodeTimer > 0"
                        class="getMobileCode"
                      >{{ mobileCodeTimer }}秒后可重新获取</span>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    auto-complete="off"
                    placeholder="新密码"
                    @keyup.enter.native="getCode"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="password"
                      class="el-input__icon input-icon"
                    />
                  </el-input>
                </el-form-item>
                <el-form-item prop="checkPassword">
                  <el-input
                    v-model="loginForm.checkPassword"
                    type="password"
                    auto-complete="off"
                    placeholder="确认新密码"
                    @keyup.enter.native="getCode"
                  >
                    <svg-icon
                      slot="prefix"
                      icon-class="password"
                      class="el-input__icon input-icon"
                    />
                  </el-input>
                </el-form-item>
              </div>

              <!-- 注册 / 忘记密码 入口 -->
              <div style="width:100%; margin:0 0 10px; text-align:right;">
                <template v-if="loginForm.loginType === 'uname'">
                  <el-link
                    :underline="false"
                    type="primary"
                    @click="loginForm.loginType = 'register'"
                  >立即注册</el-link>
                  <el-link
                    :underline="false"
                    type="primary"
                    style="padding-left:10px;"
                    @click="loginForm.loginType = 'forget'"
                  >忘记密码？</el-link>
                </template>
                <el-link
                  v-if="loginForm.loginType === 'register' || loginForm.loginType === 'forget'"
                  :underline="false"
                  type="primary"
                  @click="loginForm.loginType = 'uname'"
                >返回登录</el-link>
              </div>

              <!-- 下方的登录按钮 -->
              <el-form-item style="width:100%;">
                <el-button
                  :loading="loading"
                  size="medium"
                  type="primary"
                  style="width:100%;"
                  @click.native.prevent="getCode"
                >
                  <span v-if="loginForm.loginType === 'register'">注 册</span>
                  <span v-else-if="loginForm.loginType === 'forget'">重置密码</span>
                  <span v-else-if="!loading">登 录</span>
                  <span v-else>登 录 中...</span>
                </el-button>
              </el-form-item>

              <!--  社交登录 -->
              <el-form-item
                v-if="loginForm.loginType === 'uname' || loginForm.loginType === 'sms'"
                style="width:100%;"
              >
                <div
                  class="oauth-login"
                  style="display:flex"
                >
                  <div
                    v-for="item in SysUserSocialTypeEnum"
                    :key="item.type"
                    class="oauth-login-item"
                    @click="doSocialLogin(item)"
                  >
                    <img
                      :src="item.img"
                      height="25px"
                      width="25px"
                      alt="登录"
                    >
                    <span>{{ item.title }}</span>
                  </div>
                </div>
              </el-form-item>

              <!-- 教程说明 -->
              <el-form-item style="width:100%; margin-top:-25px">
                <el-link
                  href="https://doc.iocoder.cn/"
                  target="_blank"
                >📚开发指南</el-link>
                <el-link
                  href="https://doc.iocoder.cn/video/"
                  target="_blank"
                  style="padding-left: 10px"
                >🔥视频教程</el-link>
                <el-link
                  href="https://www.iocoder.cn/Interview/good-collection/"
                  target="_blank"
                  style="padding-left: 10px"
                >⚡面试手册</el-link>
                <el-link
                  href="http://static.yudao.iocoder.cn/mp/Aix9975.jpeg"
                  target="_blank"
                  style="padding-left: 10px"
                >🤝外包咨询</el-link>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 图形验证码 -->
    <Verify
      ref="verify"
      :captcha-type="'blockPuzzle'"
      :img-size="{width:'400px',height:'200px'}"
      @success="handleLogin"
    />
    <!-- 注册图形验证码 -->
    <Verify
      ref="verifyRegister"
      :captcha-type="'blockPuzzle'"
      :img-size="{width:'400px',height:'200px'}"
      @success="handleRegister"
    />
    <!-- 忘记密码发送短信的图形验证码 -->
    <Verify
      ref="verifySms"
      :captcha-type="'blockPuzzle'"
      :img-size="{width:'400px',height:'200px'}"
      @success="sendResetSmsCode"
    />

    <!-- footer -->
    <div class="footer">
      Copyright © 2020-2022 iocoder.cn All Rights Reserved.
    </div>
  </div>
</template>

<script>
import { getTenantByWebsite, getTenantIdByName, sendSmsCode, socialAuthRedirect } from '@/api/login'
import { register, smsResetPassword } from '@/api/login'
import { SystemUserSocialTypeEnum } from '@/utils/constants'
import { buildSocialRedirectUri } from '@/utils/social'
import { parseId } from '@/utils/id'
import { getCaptchaEnable, getTenantEnable } from '@/utils/ruoyi'
import {
  getPassword,
  getRememberMe, getTenantName,
  getUsername,
  removePassword, removeRememberMe, removeTenantName,
  removeUsername,
  setPassword, setRememberMe, setTenantId, setTenantName,
  setToken,
  setUsername
} from '@/utils/auth'

import Verify from '@/components/Verifition/Verify'
import QrcodeLogin from '@/views/login/components/QrcodeLogin.vue'
export default {
  name: 'UserLogin',
  components: {
    Verify,
    QrcodeLogin
  },
  data() {
    return {
      codeUrl: '',
      captchaEnable: true,
      tenantEnable: true,
      mobileCodeTimer: 0,
      loginForm: {
        loginType: 'uname',
        username: 'admin',
        password: 'admin123',
        captchaVerification: '',
        mobile: '',
        mobileCode: '',
        nickname: '',
        confirmPassword: '',
        resetCode: '',
        checkPassword: '',
        rememberMe: false,
        tenantName: '芋道源码'
      },
      scene: 21,
      resetScene: 23, // 后台用户 - 忘记密码

      LoginRules: {
        username: [
          { required: true, trigger: 'blur', message: '用户名不能为空' }
        ],
        password: [
          { required: true, trigger: 'blur', message: '密码不能为空' }
        ],
        mobile: [
          { required: true, trigger: 'blur', message: '手机号不能为空' },
          {
            validator: function(rule, value, callback) {
              if (/^(?:(?:\+|00)86)?1(?:3[\d]|4[5-79]|5[0-35-9]|6[5-7]|7[0-8]|8[\d]|9[189])\d{8}$/.test(value) === false) {
                callback(new Error('手机号格式错误'))
              } else {
                callback()
              }
            }, trigger: 'blur'
          }
        ],
        tenantName: [
          { required: true, trigger: 'blur', message: '租户不能为空' },
          {
            validator: (rule, value, callback) => {
              // debugger
              getTenantIdByName(value).then(res => {
                const tenantId = res.data
                if (tenantId && tenantId >= 0) {
                  // 设置租户
                  setTenantId(tenantId)
                  callback()
                } else {
                  callback('租户不存在')
                }
              })
            },
            trigger: 'blur'
          }
        ]
      },
      loading: false,
      redirect: undefined,
      // 枚举
      SysUserSocialTypeEnum: SystemUserSocialTypeEnum
    }
  },
  computed: {
    // 根据当前登录方式，返回对应的表单校验规则
    activeRules() {
      const rules = { ...this.LoginRules }
      // 注册：更严格的账号、密码规则
      if (this.loginForm.loginType === 'register') {
        rules.username = [
          { required: true, trigger: 'blur', message: '请输入您的账号' },
          { min: 4, max: 30, message: '用户账号长度必须介于 4 和 30 之间', trigger: 'blur' }
        ]
        rules.nickname = [
          { required: true, trigger: 'blur', message: '请输入您的昵称' },
          { max: 30, message: '昵称长度不能超过 30 个字符', trigger: 'blur' }
        ]
        rules.password = [
          { required: true, trigger: 'blur', message: '请输入您的密码' },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' },
          { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\ |", trigger: 'blur' }
        ]
        rules.confirmPassword = [
          { required: true, trigger: 'blur', message: '请再次输入您的密码' },
          { validator: this.equalToPassword, trigger: 'blur' }
        ]
      }
      // 忘记密码
      if (this.loginForm.loginType === 'forget') {
        rules.password = [...rules.password, { min: 4, max: 16, message: '密码长度为4到16位', trigger: 'blur' }]
        rules.resetCode = [
          { required: true, trigger: 'blur', message: '短信验证码不能为空' }
        ]
        rules.checkPassword = [
          { required: true, trigger: 'blur', message: '请再次输入密码' },
          { validator: this.equalToPassword, trigger: 'blur' }
        ]
      }
      return rules
    }
  },
  created() {
    // 租户开关
    this.tenantEnable = getTenantEnable()
    let tenantReady = Promise.resolve()
    if (this.tenantEnable) {
      tenantReady = getTenantIdByName(this.loginForm.tenantName).then(res => { // 设置租户
        const tenantId = res.data
        if (tenantId && tenantId >= 0) {
          setTenantId(tenantId)
        }
      })
    }
    // 验证码开关
    this.captchaEnable = getCaptchaEnable()
    // 重定向地址
    this.redirect = typeof this.$route.query.redirect === 'string' ? this.$route.query.redirect : undefined
    this.getCookie()
    // 根据域名识别租户
    this._tenantReady = Promise.all([tenantReady.catch(() => {}), this.getTenantByWebsite()])
  },
  methods: {
    /** 根据域名，获得租户信息 */
    async getTenantByWebsite() {
      if (!this.tenantEnable) return
      try {
        const tenant = (await getTenantByWebsite(location.host)).data
        if (tenant) {
          this.loginForm.tenantName = tenant.name
          setTenantId(tenant.id)
        }
      } catch (e) {
        // 域名未绑定租户时忽略，保持手工输入
      }
    },
    // 校验两次输入的密码是否一致
    equalToPassword(rule, value, callback) {
      if (this.loginForm.password !== value) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    async beforeLoginTabLeave(name) {
      if (name !== 'qrcode' || !this.tenantEnable) return true
      await this._tenantReady
      const tenantName = this.loginForm.tenantName.trim()
      if (!tenantName) {
        this.$message.warning('请输入租户名称')
        return Promise.reject()
      }
      try {
        const tenantId = parseId((await getTenantIdByName(tenantName)).data)
        if (tenantId == null) {
          this.$message.warning('租户不存在')
          return Promise.reject()
        }
        setTenantId(tenantId)
        return true
      } catch {
        return Promise.reject()
      }
    },
    handleTabClick() {
      this.$nextTick(() => this.$refs.loginForm && this.$refs.loginForm.clearValidate())
    },
    getCode() {
      // 注册
      if (this.loginForm.loginType === 'register') {
        // 情况一，未开启：则直接注册
        if (!this.captchaEnable) {
          this.handleRegister({})
          return
        }
        // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行注册
        // 弹出验证码
        this.$refs.verifyRegister.show()
        return
      }
      // 忘记密码：直接重置密码
      if (this.loginForm.loginType === 'forget') {
        this.handleResetPassword()
        return
      }
      // 情况一，未开启：则直接登录
      if (!this.captchaEnable) {
        this.handleLogin({})
        return
      }

      // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行登录
      // 弹出验证码
      this.$refs.verify.show()
    },
    getCookie() {
      const username = getUsername()
      const password = getPassword()
      const rememberMe = getRememberMe()
      const tenantName = getTenantName()
      this.loginForm = {
        ...this.loginForm,
        username: username || this.loginForm.username,
        password: password || this.loginForm.password,
        rememberMe: rememberMe ? getRememberMe() : false,
        tenantName: tenantName || this.loginForm.tenantName
      }
    },
    handleLogin(captchaParams) {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 设置 Cookie
          if (this.loginForm.rememberMe) {
            setUsername(this.loginForm.username)
            setPassword(this.loginForm.password)
            setRememberMe(this.loginForm.rememberMe)
            setTenantName(this.loginForm.tenantName)
          } else {
            removeUsername()
            removePassword()
            removeRememberMe()
            removeTenantName()
          }
          this.loginForm.captchaVerification = captchaParams.captchaVerification
          // 发起登陆
          // console.log("发起登录", this.loginForm);
          this.$store.dispatch(this.loginForm.loginType === 'sms' ? 'SmsLogin' : 'Login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' }).catch(() => {
            })
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },
    async doSocialLogin(socialTypeEnum) {
      // 设置登录中
      this.loading = true
      let tenant = false
      if (this.tenantEnable) {
        await this.$prompt('请输入租户名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(async({ value }) => {
          await getTenantIdByName(value).then(res => {
            const tenantId = res.data
            tenant = true
            if (tenantId && tenantId >= 0) {
              setTenantId(tenantId)
            }
          })
        }).catch(() => {
          // 取消登录按钮 loading状态
          this.loading = false

          return false
        })
      } else {
        tenant = true
      }
      if (tenant) {
        // 计算 redirectUri
        const redirectUri = buildSocialRedirectUri(this.$router.resolve('/social-login').href, {
          type: socialTypeEnum.type,
          redirect: this.redirect || '/'
        })
        // 进行跳转
        socialAuthRedirect(socialTypeEnum.type, encodeURIComponent(redirectUri)).then((res) => {
          // console.log(res.url);
          window.location.href = res.data
        })
      }
    },
    /** ========== 以下为升级短信登录 ========== */
    getSmsCode() {
      if (this.mobileCodeTimer > 0) return
      this.$refs.loginForm.validate(valid => {
        if (!valid) return
        sendSmsCode(this.loginForm.mobile, this.scene, this.loginForm.uuid, this.loginForm.code).then(res => {
          this.$modal.msgSuccess('获取验证码成功')
          this.mobileCodeTimer = 60
          const msgTimer = setInterval(() => {
            this.mobileCodeTimer = this.mobileCodeTimer - 1
            if (this.mobileCodeTimer <= 0) {
              clearInterval(msgTimer)
            }
          }, 1000)
        })
      })
    },
    /** ========== 以下为升级注册 ========== */
    // 提交注册（图形验证码通过后触发）
    handleRegister(captchaParams) {
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        // 租户编号在 tenantName 的校验器里已经设置
        register({
          tenantName: this.loginForm.tenantName,
          username: this.loginForm.username,
          nickname: this.loginForm.nickname,
          password: this.loginForm.password,
          confirmPassword: this.loginForm.confirmPassword,
          captchaVerification: captchaParams.captchaVerification
        }).then(res => {
          // 注册即登录：设置 token 并跳转
          setToken(res.data)
          this.$router.push({ path: this.redirect || '/' }).catch(() => {
          })
        }).catch(() => {
          this.loading = false
        })
      })
    },
    /** ========== 以下为升级忘记密码 ========== */
    // 获取重置密码的短信验证码
    getResetSmsCode() {
      if (this.mobileCodeTimer > 0) return
      this.$refs.loginForm.validateField('mobile', (message) => {
        if (message) return
        // 情况一，未开启：则直接发送验证码
        if (!this.captchaEnable) {
          this.sendResetSmsCode({})
          return
        }
        // 情况二，已开启：则展示验证码；只有完成验证码的情况，才发送短信
        this.$refs.verifySms.show()
      })
    },
    // 发送重置密码的短信验证码（图形验证码通过后触发）
    sendResetSmsCode(captchaParams) {
      sendSmsCode(this.loginForm.mobile, this.resetScene, captchaParams.captchaVerification).then(res => {
        this.$modal.msgSuccess('获取验证码成功')
        this.mobileCodeTimer = 60
        const msgTimer = setInterval(() => {
          this.mobileCodeTimer = this.mobileCodeTimer - 1
          if (this.mobileCodeTimer <= 0) {
            clearInterval(msgTimer)
          }
        }, 1000)
      })
    },
    // 重置密码
    handleResetPassword() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        smsResetPassword({
          mobile: this.loginForm.mobile,
          code: this.loginForm.resetCode,
          password: this.loginForm.password
        }).then(() => {
          this.$modal.msgSuccess('重置密码成功')
          this.loginForm.loginType = 'uname'
        }).catch(() => {
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import "~@/assets/styles/login.scss";

.oauth-login {
  display: flex;
  align-items: center;
  cursor:pointer;
}
.oauth-login-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}
.oauth-login-item img {
  height: 25px;
  width: 25px;
}
.oauth-login-item span:hover {
  text-decoration: underline red;
  color: red;
}
.sms-login-mobile-code-prefix {
  :deep(.el-input__prefix) {
    top: 22%;
  }
}
</style>
