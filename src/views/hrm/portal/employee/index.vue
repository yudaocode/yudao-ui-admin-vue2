<template>
  <div v-if="accessible">
    <el-card
      shadow="never"
      class="employee-title-card"
    >
      <div class="employee-title">
        <span>我的档案</span>
        <el-button
          icon="el-icon-refresh"
          @click="refreshEmployee"
        >刷新</el-button>
      </div>
    </el-card>
    <div v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="基本信息"
          name="base"
        >
          <EmployeeBaseInfo
            ref="baseInfoRef"
            :employee="employee"
            :field-config-list="fieldConfigList"
            @edit="openEmployeeForm"
          />
        </el-tab-pane>
        <el-tab-pane
          label="岗位信息"
          name="post"
          lazy
        >
          <EmployeePostInfo
            ref="postInfoRef"
            :employee="employee"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <EmployeeForm
      ref="employeeFormRef"
      @success="getEmployee"
    />
  </div>
</template>

<script>
import { getEmployee } from '@/api/hrm/portal/employee'
import { getEmployeeFieldConfigList } from '@/api/hrm/portal/employee/field-config'
import { checkHrmPortalAccess } from '@/views/hrm/portal/utils/access'
import EmployeeBaseInfo from './EmployeeBaseInfo.vue'
import EmployeeForm from './EmployeeForm.vue'
import EmployeePostInfo from './EmployeePostInfo.vue'

export default {
  name: 'HrmPortalEmployee',
  components: { EmployeeBaseInfo, EmployeeForm, EmployeePostInfo },
  data() {
    return { accessible: false, loading: false, activeTab: 'base', employee: {}, fieldConfigList: [] }
  },
  async activated() {
    this.accessible = await checkHrmPortalAccess(this.$router)
    if (!this.accessible) return
    await this.getEmployee()
  },
  methods: {
    async getEmployee() {
      this.loading = true
      try {
        const responses = await Promise.all([getEmployee(), getEmployeeFieldConfigList()])
        this.employee = responses[0].data
        this.fieldConfigList = responses[1].data
      } finally {
        this.loading = false
      }
    },
    async refreshEmployee() {
      await this.getEmployee()
      if (this.activeTab === 'base') await this.$refs.baseInfoRef.getList()
      else await this.$refs.postInfoRef.getQuitInfo()
    },
    openEmployeeForm() { this.$refs.employeeFormRef.open(this.employee, this.fieldConfigList) }
  }
}
</script>

<style scoped>
.employee-title-card { margin-bottom: 15px; }
.employee-title { display: flex; align-items: center; justify-content: space-between; font-size: 18px; font-weight: 600; }
</style>
