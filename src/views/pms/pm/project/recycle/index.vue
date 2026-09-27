<template>
  <div class="app-container">
  <doc-alert
    title="【PMS】项目中心、工作台与项目管理"
    url="https://doc.iocoder.cn/pms/pm/project/"
  />

  <el-card shadow="never">
    <!-- 搜索 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      style="margin-bottom: -15px"
      label-width="68px"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input
          v-model="queryParams.name"
          style="width: 240px"
          clearable
          placeholder="请输入项目名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="projectList" :show-overflow-tooltip="true">
      <el-table-column label="项目名称" min-width="320" prop="name" />
      <el-table-column :formatter="dateFormatter" label="删除时间" prop="recycleTime" width="220" />
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.adminStatus && checkPermi(['pms:pm:project:update'])" type="text"
            @click="handleRestore(scope.row)"
          >
            恢复项目
          </el-button>
          <el-button
            v-if="scope.row.ownerStatus && checkPermi(['pms:pm:project:delete'])" type="text" class="delete-project"
            @click="handleDelete(scope.row)"
          >
            彻底删除
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
import { Icon } from '@/components/Icon'
import { PmsProjectSceneType, PmsProjectSortType, PmsProjectStatus } from '@/views/pms/pm/utils/constants'

export default {
  name: 'PmsProjectRecycle',
  components: { Icon },
  data() {
    return {
      loading: true, total: 0, projectList: [],
      queryParams: {
        pageNo: 1, pageSize: 10, name: '', sceneType: PmsProjectSceneType.ALL,
        status: PmsProjectStatus.RECYCLED, sortType: PmsProjectSortType.ACCESS_TIME
      }
    }
  },
  mounted() { this.getProjectList() },
  methods: {
    dateFormatter,
    checkPermi,
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getProjectList()
    },
    resetQuery() {
      this.$refs.queryFormRef.resetFields()
      return this.handleQuery()
    },
    async handleDelete(project) {
      try {
        await this.$confirm(`彻底删除后不可恢复，确认删除项目“${project.name}”吗？`, '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
        })
      } catch (error) {
        if (error === 'cancel' || error === 'close') return
        throw error
      }
      await ProjectApi.deleteProject(project.id)
      this.$message.success('项目已彻底删除')
      await this.getProjectList()
    },
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
<style scoped>
.delete-project { color: #f56c6c; }
</style>
