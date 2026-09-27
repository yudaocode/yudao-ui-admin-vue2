<template>
  <div class="profile-user">
    <div class="text-center"><user-avatar :user="userInfo" /></div>
    <ul class="list-group list-group-striped">
      <li class="list-group-item"><svg-icon icon-class="user" /> 用户名称 <span class="pull-right">{{ userInfo.username }}</span></li>
      <li class="list-group-item"><svg-icon icon-class="phone" /> 手机号码 <span class="pull-right">{{ userInfo.mobile }}</span></li>
      <li class="list-group-item"><svg-icon icon-class="email" /> 用户邮箱 <span class="pull-right">{{ userInfo.email }}</span></li>
      <li class="list-group-item"><svg-icon icon-class="tree" /> 所属部门 <span v-if="userInfo.dept" class="pull-right">{{ userInfo.dept.name }}</span></li>
      <li class="list-group-item"><svg-icon icon-class="tree" /> 所属岗位 <span v-if="userInfo.posts" class="pull-right">{{ userInfo.posts.map(post => post.name).join(',') }}</span></li>
      <li class="list-group-item"><svg-icon icon-class="peoples" /> 所属角色 <span v-if="userInfo.roles" class="pull-right">{{ userInfo.roles.map(role => role.name).join(',') }}</span></li>
      <li class="list-group-item"><svg-icon icon-class="date" /> 创建日期 <span class="pull-right">{{ parseTime(userInfo.createTime) }}</span></li>
    </ul>
  </div>
</template>
<script>
import { getUserProfile } from '@/api/system/user/profile'
import UserAvatar from './UserAvatar.vue'

export default {
  name: 'ProfileUser',
  components: { UserAvatar },
  data() { return { userInfo: {} } },
  methods: {
    refresh() { return getUserProfile().then(response => { this.userInfo = response.data; return this.userInfo }) }
  },
  created() { this.refresh() }
}
</script>
<style scoped>
.text-center { height: 120px; text-align: center; }
.list-group { padding-left: 0; list-style: none; }
.list-group-item { padding: 11px 0; margin-bottom: -1px; font-size: 13px; border-top: 1px solid #e7eaec; border-bottom: 1px solid #e7eaec; }
.pull-right { float: right !important; }
</style>
