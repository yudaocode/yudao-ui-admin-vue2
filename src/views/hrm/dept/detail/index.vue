<template>
  <div class="app-container hrm-dept-detail">
    <dept-details-header
      :dept="dept"
      :leader-user-name="leaderUserName"
      :loading="loading"
      :parent-dept-name="parentDeptName"
      :statistics="statistics"
    >
      <div class="header-actions">
        <el-button
          v-hasPermi="['system:dept:update']"
          :disabled="!dept.id"
          type="primary"
          icon="el-icon-edit"
          @click="openDeptManagement"
        >编辑</el-button>
        <el-button
          v-hasPermi="['system:dept:delete']"
          :disabled="!dept.id"
          type="danger"
          plain
          icon="el-icon-delete"
          @click="openDeptManagement"
        >删除</el-button>
      </div>
    </dept-details-header>

    <div v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="详细资料" name="details">
          <dept-details-info
            :dept="dept"
            :leader-user-name="leaderUserName"
            :parent-dept-name="parentDeptName"
          />
        </el-tab-pane>
        <el-tab-pane label="员工列表" name="employees" lazy>
          <dept-employee-list v-if="dept.id" :dept-id="dept.id" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { getEmployeeDeptStatistics } from '@/api/hrm/employee'
import { getDept, getSimpleDeptList } from '@/api/system/dept'
import { getSimpleUserList } from '@/api/system/user'
import DeptDetailsHeader from './DeptDetailsHeader.vue'
import DeptDetailsInfo from './DeptDetailsInfo.vue'
import DeptEmployeeList from './DeptEmployeeList.vue'

const EMPTY_STATISTICS = {
  activeCount: 0,
  fullTimeCount: 0,
  nonFullTimeCount: 0
}

export default {
  name: 'HrmDeptDetail',
  components: { DeptDetailsHeader, DeptDetailsInfo, DeptEmployeeList },
  data() {
    return {
      deptId: undefined,
      loading: true,
      dept: {},
      parentDeptName: undefined,
      leaderUserName: undefined,
      statistics: { ...EMPTY_STATISTICS },
      activeTab: 'details'
    }
  },
  created() {
    this.deptId = Number(this.$route.params.id)
    if (!Number.isSafeInteger(this.deptId) || this.deptId <= 0) {
      this.$modal.msgWarning('参数错误，部门不能为空！')
      this.close()
      return
    }
    this.getData()
  },
  methods: {
    /** 关闭详情 */
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'HrmDept' })
    },
    /** 查询组织详情 */
    async getData() {
      this.loading = true
      try {
        const responses = await Promise.all([
          getDept(this.deptId),
          getSimpleDeptList(),
          getSimpleUserList(),
          getEmployeeDeptStatistics()
        ])
        const deptData = responses[0].data
        const deptList = responses[1].data
        const userList = responses[2].data
        const statisticsList = responses[3].data
        if (!deptData) {
          this.$modal.msgWarning('部门不存在')
          this.close()
          return
        }
        this.dept = deptData
        const parentDept = deptList.find(item => item.id === deptData.parentId)
        const leaderUser = userList.find(item => item.id === deptData.leaderUserId)
        this.parentDeptName = parentDept && parentDept.name
        this.leaderUserName = leaderUser && leaderUser.nickname
        this.statistics = statisticsList.find(item => item.deptId === this.deptId) || {
          ...EMPTY_STATISTICS
        }
      } finally {
        this.loading = false
      }
    },
    /** 前往部门管理 */
    openDeptManagement() {
      this.$router.push('/system/dept')
    }
  }
}
</script>

<style scoped>
.header-actions { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
