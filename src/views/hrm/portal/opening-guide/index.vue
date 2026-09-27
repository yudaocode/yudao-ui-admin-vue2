<template>
  <el-card
    v-if="visible"
    shadow="never"
    class="opening-guide"
  >
    <el-result
      icon="warning"
      title="当前账号尚未开通员工端"
      :sub-title="description"
    >
      <template slot="extra">
        <el-button
          v-if="canCreateEmployee"
          type="primary"
          @click="goEmployee"
        >前往员工档案</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </template>
    </el-result>
    <div
      v-if="canCreateEmployee"
      class="opening-steps"
    >
      <div class="opening-steps__title">完成员工端开通</div>
      <el-steps
        :active="0"
        align-center
      >
        <el-step
          title="进入员工档案"
          description="前往员工管理的员工档案列表"
        />
        <el-step
          title="新增并绑定账号"
          description="新增员工时绑定当前后台账号"
        />
        <el-step
          title="保存员工档案"
          description="完善必填信息并保存后即可进入员工端"
        />
      </el-steps>
    </div>
  </el-card>
</template>

<script>
import { checkPermi } from '@/utils/permission'
import { redirectBoundEmployeeFromOpeningGuide } from '@/views/hrm/portal/utils/access'

export default {
  name: 'HrmPortalOpeningGuide',
  data() {
    const canCreateEmployee = checkPermi(['hrm:employee:create'])
    return {
      visible: false,
      canCreateEmployee,
      description: canCreateEmployee
        ? '请先在员工管理中创建员工档案，并将绑定用户设置为当前后台账号。'
        : '请联系公司管理员在员工管理中创建员工档案，并绑定当前后台账号。'
    }
  },
  async mounted() {
    this.visible = !(await redirectBoundEmployeeFromOpeningGuide(this.$router))
  },
  methods: {
    goEmployee() { this.$router.push({ name: 'HrmEmployee' }) },
    goHome() { this.$router.push('/') }
  }
}
</script>

<style scoped>
.opening-guide { min-height: calc(100vh - 130px); }
.opening-steps { box-sizing: border-box; width: 100%; max-width: 760px; margin: 0 auto 48px; padding: 28px 32px; border: 1px solid #e4e7ed; border-radius: 4px; }
.opening-steps__title { margin-bottom: 28px; color: #303133; font-size: 16px; font-weight: 600; text-align: center; }
</style>
