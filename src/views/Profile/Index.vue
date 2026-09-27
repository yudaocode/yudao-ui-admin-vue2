<template>
  <div class="app-container profile-page">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24"><el-card shadow="hover"><div slot="header" class="card-header">个人信息</div><profile-user ref="profileUser" /></el-card></el-col>
      <el-col :span="18" :xs="24"><el-card><div slot="header" class="card-header">基本资料</div><el-tabs v-model="activeName"><el-tab-pane label="基本资料" name="basicInfo"><basic-info :user="user" @success="refreshProfile" /></el-tab-pane><el-tab-pane label="修改密码" name="resetPwd"><reset-pwd :user="user" /></el-tab-pane><el-tab-pane label="社交信息" name="userSocial"><user-social :user="user" :get-user="refreshProfile" :set-active-tab="setActiveTab" /></el-tab-pane></el-tabs></el-card></el-col>
    </el-row>
  </div>
</template>
<script>
import BasicInfo from './components/BasicInfo.vue'
import ProfileUser from './components/ProfileUser.vue'
import ResetPwd from './components/ResetPwd.vue'
import UserSocial from './components/UserSocial.vue'
import { getUserProfile } from '@/api/system/user/profile'

export default {
  name: 'Profile',
  components: { BasicInfo, ProfileUser, ResetPwd, UserSocial },
  data() { return { activeName: 'basicInfo', user: {} } },
  created() { this.refreshProfile() },
  methods: {
    refreshProfile() {
      return getUserProfile().then(response => {
        this.user = response.data
        this.$nextTick(() => this.$refs.profileUser && this.$refs.profileUser.refresh())
        return this.user
      })
    },
    setActiveTab(name) { this.activeName = name }
  }
}
</script>
<style scoped>
.profile-page .card-header { display: flex; justify-content: center; align-items: center; }
</style>
