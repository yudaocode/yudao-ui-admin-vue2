<template>
  <el-table
    :data="socialUsers"
    :show-header="false"
  >
    <el-table-column
      label="社交平台"
      align="left"
      width="120"
    >
      <template slot-scope="scope">
        <img
          style="height:20px;vertical-align: middle;"
          :src="scope.row.img"
        > {{ scope.row.title }}
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      align="left"
    >
      <template slot-scope="scope">
        <div v-if="scope.row.openid">
          已绑定
          <el-button
            size="large"
            type="text"
            @click="unbind(scope.row)"
          >(解绑)</el-button>
        </div>
        <div v-else>
          未绑定
          <el-button
            size="large"
            type="text"
            @click="bind(scope.row)"
          >(绑定)</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

import { SystemUserSocialTypeEnum } from '@/utils/constants'
import { buildSocialRedirectUri, clearSocialCallback, getSocialCallback } from '@/utils/social'
import { getBindSocialUserList } from '@/api/system/social/user'
import { socialAuthRedirect, socialBind, socialUnbind } from '@/api/system/user/socialUser'

export default {
  props: {
    user: {
      type: Object,
      default: undefined
    },
    getUser: { // 刷新用户
      type: Function,
      default: undefined
    },
    setActiveTab: { // 设置激活的
      type: Function,
      default: undefined
    }
  },
  data() {
    return {
      socialUsers: []
    }
  },
  computed: {
  },
  async created() {
    // 社交绑定
    const type = new URL(decodeURIComponent(location.href)).searchParams.get('type')
    const { code, state } = getSocialCallback()
    if (code) {
      const callbackRoute = this.$route
      await clearSocialCallback(this.$router)
      if (callbackRoute.fullPath !== this.$route.fullPath) {
        // Vue2 标签页按 path 复用，更新原标签即可清掉授权参数并保留当前页
        await this.$store.dispatch('tagsView/updateVisitedView', this.$route)
      }
    }
    await this.initSocial()
    if (!code) {
      return
    }
    socialBind(type, code, state).then(resp => {
      this.$modal.msgSuccess('绑定成功')
      // 调用父组件, 刷新
      this.setActiveTab('userSocial')
      // 重新初始化社交用户列表
      this.initSocial()
    })
  },
  methods: {
    async initSocial() {
      this.socialUsers = [] // 重置避免无限增长
      // 获取已绑定的社交用户列表
      const response = await getBindSocialUserList()
      const bindSocialUserList = response.data
      // 检查该社交平台是否已绑定
      for (const i in SystemUserSocialTypeEnum) {
        const socialUser = { ...SystemUserSocialTypeEnum[i] }
        this.socialUsers.push(socialUser)
        if (bindSocialUserList.length > 0) {
          for (const bindUser of bindSocialUserList) {
            if (socialUser.type === bindUser.type) {
              socialUser.openid = bindUser.openid
              break
            }
          }
        }
      }
    },
    bind(socialUser) {
      // 计算 redirectUri
      const redirectUri = buildSocialRedirectUri(this.$router.resolve('/user/profile').href, { type: socialUser.type })
      // 进行跳转
      socialAuthRedirect(socialUser.type, encodeURIComponent(redirectUri)).then((res) => {
        window.location.href = res.data
      })
    },
    unbind(socialUser) {
      socialUnbind(socialUser.type, socialUser.openid).then(resp => {
        this.$modal.msgSuccess('解绑成功')
        socialUser.openid = undefined
      })
    },
    close() {
      this.$tab.closePage()
    }
  }
}
</script>
