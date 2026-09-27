<template>
  <div class="app-container">
  <doc-alert
    title="【PMS】项目中心、工作台与项目管理"
    url="https://doc.iocoder.cn/pms/pm/project/"
  />

  <el-card shadow="never">
    <el-table v-loading="loading" :data="projectList" :show-overflow-tooltip="true">
      <el-table-column label="项目名称" min-width="320" prop="name" />
      <el-table-column :formatter="dateFormatter" label="归档时间" prop="archiveTime" width="220" />
      <el-table-column fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.adminStatus && checkPermi(['pms:pm:project:update'])" type="text"
            @click="handleRestore(scope.row)"
          >
            恢复项目
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getProjectList"
    />
  </el-card>
  </div>
</template>
<script>
import * as ProjectApi from '@/api/pms/pm/project'
import { dateFormatter } from '@/utils/formatTime'
import { checkPermi } from '@/utils/permission'
import { PmsProjectSceneType, PmsProjectSortType, PmsProjectStatus } from '@/views/pms/pm/utils/constants'

export default {
  name: 'PmsProjectArchive',
  data() {
    return {
      loading: true, total: 0, projectList: [],
      queryParams: {
        pageNo: 1, pageSize: 10, name: '', sceneType: PmsProjectSceneType.ALL,
        status: PmsProjectStatus.ARCHIVED, sortType: PmsProjectSortType.ACCESS_TIME
      }
    }
  },
  mounted() { this.getProjectList() },
  methods: {
    dateFormatter,
    checkPermi,
    async getProjectList() {
      this.loading = true
      try {
        const response = await ProjectApi.getProjectPage(this.queryParams)
        this.projectList = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async handleRestore(project) {
      try {
        await this.$confirm(`确认恢复项目“${project.name}”吗？`, '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
        })
      } catch (error) {
        if (error === 'cancel' || error === 'close') return
        throw error
      }
      await ProjectApi.restoreProject(project.id)
      this.$message.success('项目已恢复')
      await this.getProjectList()
    }
  }
}
</script>
