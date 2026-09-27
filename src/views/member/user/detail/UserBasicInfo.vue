<template>
  <el-card shadow="never" class="user-basic-info">
    <div slot="header" class="card-header"><slot name="header"><span>基本信息</span></slot></div>
    <el-row>
      <el-col :span="5" class="avatar-column">
        <el-avatar :size="120" :src="user.avatar || undefined" shape="square">{{ avatarText }}</el-avatar>
      </el-col>
      <el-col :span="19">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="用户名">{{ user.name || '空' }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ user.nickname || '空' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ user.mobile || '空' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ user.email || '空' }}</el-descriptions-item>
          <el-descriptions-item label="性别"><dict-tag :type="DICT_TYPE.SYSTEM_USER_SEX" :value="user.sex == null ? 0 : user.sex" /></el-descriptions-item>
          <el-descriptions-item label="所在地">{{ user.areaName || '空' }}</el-descriptions-item>
          <el-descriptions-item label="注册 IP">{{ user.registerIp || '空' }}</el-descriptions-item>
          <el-descriptions-item label="生日">{{ user.birthday ? parseTime(user.birthday, '{y}-{m}-{d}') : '空' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ user.createTime ? parseTime(user.createTime) : '空' }}</el-descriptions-item>
          <el-descriptions-item label="最后登录时间">{{ user.loginDate ? parseTime(user.loginDate) : '空' }}</el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'UserBasicInfo',
  props: {
    user: { type: Object, default: () => ({}) }
  },
  data() {
    return { DICT_TYPE }
  },
  computed: {
    avatarText() {
      return (this.user.nickname || this.user.name || '会').slice(0, 1)
    }
  }
}
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.avatar-column { display: flex; align-items: flex-start; justify-content: center; padding: 10px; }
.user-basic-info { height: 100%; }
</style>
